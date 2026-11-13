package nocountry.grupo4.delta_tigre.booking;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByComplexIdOrderByCheckInAscCreatedAtAsc(UUID complexId);

    List<Booking> findByComplexIdAndStatusOrderByCheckInAscCreatedAtAsc(UUID complexId, BookingStatus status);
    Optional<Booking> findByIdAndComplexOwnerId(UUID id, UUID ownerId);

    boolean existsByComplexId(UUID complexId);
}
