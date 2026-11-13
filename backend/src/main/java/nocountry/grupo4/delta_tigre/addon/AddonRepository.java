package nocountry.grupo4.delta_tigre.addon;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddonRepository extends JpaRepository<Addon, UUID> {

    List<Addon> findByComplexIdOrderByNameAsc(UUID complexId);

    List<Addon> findByComplexIdAndActiveTrue(UUID complexId);
    Optional<Addon> findByIdAndComplexOwnerId(UUID id, UUID ownerId);

    @Query("select count(ba) > 0 from BookingAddon ba where ba.addon.id = :addonId")
    boolean isUsedInBookings(@Param("addonId") UUID addonId);
}
