package nocountry.grupo4.delta_tigre.booking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;

public record BookingDetailResponse(UUID id, UUID complexId, LocalDate checkIn, LocalDate checkOut,
                                    BookingStatus status, String guestName,
                                    String guestIdentificationType, String guestIdentificationNumber,
                                    String guestEmail, String guestPhone, String preferences,
                                    Set<Allergy> allergies, String otherAllergies,
                                    List<BookingAddonResponse> addons, BigDecimal addonsTotal,
                                    List<BoatRequestResponse> boatRequests, LocalDateTime createdAt) {

    public static BookingDetailResponse from(Booking b, List<BookingAddonResponse> addons,
                                             BigDecimal addonsTotal, List<BoatRequestResponse> boatRequests) {
        return new BookingDetailResponse(b.getId(), b.getComplex().getId(), b.getCheckIn(), b.getCheckOut(),
                b.getStatus(), b.getGuestName(), b.getGuestIdentificationType(),
                b.getGuestIdentificationNumber(), b.getGuestEmail(), b.getGuestPhone(), b.getPreferences(),
                new TreeSet<>(b.getAllergies()), b.getOtherAllergies(), addons, addonsTotal,
                boatRequests, b.getCreatedAt());
    }
}