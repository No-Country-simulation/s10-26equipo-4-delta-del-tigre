package nocountry.grupo4.delta_tigre.complex;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateComplexRequest(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "Cabañas del Río",
                description = "2 a 150 caracteres. Solo letras latinas, números, espacios, apóstrofes, puntos, guiones y &")
        @NotBlank(message = "El nombre del complejo es obligatorio")
        @Size(min = 2, max = 150, message = "El nombre debe tener entre 2 y 150 caracteres")
        @Pattern(regexp = ComplexValidation.NAME_REGEX,
                message = "El nombre solo admite letras latinas, números, espacios, apóstrofes, puntos, guiones y &, sin espacios al inicio ni al final")
        String name,

        @Schema(example = "Arroyo Gambado 123, Delta del Tigre",
                description = "Opcional. 5 a 255 caracteres. Letras latinas, números, espacios y . , # / ° ' -")
        @Size(min = 5, max = 255, message = "La dirección debe tener entre 5 y 255 caracteres")
        @Pattern(regexp = ComplexValidation.ADDRESS_REGEX,
                message = "La dirección contiene caracteres no permitidos o espacios al inicio o al final")
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