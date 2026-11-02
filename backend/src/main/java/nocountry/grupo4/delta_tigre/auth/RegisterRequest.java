package nocountry.grupo4.delta_tigre.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "Ana Perez",
                description = "Solo letras, espacios, apóstrofes y guiones. Mínimo 2 caracteres")
        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 120, message = "El nombre debe tener al menos 2 caracteres")
        @Pattern(regexp = "^[\\p{IsLatin}\\p{M}]+(?:[ '-][\\p{IsLatin}\\p{M}]+)*$",
                message = "El nombre solo puede contener letras, espacios, apóstrofes y guiones")
        String name,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "ana@mail.com")
        @NotBlank(message = "El correo es obligatorio")
        @Size(max = 160, message = "El correo es demasiado largo")
        @Pattern(regexp = "^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+$",
                message = "El correo no tiene un formato válido")
        String email,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "clave-segura-1",
                description = "Entre 8 y 72 caracteres, sin espacios ni caracteres no latinos")
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        @Pattern(regexp = "^[\\x21-\\x7E]*$",
                message = "La contraseña no puede contener espacios ni caracteres no latinos")
        String password) {}