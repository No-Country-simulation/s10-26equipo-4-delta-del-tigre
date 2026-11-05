package nocountry.grupo4.delta_tigre.addon;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UpdateAddonStatusRequest(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "false",
        description = "true para activar el adicional, false para desactivarlo")
        @NotNull(message = "El estado es obligatorio")
        Boolean active) {}
