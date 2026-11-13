package nocountry.grupo4.delta_tigre.complex;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Abre o cierra el complejo. Un complejo cerrado no acepta nuevas reservas desde el onboarding")
public record UpdateComplexStatusRequest(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "true",
                description = "true = abierto, false = cerrado")
        @NotNull(message = "El estado es obligatorio") Boolean open) {}