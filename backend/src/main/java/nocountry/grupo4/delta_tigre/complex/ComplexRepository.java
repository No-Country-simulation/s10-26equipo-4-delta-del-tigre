package nocountry.grupo4.delta_tigre.complex;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ComplexRepository extends JpaRepository<Complex, UUID> {
    boolean existsBySlug(String slug);
    List<Complex> findByOwnerIdOrderByNameAsc(UUID ownerId);
}
