package nocountry.grupo4.delta_tigre.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Set;

public record BookingRequest(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "2026-12-10")
        @NotNull(message = "El check-in es obligatorio")
        LocalDate checkIn,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "2026-12-13",
                description = "Debe ser posterior al check-in")
        @NotNull(message = "El check-out es obligatorio")
        LocalDate checkOut,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "Juan Gómez")
        @NotBlank(message = "El nombre del huésped es obligatorio")
        @Size(max = 150, message = "El nombre del huésped es demasiado largo")
        String guestName,

        @Schema(example = "DNI")
        @Size(max = 20, message = "El tipo de documento es demasiado largo")
        String guestIdentificationType,

        @Schema(example = "30123456")
        @Size(max = 40, message = "El número de documento es demasiado largo")
        String guestIdentificationNumber,

        @Schema(example = "juan@mail.com")
        @Email(message = "El correo del huésped no tiene un formato válido")
        @Size(max = 180, message = "El correo del huésped es demasiado largo")
        String guestEmail,

        @Schema(example = "+54 9 351 555 1234")
        @Size(max = 40, message = "El teléfono es demasiado largo")
        String guestPhone,

        @Schema(example = "Llegamos en la lancha de las 15")
        @Size(max = 1000, message = "Las preferencias son demasiado largas")
        String preferences,

        @Schema(description = "GLUTEN, LACTOSA, MANI, FRUTOS_SECOS, HUEVO, SOJA, MARISCOS, PESCADO")
        Set<Allergy> allergies,

        @Schema(example = "Kiwi")
        @Size(max = 500, message = "El detalle de otras alergias es demasiado largo")
        String otherAllergies) {}