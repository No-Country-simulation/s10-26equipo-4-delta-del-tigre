package nocountry.grupo4.delta_tigre.booking;

import java.time.LocalDate;
import java.util.UUID;

public record BookingSummaryResponse(UUID id, UUID complexId, String guestName,
                                     LocalDate checkIn, LocalDate checkOut, BookingStatus status) {
    public static BookingSummaryResponse from(Booking b) {
        return new BookingSummaryResponse(b.getId(), b.getComplex().getId(), b.getGuestName(),
                b.getCheckIn(), b.getCheckOut(), b.getStatus());
    }
}
