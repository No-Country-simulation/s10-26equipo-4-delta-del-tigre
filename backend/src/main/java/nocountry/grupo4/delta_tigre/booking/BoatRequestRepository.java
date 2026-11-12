package nocountry.grupo4.delta_tigre.booking;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoatRequestRepository extends JpaRepository<BoatRequest, UUID> {
    List<BoatRequest> findByBookingIdOrderByCreatedAtAsc(UUID bookingId);
    Optional<BoatRequest> findByBookingId(UUID bookingId);
}
