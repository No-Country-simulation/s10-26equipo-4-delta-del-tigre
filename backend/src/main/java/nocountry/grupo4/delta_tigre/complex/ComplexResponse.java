package nocountry.grupo4.delta_tigre.complex;

import java.util.UUID;

public record ComplexResponse(
        UUID id,
        String name,
        String slug,
        String address,
        String logoUrl,
        String brandColors,
        String accountHolder,
        String aliasCbu,
        String bank
) {
    public static ComplexResponse from(Complex c) {
        return new ComplexResponse(c.getId(), c.getName(), c.getSlug(), c.getAddress(),
                c.getLogoUrl(), c.getBrandColors(), c.getAccountHolder(), c.getAliasCbu(), c.getBank());
    }
}
