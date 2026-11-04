package nocountry.grupo4.delta_tigre.complex;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateComplexRequest(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "Cabañas del Río")
        @NotBlank(message = "El nombre del complejo es obligatorio")
        @Size(max = 150, message = "El nombre es demasiado largo")
        String name,

        @Schema(example = "Arroyo Gambado 123, Delta del Tigre")
        @Size(max = 255, message = "La dirección es demasiado larga")
        String address,

        @Schema(example = "Ana Perez")
        @Size(max = 150, message = "El titular es demasiado largo")
        String accountHolder,

        @Schema(example = "hostflow.delta",
                description = "Alias (6 a 20 caracteres: letras, números, puntos o guiones) o CBU de 22 dígitos")
        @Pattern(regexp = "^(\\d{22}|[A-Za-z0-9.-]{6,20})$",
                message = "El alias debe tener entre 6 y 20 caracteres (letras, números, puntos o guiones) o ser un CBU de 22 dígitos")
        String aliasCbu,

        @Schema(example = "Banco Nación")
        @Size(max = 100, message = "El nombre del banco es demasiado largo")
        String bank) {}