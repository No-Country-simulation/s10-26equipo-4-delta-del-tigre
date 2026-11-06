package nocountry.grupo4.delta_tigre.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface BookingAddonRepository extends JpaRepository<BookingAddon, UUID> {

    @Query("select ba from BookingAddon ba join fetch ba.addon a "
            + "where ba.booking.id = :bookingId order by a.name asc")
    List<BookingAddon> findByBookingIdWithAddon(@Param("bookingId") UUID bookingId);
}