package nocountry.grupo4.delta_tigre.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Schema(description = "Ficha del huésped. Los campos opcionales se omiten o se envían como null, nunca como \"\"")
public record OnboardingRequest(

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "Ana Perez")
        @NotBlank(message = "El nombre es obligatorio")
        @Pattern(regexp = BookingValidation.PERSON_NAME_REGEX,
                message = "El nombre contiene caracteres no permitidos o tiene una longitud inválida")
        String guestName,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "ana@mail.com")
        @NotBlank(message = "El email es obligatorio")
        @Pattern(regexp = BookingValidation.EMAIL_REGEX, message = "El email no es válido")
        String guestEmail,

        @Schema(example = "+5491123456789", description = "Opcional, pero obligatorio si se solicita bote")
        @Pattern(regexp = BookingValidation.PHONE_REGEX, message = "El teléfono no es válido")
        String guestPhone,

        @Schema(description = "Opcional")
        @Pattern(regexp = BookingValidation.ID_TYPE_REGEX, message = "El tipo de documento no es válido")
        String guestIdentificationType,

        @Schema(description = "Opcional")
        @Pattern(regexp = BookingValidation.ID_NUMBER_REGEX, message = "El número de documento no es válido")
        String guestIdentificationNumber,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "2027-01-10",
                description = "Hoy o una fecha futura")
        @NotNull(message = "La fecha de entrada es obligatoria")
        @FutureOrPresent(message = "La fecha de entrada no puede ser pasada")
        LocalDate checkIn,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "2027-01-12",
                description = "Posterior a la fecha de entrada")
        @NotNull(message = "La fecha de salida es obligatoria")
        LocalDate checkOut,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "2", description = "De 1 a 10")
        @NotNull(message = "La cantidad de huéspedes es obligatoria")
        @Min(value = 1, message = "Debe haber al menos 1 huésped")
        @Max(value = 10, message = "La cantidad máxima de huéspedes es 10")
        Integer guestsCount,

        @Schema(example = "Cama matrimonial", description = "Opcional")
        @Size(max = 1000, message = "Las preferencias no pueden superar los 1000 caracteres")
        @Pattern(regexp = BookingValidation.FREE_TEXT_REGEX,
                message = "Las preferencias contienen caracteres no permitidos")
        String preferences,

        @Schema(description = "Opcional")
        Set<Allergy> allergies,

        @Schema(description = "Opcional")
        @Size(max = 500, message = "El detalle de otras alergias no puede superar los 500 caracteres")
        @Pattern(regexp = BookingValidation.FREE_TEXT_REGEX,
                message = "El detalle de otras alergias contiene caracteres no permitidos")
        String otherAllergies,

        @Schema(description = "Opcional. Adicionales activos del mismo complejo; usar ids reales del GET público")
        @Valid
        List<AddonSelection> addons,

        @Schema(description = "Opcional. Solicitud de cotización de bote")
        @Valid
        BoatData boat
) {

    public record AddonSelection(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Id de un adicional activo del complejo")
            @NotNull(message = "El addon es obligatorio")
            UUID addonId,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "1", description = "De 1 a 50")
            @NotNull(message = "La cantidad es obligatoria")
            @Min(value = 1, message = "La cantidad mínima es 1")
            @Max(value = 50, message = "La cantidad máxima es 50")
            Integer quantity
    ) {}

    public record BoatData(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "2027-01-10T09:00:00",
                    description = "Fecha y hora de salida; tiene que ser futura")
            @NotNull(message = "La fecha y hora de salida del bote son obligatorias")
            @Future(message = "La salida del bote debe ser futura")
            LocalDateTime departureAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "2027-01-12T17:00:00",
                    description = "Fecha y hora de regreso; posterior a la salida")
            @NotNull(message = "La fecha y hora de regreso del bote son obligatorias")
            LocalDateTime returnAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "2",
                    description = "De 1 a 10 y no mayor a la cantidad de huéspedes")
            @NotNull(message = "La cantidad de pasajeros es obligatoria")
            @Min(value = 1, message = "Debe haber al menos 1 pasajero")
            @Max(value = 10, message = "La cantidad máxima de pasajeros es 10")
            Integer passengers,

            @Schema(example = "Muelle principal", description = "Opcional. Texto libre de hasta 200 caracteres")
            @Size(max = 200, message = "El punto de salida no puede superar los 200 caracteres")
            @Pattern(regexp = BookingValidation.FREE_TEXT_REGEX,
                    message = "El punto de salida contiene caracteres no permitidos")
            String pickupPoint,

            @Schema(example = "Llevamos equipaje", description = "Opcional")
            @Size(max = 500, message = "Los comentarios no pueden superar los 500 caracteres")
            @Pattern(regexp = BookingValidation.FREE_TEXT_REGEX,
                    message = "Los comentarios contienen caracteres no permitidos")
            String comments
    ) {

        @AssertTrue(message = "El regreso del bote debe ser posterior a la salida")
        public boolean isReturnAfterDeparture() {
            return departureAt == null || returnAt == null || returnAt.isAfter(departureAt);
        }
    }

    @AssertTrue(message = "La fecha de salida debe ser posterior a la de entrada")
    public boolean isDatesValid() {
        return checkIn == null || checkOut == null || checkOut.isAfter(checkIn);
    }

    @AssertTrue(message = "El teléfono es obligatorio para solicitar el bote")
    public boolean isPhoneValidForBoat() {
        return boat == null || (guestPhone != null && !guestPhone.isBlank());
    }

    @AssertTrue(message = "Los pasajeros del bote no pueden superar la cantidad de huéspedes")
    public boolean isPassengersWithinGuests() {
        return boat == null || guestsCount == null || boat.passengers() == null
                || boat.passengers() <= guestsCount;
    }
}