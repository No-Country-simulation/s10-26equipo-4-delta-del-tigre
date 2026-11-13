package nocountry.grupo4.delta_tigre.addon;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resultado de eliminar un adicional")
public record DeleteAddonResponse(
        @Schema(description = "true si se borró de verdad; false si ya estaba en reservas y solo se desactivó")
        boolean deleted,

        @Schema(description = "Adicional desactivado (solo cuando deleted es false); null si se borró")
        AddonResponse addon) {}