package nocountry.grupo4.delta_tigre.complex;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdatePaymentInfoRequest(
        @NotBlank(message = "El titular de la cuenta es obligatorio")
        @Pattern(regexp = ComplexValidation.NAME_REGEX,
        message = "El titular continene caracteres no permitidos o tiene una longitud invalida")
        String accountHolder,

        @NotBlank(message = "El alias o CBU es obligatorio")
        @Pattern(regexp = ComplexValidation.ALIAS_CBU_REGEX,
        message = "Ingresa un CBU de 22 digitos o un alias de 6 a 20 caracteres (letras, numeros, punto o guion)")
        String aliasCbu,

        @NotBlank(message = "El banco es obligatorio")
        @Pattern(regexp = ComplexValidation.BANK_NAME_REGEX,
                message = "El nombre del banco contiene caracteres no permitidos o tiene una longitud invalida")
        String bank
) {}
