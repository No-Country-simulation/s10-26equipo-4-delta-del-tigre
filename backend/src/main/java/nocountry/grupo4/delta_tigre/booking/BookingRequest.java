package nocountry.grupo4.delta_tigre.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

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

        @NotBlank(message = "El nombre del huésped es obligatorio")
        @Size(min = 2, max = 120, message = "El nombre del huésped debe tener entre 2 y 120 caracteres")
        @Pattern(regexp = BookingValidation.PERSON_NAME_REGEX,
                message = "El nombre del huésped solo puede contener letras, espacios, apóstrofes y guiones")
        String guestName,

        @Pattern(regexp = BookingValidation.ID_TYPE_REGEX, message = "El tipo de documento solo admite letras (2 a 20)")
        String guestIdentificationType,

        @Pattern(regexp = BookingValidation.ID_NUMBER_REGEX,
                message = "El número de documento debe tener de 5 a 20 caracteres (letras, números, puntos o guiones)")
        String guestIdentificationNumber,

        @Size(max = 180, message = "El correo del huésped es demasiado largo")
        @Pattern(regexp = BookingValidation.EMAIL_REGEX, message = "El correo del huésped no tiene un formato válido")
        String guestEmail,

        @Pattern(regexp = BookingValidation.PHONE_REGEX,
                message = "El teléfono solo admite números, espacios, paréntesis, guiones y un + inicial (7 a 20 caracteres)")
        String guestPhone,

        @Size(min = 3, max = 1000, message = "Las preferencias deben tener entre 3 y 1000 caracteres")
        @Pattern(regexp = BookingValidation.FREE_TEXT_REGEX, message = "Las preferencias contienen caracteres no permitidos")
        String preferences,

        @Schema(description = "GLUTEN, LACTOSA, MANI, FRUTOS_SECOS, HUEVO, SOJA, MARISCOS, PESCADO")
        Set<Allergy> allergies,

        @Size(min = 3, max = 500, message = "El detalle de otras alergias debe tener entre 3 y 500 caracteres")
        @Pattern(regexp = BookingValidation.FREE_TEXT_REGEX, message = "El detalle de otras alergias contiene caracteres no permitidos")
        String otherAllergies) {}