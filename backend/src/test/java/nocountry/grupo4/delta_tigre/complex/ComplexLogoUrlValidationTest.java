package nocountry.grupo4.delta_tigre.complex;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ComplexLogoUrlValidationTest {

    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();
    private static final String VALID_URL = "https://res.cloudinary.com/demo/image/upload/v1/logo.png";

    private static boolean logoInvalidOnCreate(String logoUrl) {
        return hasLogoViolation(VALIDATOR.validate(
                new CreateComplexRequest("Cabañas del Río", null, null, null, null, logoUrl)));
    }

    private static boolean logoInvalidOnUpdate(String logoUrl) {
        return hasLogoViolation(VALIDATOR.validate(
                new UpdateComplexRequest("Cabañas del Río", null, null, logoUrl)));
    }

    private static <T> boolean hasLogoViolation(Set<ConstraintViolation<T>> violations) {
        return violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("logoUrl"));
    }

    @Test
    void valid_cloudinary_url_is_accepted() {
        assertFalse(logoInvalidOnCreate(VALID_URL));
        assertFalse(logoInvalidOnUpdate(VALID_URL));
    }

    @Test
    void omitted_logo_is_accepted() {
        assertFalse(logoInvalidOnCreate(null));
        assertFalse(logoInvalidOnUpdate(null));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://example.com/logo.png",
            "http://res.cloudinary.com/demo/image/upload/logo.png",
            "https://res.cloudinary.com.evil.com/logo.png",
            "https://res.cloudinary.com/",
            "https://res.cloudinary.com/mi logo.png",
            "",
            "string"
    })
    void invalid_logo_is_rejected(String logoUrl) {
        assertTrue(logoInvalidOnCreate(logoUrl));
        assertTrue(logoInvalidOnUpdate(logoUrl));
    }

    @Test
    void too_long_logo_is_rejected() {
        String tooLong = VALID_URL + "a".repeat(500);
        assertTrue(logoInvalidOnCreate(tooLong));
        assertTrue(logoInvalidOnUpdate(tooLong));
    }
}
