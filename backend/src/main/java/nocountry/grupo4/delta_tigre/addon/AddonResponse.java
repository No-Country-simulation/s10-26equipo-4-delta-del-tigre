package nocountry.grupo4.delta_tigre.addon;

import java.math.BigDecimal;
import java.util.UUID;

public record AddonResponse(UUID id, UUID complexId, String name, String description,
                            BigDecimal price, String imageUrl, boolean active) {
    public static AddonResponse from (Addon a) {
        return new AddonResponse(a.getId(), a.getComplex().getId(), a.getName(),
                a.getDescription(), a.getPrice(), a.getImageUrl(), a.isActive());
    }
}