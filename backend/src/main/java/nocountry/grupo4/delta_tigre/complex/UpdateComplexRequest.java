package nocountry.grupo4.delta_tigre.complex;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Reemplaza nombre, dirección, color y logo (si se omite el logo, se quita). El slug y los datos bancarios no se modifican")
public record UpdateComplexRequest(
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

        @Schema(example = "#1A73E8",
                description = "Opcional. Un color hex, por ejemplo #1A73E8")
        @Pattern(regexp = ComplexValidation.BRAND_COLORS_REGEX,
                message = "El color de marca debe tener el formato #RRGGBB")
        String brandColors,

        @Schema(example = "https://res.cloudinary.com/demo/image/upload/v1/logo.png",
                description = "Opcional. URL del logo subido a Cloudinary (https://res.cloudinary.com/...), máximo 500 caracteres. Omitir o enviar null quita el logo; no enviar \"\"")
        @Size(max = ImageUrlValidation.MAX_URL_LENGTH, message = "La URL del logo no puede superar los 500 caracteres")
        @Pattern(regexp = ImageUrlValidation.CLOUDINARY_REGEX,
                message = "El logo debe ser una URL de Cloudinary (https://res.cloudinary.com/...)")
        String logoUrl) {}