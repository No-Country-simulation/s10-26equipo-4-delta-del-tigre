package nocountry.grupo4.delta_tigre.booking;

import java.math.BigDecimal;
import java.util.UUID;

public record OnboardingResponse(
        UUID bookingId,
        String status,
        BigDecimal total,
        PaymentInfo paymentInfo
) {
    public record PaymentInfo(String accountHolder, String aliasCbu, String bank) {}
}
