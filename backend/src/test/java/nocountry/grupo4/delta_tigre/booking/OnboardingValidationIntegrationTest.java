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
        String response = mvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.accessToken");
    }

    private String createComplexAndGetSlug() throws Exception {
        String token = registerAndGetToken();
        String created = mvc.perform(post("/api/complexes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("{\"name\":\"Onboarding " + UUID.randomUUID().toString().substring(0, 8) + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(created, "$.data.slug");
    }

    /** extra debe empezar con coma, por ejemplo ,"guestPhone":"+5493511234567" (incluye guestsCount 3) */
    private String body(String guestName, String guestEmail, String checkIn, String checkOut, String extra) {
        return "{\"guestName\":\"" + guestName + "\",\"guestEmail\":\"" + guestEmail + "\","
                + "\"checkIn\":\"" + checkIn + "\",\"checkOut\":\"" + checkOut + "\",\"guestsCount\":3"
                + extra + "}";
    }

    /** Body valido pero con control total sobre guestsCount: guestsJson vacio, o ,"guestsCount":N */
    private String bodyGuests(String guestsJson, String extra) {
        return "{\"guestName\":\"Ana Perez\",\"guestEmail\":\"ana@mail.com\","
                + "\"checkIn\":\"2099-01-10\",\"checkOut\":\"2099-01-12\"" + guestsJson + extra + "}";
    }

    private void postOnboarding(String slug, String json, int expectedStatus) throws Exception {
        mvc.perform(post("/api/public/complexes/" + slug + "/onboarding")
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus));
    }

    private static final String BOAT_OK =
            ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"departureAt\":\"2099-01-10T08:30:00\","
                    + "\"returnAt\":\"2099-01-10T18:00:00\",\"passengers\":2}";

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
    void onboarding_with_invalid_guests_count_returns_400() throws Exception {
        String slug = createComplexAndGetSlug();
        postOnboarding(slug, bodyGuests("", ""), 400);
        postOnboarding(slug, bodyGuests(",\"guestsCount\":0", ""), 400);
        postOnboarding(slug, bodyGuests(",\"guestsCount\":11", ""), 400);
    }

    @Test
    void onboarding_with_limit_guests_count_passes_validation() throws Exception {
        String slug = createComplexAndGetSlug();
        postOnboarding(slug, bodyGuests(",\"guestsCount\":1", ""), 201);
        postOnboarding(slug, bodyGuests(",\"guestsCount\":10", ""), 201);
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
                ",\"boat\":{\"departureAt\":\"2099-01-10T08:30:00\",\"returnAt\":\"2099-01-10T18:00:00\",\"passengers\":2}"), 400);
        // pasajeros 0
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"departureAt\":\"2099-01-10T08:30:00\","
                        + "\"returnAt\":\"2099-01-10T18:00:00\",\"passengers\":0}"), 400);
        // regreso antes de la salida
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"departureAt\":\"2099-01-10T10:00:00\","
                        + "\"returnAt\":\"2099-01-10T09:00:00\",\"passengers\":2}"), 400);
        // falta la salida del bote
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"returnAt\":\"2099-01-10T18:00:00\",\"passengers\":2}"), 400);
        // falta el regreso del bote
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"departureAt\":\"2099-01-10T08:30:00\",\"passengers\":2}"), 400);
        // salida del bote en el pasado
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"departureAt\":\"2020-01-10T08:30:00\","
                        + "\"returnAt\":\"2020-01-10T18:00:00\",\"passengers\":2}"), 400);
    }

    @Test
    void onboarding_with_boat_passengers_over_guests_returns_400() throws Exception {
        String slug = createComplexAndGetSlug();
        // 2 huespedes y 3 pasajeros
        postOnboarding(slug, bodyGuests(",\"guestsCount\":2",
                ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"departureAt\":\"2099-01-10T08:30:00\","
                        + "\"returnAt\":\"2099-01-10T18:00:00\",\"passengers\":3}"), 400);
    }

    @Test
    void onboarding_with_too_long_pickup_point_returns_400() throws Exception {
        String slug = createComplexAndGetSlug();
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"departureAt\":\"2099-01-10T08:30:00\","
                        + "\"returnAt\":\"2099-01-10T18:00:00\",\"passengers\":2,"
                        + "\"pickupPoint\":\"" + "a".repeat(201) + "\"}"), 400);
    }

    @Test
    void onboarding_with_valid_minimal_body_passes_validation() throws Exception {
        String slug = createComplexAndGetSlug();
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12", ""), 201);
    }

    @Test
    void onboarding_with_valid_boat_passes_validation() throws Exception {
        String slug = createComplexAndGetSlug();
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12", BOAT_OK), 201);
    }

    @Test
    void onboarding_with_valid_boat_and_pickup_point_passes_validation() throws Exception {
        String slug = createComplexAndGetSlug();
        postOnboarding(slug, body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12",
                ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"departureAt\":\"2099-01-10T08:30:00\","
                        + "\"returnAt\":\"2099-01-10T18:00:00\",\"passengers\":2,"
                        + "\"pickupPoint\":\"Muelle de Tigre\"}"), 201);
    }

    @Test
    void onboarding_with_unknown_slug_and_valid_body_returns_404() throws Exception {
        postOnboarding("no-existe-" + UUID.randomUUID(),
                body("Ana Perez", "ana@mail.com", "2099-01-10", "2099-01-12", ""), 404);
    }
}