package nocountry.grupo4.delta_tigre.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequest(
        @Schema(example = "ana@mail.com")
        @NotBlank(message = "El correo es obligatorio")
        @Pattern(regexp = "^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+$",
                message = "El correo no tiene un formato válido")
        String email,
        @Schema(example = "clave-segura-1")
        @NotBlank(message = "La contraseña es obligatoria")
        String password) {}
