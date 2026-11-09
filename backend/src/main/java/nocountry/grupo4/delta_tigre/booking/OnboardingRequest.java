package nocountry.grupo4.delta_tigre.booking;

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

public record OnboardingRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Pattern(regexp = BookingValidation.PERSON_NAME_REGEX,
                message = "El nombre contiene caracteres no permitidos o tiene una longitud inválida")
        String guestName,

        @NotBlank(message = "El email es obligatorio")
        @Pattern(regexp = BookingValidation.EMAIL_REGEX, message = "El email no es válido")
        String guestEmail,

        @Pattern(regexp = BookingValidation.PHONE_REGEX, message = "El teléfono no es válido")
        String guestPhone,

        @Pattern(regexp = BookingValidation.ID_TYPE_REGEX, message = "El tipo de documento no es válido")
        String guestIdentificationType,

        @Pattern(regexp = BookingValidation.ID_NUMBER_REGEX, message = "El número de documento no es válido")
        String guestIdentificationNumber,

        @NotNull(message = "La fecha de entrada es obligatoria")
        @FutureOrPresent(message = "La fecha de entrada no puede ser pasada")
        LocalDate checkIn,

        @NotNull(message = "La fecha de salida es obligatoria")
        LocalDate checkOut,

        @NotNull(message = "La cantidad de huéspedes es obligatoria")
        @Min(value = 1, message = "Debe haber al menos 1 huésped")
        @Max(value = 10, message = "La cantidad máxima de huéspedes es 10")
        Integer guestsCount,

        @Size(max = 1000, message = "Las preferencias no pueden superar los 1000 caracteres")
        @Pattern(regexp = BookingValidation.FREE_TEXT_REGEX,
                message = "Las preferencias contienen caracteres no permitidos")
        String preferences,

        Set<Allergy> allergies,

        @Size(max = 500, message = "El detalle de otras alergias no puede superar los 500 caracteres")
        @Pattern(regexp = BookingValidation.FREE_TEXT_REGEX,
                message = "El detalle de otras alergias contiene caracteres no permitidos")
        String otherAllergies,

        @Valid
        List<AddonSelection> addons,

        @Valid
        BoatData boat
) {

    public record AddonSelection(
            @NotNull(message = "El addon es obligatorio")
            UUID addonId,

            @NotNull(message = "La cantidad es obligatoria")
            @Min(value = 1, message = "La cantidad mínima es 1")
            @Max(value = 50, message = "La cantidad máxima es 50")
            Integer quantity
    ) {}

    public record BoatData(
            @NotNull(message = "La fecha y hora de salida del bote son obligatorias")
            @Future(message = "La salida del bote debe ser futura")
            LocalDateTime departureAt,

            @NotNull(message = "La fecha y hora de regreso del bote son obligatorias")
            LocalDateTime returnAt,

            @NotNull(message = "La cantidad de pasajeros es obligatoria")
            @Min(value = 1, message = "Debe haber al menos 1 pasajero")
            @Max(value = 10, message = "La cantidad máxima de pasajeros es 10")
            Integer passengers,

            @Size(max = 200, message = "El punto de salida no puede superar los 200 caracteres")
            @Pattern(regexp = BookingValidation.FREE_TEXT_REGEX,
                    message = "El punto de salida contiene caracteres no permitidos")
            String pickupPoint,

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