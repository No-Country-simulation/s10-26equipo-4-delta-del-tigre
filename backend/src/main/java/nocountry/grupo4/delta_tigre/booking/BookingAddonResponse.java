package nocountry.grupo4.delta_tigre.booking;

import java.math.BigDecimal;
import java.util.UUID;

public record BookingAddonResponse(UUID addonId, String name, int quantity,
                                   BigDecimal unitPrice, BigDecimal subtotal) {

    public static BookingAddonResponse from(BookingAddon ba) {
        return new BookingAddonResponse(ba.getAddon().getId(), ba.getAddon().getName(), ba.getQuantity(),
                ba.getUnitPrice(), ba.getUnitPrice().multiply(BigDecimal.valueOf(ba.getQuantity())));
    }
}
