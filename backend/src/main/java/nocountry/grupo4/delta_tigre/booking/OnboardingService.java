package nocountry.grupo4.delta_tigre.booking;

import lombok.RequiredArgsConstructor;
import nocountry.grupo4.delta_tigre.addon.Addon;
import nocountry.grupo4.delta_tigre.addon.AddonRepository;
import nocountry.grupo4.delta_tigre.complex.Complex;
import nocountry.grupo4.delta_tigre.complex.ComplexRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final ComplexRepository complexRepository;
    private final AddonRepository addonRepository;
    private final BookingRepository bookingRepository;
    private final BookingAddonRepository bookingAddonRepository;

    @Transactional
    public OnboardingResponse create(String slug, OnboardingRequest req) {
        Complex complex = complexRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complejo no encontrado"));

        Booking booking = new Booking();
        booking.setComplex(complex);
        booking.setCheckIn(req.checkIn());
        booking.setCheckOut(req.checkOut());
        booking.setStatus(BookingStatus.PENDIENTE);
        booking.setGuestName(req.guestName().trim());
        booking.setGuestEmail(req.guestEmail().trim());
        booking.setGuestPhone(req.guestPhone());
        booking.setGuestIdentificationType(req.guestIdentificationType());
        booking.setGuestIdentificationNumber(req.guestIdentificationNumber());
        booking.setPreferences(req.preferences());
        booking.setOtherAllergies(req.otherAllergies());
        if (req.allergies() != null) {
            booking.setAllergies(new HashSet<>(req.allergies()));
        }
        booking = bookingRepository.save(booking);

        Map<UUID, Integer> merged = new LinkedHashMap<>();
        if (req.addons() != null) {
            for (OnboardingRequest.AddonSelection sel : req.addons()) {
                merged.merge(sel.addonId(), sel.quantity(), Integer::sum);
            }
        }

        BigDecimal total = BigDecimal.ZERO;
        for (Map.Entry<UUID, Integer> entry : merged.entrySet()) {
            Addon addon = addonRepository.findById(entry.getKey())
                    .filter(a -> a.isActive() && a.getComplex().getId().equals(complex.getId()))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Addon inválido"));

            BookingAddon line = new BookingAddon();
            line.setBooking(booking);
            line.setAddon(addon);
            line.setQuantity(entry.getValue());
            line.setUnitPrice(addon.getPrice());
            bookingAddonRepository.save(line);

            total = total.add(addon.getPrice().multiply(BigDecimal.valueOf(entry.getValue())));
        }

        return new OnboardingResponse(
                booking.getId(),
                booking.getStatus().name(),
                total,
                new OnboardingResponse.PaymentInfo(
                        complex.getAccountHolder(), complex.getAliasCbu(), complex.getBank()));
    }
}
