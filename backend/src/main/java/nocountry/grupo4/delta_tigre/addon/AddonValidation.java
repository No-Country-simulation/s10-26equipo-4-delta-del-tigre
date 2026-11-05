package nocountry.grupo4.delta_tigre.addon;

public final class AddonValidation {

    private AddonValidation() {}

    public static final String NAME_REGEX =
            "^[\\p{IsLatin}0-9](?:[\\p{IsLatin}\\p{M}0-9 '.,&()-]*[\\p{IsLatin}\\p{M}0-9.)])?$";

    public static final String DESCRIPTION_REGEX =
            "^[\\p{IsLatin}0-9¿¡](?:[\\p{IsLatin}\\p{M}0-9 '.,;:&()!?¿¡/%-]*[\\p{IsLatin}\\p{M}0-9.!?)%])?$";
}
