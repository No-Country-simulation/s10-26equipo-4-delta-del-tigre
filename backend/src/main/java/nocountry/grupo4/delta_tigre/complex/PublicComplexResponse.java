package nocountry.grupo4.delta_tigre.complex;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PublicComplexResponse(
        UUID id,
        String name,
        String slug,
        String address,
        String logoUrl,
        String brandColors,
        List<PublicAddonResponse> addons,
        Boolean open
) {
    public record PublicAddonResponse(UUID id, String name, String description, BigDecimal price) {}
}
