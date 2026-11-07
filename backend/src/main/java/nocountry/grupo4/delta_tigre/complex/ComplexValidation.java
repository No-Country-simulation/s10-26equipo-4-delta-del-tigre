package nocountry.grupo4.delta_tigre.complex;

public final class ComplexValidation {
    private ComplexValidation() {}
    public static final String NAME_REGEX =
            "^[\\p{IsLatin}0-9](?:[\\p{IsLatin}\\p{M}0-9 '.&-]*[\\p{IsLatin}\\p{M}0-9.])?$";
    public static final String ADDRESS_REGEX =
            "^[\\p{IsLatin}0-9](?:[\\p{IsLatin}\\p{M}0-9 '.,#/°-]*[\\p{IsLatin}\\p{M}0-9.])?$";

    public static final String BRAND_COLORS_REGEX = "^#[0-9A-Fa-f]{6}$";
    public static final String BANK_NAME_REGEX = "^[\\p{L}0-9 .&'-]{2,80}$";
    public static final String ALIAS_CBU_REGEX = "^(\\d{22}|[A-Za-z0-9.\\-]{6,20})$";
}