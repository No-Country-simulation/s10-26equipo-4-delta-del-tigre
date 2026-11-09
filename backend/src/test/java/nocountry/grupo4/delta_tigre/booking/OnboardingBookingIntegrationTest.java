package nocountry.grupo4.delta_tigre.booking;

import com.jayway.jsonpath.JsonPath;
import nocountry.grupo4.delta_tigre.addon.Addon;
import nocountry.grupo4.delta_tigre.addon.AddonRepository;
import nocountry.grupo4.delta_tigre.complex.Complex;
import nocountry.grupo4.delta_tigre.complex.ComplexRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OnboardingBookingIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ComplexRepository complexRepository;
    @Autowired AddonRepository addonRepository;
    @Autowired BookingRepository bookingRepository;
    @Autowired BoatRequestRepository boatRequestRepository;

    private String registerAndGetToken() throws Exception {
        String body = "{\"name\":\"Ana Perez\",\"email\":\"" + UUID.randomUUID() + "@mail.com\",\"password\":\"clave-segura-1\"}";
        String response = mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.accessToken");
    }

    private String createComplex(String token, String name) throws Exception {
        String body = """
            {
                "name": "%s",
                "accountHolder": "Maria Lopez",
                "aliasCbu": "hostflow.mp",
                "bank": "Banco Nación"
            }
            """.formatted(name);

        return mvc.perform(post("/api/v1/complexes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
    }

    private UUID saveAddon(String complexId, String name, String price, boolean active) {
        Complex complex = complexRepository.findById(UUID.fromString(complexId)).orElseThrow();
        Addon addon = new Addon();
        addon.setComplex(complex);
        addon.setName(name);
        addon.setDescription("Descripcion de " + name);
        addon.setPrice(new BigDecimal(price));
        addon.setActive(active);
        return addonRepository.save(addon).getId();
    }

    private String body(String extra) {
        return "{\"guestName\":\"Ana Perez\",\"guestEmail\":\"ana@mail.com\","
                + "\"checkIn\":\"2099-01-10\",\"checkOut\":\"2099-01-12\"" + extra + "}";
    }

    private String postOnboarding(String slug, String json, int expectedStatus) throws Exception {
        return mvc.perform(post("/api/v1/public/complexes/" + slug + "/onboarding")
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus))
                .andReturn().getResponse().getContentAsString();
    }

    @Test
    void onboarding_creates_pending_booking_with_addons_total_and_payment_info() throws Exception {
        String created = createComplex(registerAndGetToken(), "Onboarding Con Addons");
        String id = JsonPath.read(created, "$.data.id");
        String slug = JsonPath.read(created, "$.data.slug");

        UUID breakfast = saveAddon(id, "Desayuno Regional", "1500.00", true);
        UUID kayak = saveAddon(id, "Kayak Doble", "8000.00", true);

        String response = postOnboarding(slug, body(
                ",\"addons\":[{\"addonId\":\"" + breakfast + "\",\"quantity\":2},"
                        + "{\"addonId\":\"" + kayak + "\",\"quantity\":1}]"), 201);

        assertThat(JsonPath.<String>read(response, "$.data.status")).isEqualTo("PENDIENTE");
        assertThat(JsonPath.<Number>read(response, "$.data.total").doubleValue()).isEqualTo(11000.0);
        assertThat(JsonPath.<String>read(response, "$.data.paymentInfo.accountHolder"))
                .isEqualTo("Maria Lopez");

        assertThat(JsonPath.<String>read(response, "$.data.paymentInfo.aliasCbu"))
                .isEqualTo("hostflow.mp");

        assertThat(JsonPath.<String>read(response, "$.data.paymentInfo.bank"))
                .isEqualTo("Banco Nación");

        UUID bookingId = UUID.fromString(JsonPath.read(response, "$.data.bookingId"));
        Booking saved = bookingRepository.findById(bookingId).orElseThrow();
        assertThat(saved.getStatus()).isEqualTo(BookingStatus.PENDIENTE);
        assertThat(saved.getGuestName()).isEqualTo("Ana Perez");
    }

    @Test
    void onboarding_without_addons_returns_201_with_zero_total() throws Exception {
        String created = createComplex(registerAndGetToken(), "Onboarding Sin Addons");
        String slug = JsonPath.read(created, "$.data.slug");

        mvc.perform(post("/api/v1/public/complexes/" + slug + "/onboarding")
                        .contentType(APPLICATION_JSON).content(body("")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.total").value(Double.valueOf(0.0)));
    }

    @Test
    void onboarding_sums_quantities_of_repeated_addon() throws Exception {
        String created = createComplex(registerAndGetToken(), "Onboarding Addon Repetido");
        String id = JsonPath.read(created, "$.data.id");
        String slug = JsonPath.read(created, "$.data.slug");
        UUID addon = saveAddon(id, "Cena Parrillada", "1000.00", true);

        String response = postOnboarding(slug, body(
                ",\"addons\":[{\"addonId\":\"" + addon + "\",\"quantity\":2},"
                        + "{\"addonId\":\"" + addon + "\",\"quantity\":3}]"), 201);

        assertThat(JsonPath.<Number>read(response, "$.data.total").doubleValue()).isEqualTo(5000.0);
    }

    @Test
    void onboarding_with_inactive_addon_returns_400() throws Exception {
        String created = createComplex(registerAndGetToken(), "Onboarding Addon Inactivo");
        String id = JsonPath.read(created, "$.data.id");
        String slug = JsonPath.read(created, "$.data.slug");
        UUID inactive = saveAddon(id, "Addon Apagado", "1000.00", false);

        postOnboarding(slug, body(
                ",\"addons\":[{\"addonId\":\"" + inactive + "\",\"quantity\":1}]"), 400);
    }

    @Test
    void onboarding_with_addon_of_another_complex_returns_400() throws Exception {
        String token = registerAndGetToken();
        String first = createComplex(token, "Onboarding Complejo Uno");
        String second = createComplex(token, "Onboarding Complejo Dos");
        UUID foreign = saveAddon(JsonPath.read(first, "$.data.id"), "Addon Del Uno", "1000.00", true);
        String secondSlug = JsonPath.read(second, "$.data.slug");

        postOnboarding(secondSlug, body(
                ",\"addons\":[{\"addonId\":\"" + foreign + "\",\"quantity\":1}]"), 400);
    }

    @Test
    void onboarding_with_unknown_addon_returns_400() throws Exception {
        String created = createComplex(registerAndGetToken(), "Onboarding Addon Inexistente");
        String slug = JsonPath.read(created, "$.data.slug");

        postOnboarding(slug, body(
                ",\"addons\":[{\"addonId\":\"" + UUID.randomUUID() + "\",\"quantity\":1}]"), 400);
    }

    @Test
    void onboarding_with_boat_creates_pending_boat_request() throws Exception {
        String created = createComplex(registerAndGetToken(), "Onboarding Con Bote");
        String slug = JsonPath.read(created, "$.data.slug");

        String response = postOnboarding(slug, body(
                ",\"guestPhone\":\"+5493511234567\",\"boat\":{\"desiredDate\":\"2099-01-10\","
                        + "\"departureTime\":\"08:30\",\"returnTime\":\"18:00\",\"passengers\":3,"
                        + "\"comments\":\"Con equipaje\"}"), 201);

        assertThat(JsonPath.<Boolean>read(response, "$.data.boatRequested")).isTrue();

        UUID bookingId = UUID.fromString(JsonPath.read(response, "$.data.bookingId"));
        BoatRequest saved = boatRequestRepository.findAll().stream()
                .filter(b -> b.getBooking().getId().equals(bookingId))
                .findFirst().orElseThrow();
        assertThat(saved.getStatus()).isEqualTo(BoatRequestStatus.PENDING);
        assertThat(saved.getPassengers()).isEqualTo(3);
        assertThat(saved.getPayloadJson()).contains("Ana Perez");
        assertThat(saved.getPayloadJson()).doesNotContain("ana@mail.com");
    }

    @Test
    void onboarding_without_boat_does_not_create_boat_request() throws Exception {
        String created = createComplex(registerAndGetToken(), "Onboarding Sin Bote");
        String slug = JsonPath.read(created, "$.data.slug");

        String response = postOnboarding(slug, body(""), 201);

        assertThat(JsonPath.<Boolean>read(response, "$.data.boatRequested")).isFalse();
        UUID bookingId = UUID.fromString(JsonPath.read(response, "$.data.bookingId"));
        assertThat(boatRequestRepository.findAll().stream()
                .anyMatch(b -> b.getBooking().getId().equals(bookingId))).isFalse();
    }
}