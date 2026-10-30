package nocountry.grupo4.delta_tigre.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 160) String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @Size(max = 40) String phone,
        @Size(max = 80) String country,
        @Size(max = 20) String identificationType,
        @Size(max = 40) String identificationNumber) {}
