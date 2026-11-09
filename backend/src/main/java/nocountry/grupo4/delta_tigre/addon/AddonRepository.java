package nocountry.grupo4.delta_tigre.addon;

import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddonRepository extends JpaRepository<Addon, UUID> {

    List<Addon> findByComplexIdOrderByNameAsc(UUID complexId);

    List<Addon> findByComplexIdAndActiveTrue(UUID complexId);
    Optional<Addon> findByIdAndComplexOwnerId(UUID id, UUID ownerId);
}
