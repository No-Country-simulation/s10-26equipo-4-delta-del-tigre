package nocountry.grupo4.delta_tigre.booking;

import lombok.RequiredArgsConstructor;
import nocountry.grupo4.delta_tigre.complex.Complex;
import nocountry.grupo4.delta_tigre.complex.ComplexRepository;
import nocountry.grupo4.delta_tigre.security.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ComplexRepository complexRepository;
    private final BookingAddonRepository bookingAddonRepository;
    private final BoatRequestRepository boatRequestRepository;

    @Transactional
    public BookingResponse create(UUID complexId, BookingRequest r) {
        Complex complex = findOwnedComplex(complexId);
        if (!r.checkOut().isAfter(r.checkIn())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El check-out debe ser posterior al check-in");
        }
        Booking b = new Booking();
        b.setComplex(complex);
        b.setCheckIn(r.checkIn());
        b.setCheckOut(r.checkOut());
        b.setStatus(BookingStatus.PENDIENTE);
        b.setGuestName(r.guestName().trim());
        b.setGuestIdentificationType(r.guestIdentificationType());
        b.setGuestIdentificationNumber(r.guestIdentificationNumber());
        b.setGuestEmail(r.guestEmail());
        b.setGuestPhone(r.guestPhone());
        b.setPreferences(r.preferences());
        b.setOtherAllergies(r.otherAllergies());
        b.setAllergies(toAllergySet(r.allergies()));
        return  BookingResponse.from(bookingRepository.save(b));
    }
    private Set<Allergy> toAllergySet(Set<Allergy> allergies) {
        if (allergies == null) {
            return new HashSet<>();
        }
        return allergies.stream().filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
    }
    private Complex findOwnedComplex(UUID complexId){
        return complexRepository.findByIdAndOwnerId(complexId, SecurityUtils.currentOwnerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complejo no encontrado"));
    }

    @Transactional(readOnly = true)
    public List<BookingSummaryResponse> list(UUID complexId, BookingStatus status) {
        findOwnedComplex(complexId);
        List<Booking> bookings = status == null
                ? bookingRepository.findByComplexIdOrderByCheckInAscCreatedAtAsc(complexId)
                : bookingRepository.findByComplexIdAndStatusOrderByCheckInAscCreatedAtAsc(complexId, status);
        return bookings.stream().map(BookingSummaryResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public BookingDetailResponse get(UUID id) {
        Booking booking = findOwnedBooking(id);
        List<BookingAddonResponse> addons = bookingAddonRepository.findByBookingIdWithAddon(id).stream()
                .map(BookingAddonResponse::from)
                .toList();
        BigDecimal addonsTotal = addons.stream()
                .map(BookingAddonResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<BoatRequestResponse> boatRequests = boatRequestRepository.findByBookingIdOrderByCreatedAtAsc(id).stream()
                .map(BoatRequestResponse::from)
                .toList();
        return BookingDetailResponse.from(booking, addons, addonsTotal, boatRequests);
    }

    private Booking findOwnedBooking(UUID id) {
        return bookingRepository.findByIdAndComplexOwnerId(id, SecurityUtils.currentOwnerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
    }

    @Transactional
    public BookingResponse updateStatus(UUID id, UpdateBookingStatusRequest r) {
        Booking booking = findOwnedBooking(id);
        booking.setStatus(r.status());
        return BookingResponse.from(bookingRepository.save(booking));
    }
}
