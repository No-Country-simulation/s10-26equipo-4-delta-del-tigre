package nocountry.grupo4.delta_tigre.addon;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record AddonRequest(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "Desayuno en el muelle",
                description = "2 a 80 caracteres. Solo letras latinas, números, espacios y . , ' & ( ) -")
        @NotBlank(message = "El nombre del adicional es obligatorio")
        @Size(min = 2, max = 80, message = "El nombre debe tener entre 2 y 80 caracteres")
        @Pattern(regexp = AddonValidation.NAME_REGEX,
                message = "El nombre solo admite letras latinas, números, espacios y . , ' & ( ) -, sin espacios al inicio ni al final")
        String name,

        @Schema(example = "Desayuno para dos personas con productos de la isla",
                description = "Opcional. 3 a 250 caracteres. Letras latinas, números, espacios y . , ; : ' & ( ) ! ? ¿ ¡ / %")
        @Size(min = 3, max = 250, message = "La descripción debe tener entre 3 y 250 caracteres")
        @Pattern(regexp = AddonValidation.DESCRIPTION_REGEX,
                message = "La descripción contiene caracteres no permitidos o espacios al inicio o al final")
        String description,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "15000.00")
        @NotNull(message = "El precio es obligatorio")
        @Positive(message = "El precio debe ser mayor a cero")
        @Digits(integer = 10, fraction = 2, message = "El precio admite hasta 2 decimales")
        BigDecimal price
) {
}
