package nocountry.grupo4.delta_tigre.booking;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OnboardingValidationIntegrationTest {

    @Autowired
    MockMvc mvc;

    private String registerAndGetToken() throws Exception {
        String body = "{\"name\":\"Ana Perez\",\"email\":\"" + UUID.randomUUID() + "@mail.com\",\"password\":\"clave-segura-1\"}";
        String response = mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.accessToken");
    }

    private String createComplexAndGetSlug() throws Exception {
        String token = registerAndGetToken();
        String created = mvc.perform(post("/api/v1/complexes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("{\"name\":\"Onboarding " + UUID.randomUUID().toString().substring(0, 8) + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(created, "$.data.slug");
    }

    /** extra debe empezar con coma, por ejemplo ,"guestPhone":"+5493511234567" */
    private String body(String guestName, String guestEmail, String checkIn, String checkOut, String extra) {
        return "{\"guestName\":\"" + guestName + "\",\"guestEmail\":\"" + guestEmail + "\","
                + "\"checkIn\":\"" + checkIn + "\",\"checkOut\":\"" + checkOut + "\"" + extra + "}";
    }

    private void postOnboarding(String slug, String json, int expectedStatus) throws Exception {
        mvc.perform(post("/api/v1/public/complexes/" + slug + "/onboarding")
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus));
    }

    private static final String BOAT_OK =
            ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"desiredDate\":\"2099-01-10\","
                    + "\"departureTime\":\"08:30\",\"passengers\":2}";

    @Test
    void onboarding_with_invalid_guest_data_returns_400() throws Exception {
        String slug = createComplexAndGetSlug();
        postOnboarding(slug, body("", "ana@mail.com", "2099-01-10", "2099-01-12", ""), 400);
        postOnboarding(slug, body("Ana Perez", "no-es-email", "2099-01-10", "2099-01-12", ""), 400);
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12", ",\"guestPhone\":\"abc\""), 400);
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12", ",\"guestPhone\":\"\""), 400);
    }

    @Test
    void onboarding_with_invalid_dates_returns_400() throws Exception {
        String slug = createComplexAndGetSlug();
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-12", "2099-01-10", ""), 400);
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-10", ""), 400);
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2020-01-10", "2020-01-12", ""), 400);
    }

    @Test
    void onboarding_with_invalid_addons_returns_400() throws Exception {
        String slug = createComplexAndGetSlug();
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"addons\":[{\"quantity\":1}]"), 400);
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"addons\":[{\"addonId\":\"" + UUID.randomUUID() + "\",\"quantity\":0}]"), 400);
    }

    @Test
    void onboarding_with_invalid_allergy_returns_400() throws Exception {
        String slug = createComplexAndGetSlug();
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"allergies\":[\"string\"]"), 400);
    }

    @Test
    void onboarding_with_invalid_boat_returns_400() throws Exception {
        String slug = createComplexAndGetSlug();
        // bote sin telefono
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"boat\":{\"desiredDate\":\"2099-01-10\",\"departureTime\":\"08:30\",\"passengers\":2}"), 400);
        // pasajeros 0
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"desiredDate\":\"2099-01-10\","
                        + "\"departureTime\":\"08:30\",\"passengers\":0}"), 400);
        // regreso antes de la salida
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"desiredDate\":\"2099-01-10\","
                        + "\"departureTime\":\"10:00\",\"returnTime\":\"09:00\",\"passengers\":2}"), 400);
        // falta la fecha del bote
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"departureTime\":\"08:30\",\"passengers\":2}"), 400);
    }

    @Test
    void onboarding_with_valid_minimal_body_passes_validation() throws Exception {
        String slug = createComplexAndGetSlug();
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12", ""), 501);
    }

    @Test
    void onboarding_with_valid_boat_passes_validation() throws Exception {
        String slug = createComplexAndGetSlug();
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12", BOAT_OK), 501);
    }

    @Test
    void onboarding_with_unknown_slug_and_valid_body_returns_404() throws Exception {
        postOnboarding("no-existe-" + UUID.randomUUID(),
                body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12", ""), 404);
    }
}