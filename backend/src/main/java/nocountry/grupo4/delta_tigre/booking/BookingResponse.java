package nocountry.grupo4.delta_tigre.booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;

public record BookingResponse(UUID id, UUID complexId, LocalDate checkIn, LocalDate checkOut,
                              BookingStatus status, String guestName,
                              String guestIdentificationType, String guestIdentificationNumber,
                              String guestEmail, String guestPhone, String preferences,
                              Set<Allergy> allergies, String otherAllergies,
                              LocalDateTime createdAt) {

    public static BookingResponse from(Booking b) {
        return new BookingResponse(b.getId(), b.getComplex().getId(), b.getCheckIn(), b.getCheckOut(),
                b.getStatus(), b.getGuestName(), b.getGuestIdentificationType(),
                b.getGuestIdentificationNumber(), b.getGuestEmail(), b.getGuestPhone(),
                b.getPreferences(), new TreeSet<>(b.getAllergies()), b.getOtherAllergies(),
                b.getCreatedAt());
    }
}
