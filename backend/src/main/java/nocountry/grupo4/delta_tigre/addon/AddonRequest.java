package nocountry.grupo4.delta_tigre.addon;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record AddonRequest(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "Desayuno en el muelle")
        @NotBlank(message = "El nombre del adicional es obligatorio")
        @Size(max = 150, message = "El nombre es demasiado largo")
        String name,

        @Schema(example = "Desayuno para dos personas con productos de la isla")
        @Size(max = 500, message = "La descripción es demasiado larga")
        String description,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "15000.00")
        @NotNull(message = "El precio es obligatorio")
        @Positive(message = "El precio debe ser mayor a cero")
        @Digits(integer = 10, fraction = 2, message = "El precio admite hasta 2 decimales")
        BigDecimal price
) {
}
