package nocountry.grupo4.delta_tigre.complex;

import jakarta.validation.constraints.NotNull;

public record UpdateComplexStatusRequest(
        @NotNull(message = "El estado es obligatorio") Boolean open) {}