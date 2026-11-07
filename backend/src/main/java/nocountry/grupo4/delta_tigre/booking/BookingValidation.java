package nocountry.grupo4.delta_tigre.booking;

import nocountry.grupo4.delta_tigre.addon.AddonValidation;

public final class BookingValidation {

    private BookingValidation() {}

    public static final String PERSON_NAME_REGEX = "^[\\p{IsLatin}\\p{M}]+(?:[ '-][\\p{IsLatin}\\p{M}]+)*$";
    public static final String EMAIL_REGEX = "^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+$";
    public static final String PHONE_REGEX = "^\\+?[0-9][0-9 ()-]{5,18}[0-9]$";
    public static final String ID_TYPE_REGEX = "^\\p{IsLatin}{2,20}$";
    public static final String ID_NUMBER_REGEX = "^[A-Za-z0-9.-]{5,20}$";
    public static final String FREE_TEXT_REGEX = AddonValidation.DESCRIPTION_REGEX;
}