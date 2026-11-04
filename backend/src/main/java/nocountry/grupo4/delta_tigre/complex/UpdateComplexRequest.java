package nocountry.grupo4.delta_tigre.complex;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Reemplaza nombre, dirección y colores. El slug, el logo y los datos bancarios no se modifican")
public record UpdateComplexRequest(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "Cabañas del Río")
        @NotBlank(message = "El nombre del complejo es obligatorio")
        @Size(max = 150, message = "El nombre es demasiado largo")
        String name,

        @Schema(example = "Arroyo Gambado 123, Delta del Tigre")
        @Size(max = 255, message = "La dirección es demasiado larga")
        String address,

        @Schema(example = "#1A73E8,#FFFFFF", description = "Colores de la marca (hasta 100 caracteres)")
        @Size(max = 100, message = "Los colores son demasiado largos")
        String brandColors) {}