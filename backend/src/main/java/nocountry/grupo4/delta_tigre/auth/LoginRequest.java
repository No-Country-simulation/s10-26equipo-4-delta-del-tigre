package nocountry.grupo4.delta_tigre.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Schema(example = "ana@mail.com")
        @NotBlank(message = "El correo es obligatorio") @Email(message = "El correo no tiene un formato válido") String email,
        @Schema(example = "clave-segura-1")
        @NotBlank(message = "La contraseña es obligatoria") String password) {}
