package nocountry.grupo4.delta_tigre.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UpdateBookingStatusRequest(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "CONFIRMADA",
                description = "PENDIENTE, CONFIRMADA, FINALIZADA o CANCELADA")
        @NotNull(message = "El estado es obligatorio")
        BookingStatus status) {}
