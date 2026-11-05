package nocountry.grupo4.delta_tigre.addon;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AddonRepository extends JpaRepository<Addon, UUID> {
}
