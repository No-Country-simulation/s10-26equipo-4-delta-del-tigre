package nocountry.grupo4.delta_tigre.auth;

import nocountry.grupo4.delta_tigre.owner.Owner;

import java.util.UUID;

public record OwnerResponse(UUID id, String name, String email, String phone, String country,
                            String identificationType, String identificationNumber) {
    public static OwnerResponse from(Owner o) {
        return new OwnerResponse(o.getId(), o.getName(), o.getEmail(), o.getPhone(),
                o.getCountry(), o.getIdentificationType(), o.getIdentificationNumber());
    }
}
