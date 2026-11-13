package nocountry.grupo4.delta_tigre.addon;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AddonImageUrlValidationTest {

    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();
    private static final String VALID_URL = "https://res.cloudinary.com/demo/image/upload/v1/desayuno.png";

    private static boolean imageInvalid(String imageUrl) {
        Set<ConstraintViolation<AddonRequest>> violations = VALIDATOR.validate(
                new AddonRequest("Desayuno en el muelle", null, new BigDecimal("15000.00"), imageUrl));
        return violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("imageUrl"));
    }

    @Test
    void valid_cloudinary_url_is_accepted() {
        assertFalse(imageInvalid(VALID_URL));
    }

    @Test
    void omitted_image_is_accepted() {
        assertFalse(imageInvalid(null));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://example.com/desayuno.png",
            "http://res.cloudinary.com/demo/image/upload/desayuno.png",
            "https://res.cloudinary.com.evil.com/desayuno.png",
            "https://res.cloudinary.com/",
            "https://res.cloudinary.com/mi imagen.png",
            "",
            "string"
    })
    void invalid_image_is_rejected(String imageUrl) {
        assertTrue(imageInvalid(imageUrl));
    }

    @Test
    void too_long_image_is_rejected() {
        assertTrue(imageInvalid(VALID_URL + "a".repeat(500)));
    }
}