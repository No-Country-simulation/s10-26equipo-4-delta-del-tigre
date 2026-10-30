package nocountry.grupo4.delta_tigre.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "Ana Perez",
                description = "Nombre del dueño, mínimo 2 caracteres")
        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 120, message = "El nombre debe tener al menos 2 caracteres")
        @Pattern(regexp = "^\\S.*\\S$", message = "El nombre debe tener al menos 2 caracteres")
        String name,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "ana@mail.com")
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 160)
        String email,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "clave-segura-1",
                description = "Entre 8 y 72 caracteres")
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String password) {}