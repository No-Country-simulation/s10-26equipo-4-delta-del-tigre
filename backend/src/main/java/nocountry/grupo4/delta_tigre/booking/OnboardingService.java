package nocountry.grupo4.delta_tigre.booking;

import lombok.RequiredArgsConstructor;
import nocountry.grupo4.delta_tigre.addon.Addon;
import nocountry.grupo4.delta_tigre.addon.AddonRepository;
import nocountry.grupo4.delta_tigre.complex.Complex;
import nocountry.grupo4.delta_tigre.complex.ComplexRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

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
    private final BoatRequestRepository boatRequestRepository;
    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public OnboardingResponse create(String slug, OnboardingRequest req) {
        Complex complex = complexRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complejo no encontrado"));

        if (!complex.isOpen()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El alojamiento no está recibiendo reservas");
        }

        Booking booking = new Booking();
        booking.setComplex(complex);
        booking.setCheckIn(req.checkIn());
        booking.setCheckOut(req.checkOut());
        booking.setGuestsCount(req.guestsCount());
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
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "El adicional " + entry.getKey() + " no existe"));
            if (!addon.getComplex().getId().equals(complex.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El adicional " + entry.getKey() + " no pertenece a este alojamiento");
            }
            if (!addon.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El adicional " + addon.getName() + " no está disponible");
            }

            BookingAddon line = new BookingAddon();
            line.setBooking(booking);
            line.setAddon(addon);
            line.setQuantity(entry.getValue());
            line.setUnitPrice(addon.getPrice());
            bookingAddonRepository.save(line);

            total = total.add(addon.getPrice().multiply(BigDecimal.valueOf(entry.getValue())));
        }

        boolean boatRequested = req.boat() != null;
        if (boatRequested) {
            OnboardingRequest.BoatData boat = req.boat();

            BoatRequest boatRequest = new BoatRequest();
            boatRequest.setBooking(booking);
            boatRequest.setDepartureAt(boat.departureAt());
            boatRequest.setReturnAt(boat.returnAt());
            boatRequest.setPickupPoint(boat.pickupPoint());
            boatRequest.setPassengers(boat.passengers());
            boatRequest.setComments(boat.comments());
            boatRequest.setStatus(BoatRequestStatus.PENDING);

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("bookingId", booking.getId().toString());
            payload.put("complex", complex.getName());
            payload.put("guestName", booking.getGuestName());
            payload.put("guestPhone", booking.getGuestPhone());
            payload.put("guestsCount", booking.getGuestsCount());
            payload.put("departureAt", boat.departureAt().toString());
            payload.put("returnAt", boat.returnAt().toString());
            payload.put("pickupPoint", boat.pickupPoint());
            payload.put("passengers", boat.passengers());
            payload.put("comments", boat.comments());
            boatRequest.setPayloadJson(objectMapper.writeValueAsString(payload));

            boatRequestRepository.save(boatRequest);
        }

        eventPublisher.publishEvent(new BookingCreatedEvent(booking.getId()));

        OnboardingResponse.PaymentInfo paymentInfo = merged.isEmpty()
                ? null
                : new OnboardingResponse.PaymentInfo(
                complex.getAccountHolder(), complex.getAliasCbu(), complex.getBank());

        return new OnboardingResponse(
                booking.getId(),
                booking.getStatus().name(),
                total,
                boatRequested,
                paymentInfo);
    }
}