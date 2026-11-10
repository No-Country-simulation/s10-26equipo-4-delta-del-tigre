package nocountry.grupo4.delta_tigre.complex;

import com.jayway.jsonpath.JsonPath;
import nocountry.grupo4.delta_tigre.addon.Addon;
import nocountry.grupo4.delta_tigre.addon.AddonRepository;
import nocountry.grupo4.delta_tigre.notification.BoatWebhookClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DeleteComplexAddonIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ComplexRepository complexRepository;
    @Autowired AddonRepository addonRepository;

    @MockitoBean JavaMailSender mailSender;
    @MockitoBean BoatWebhookClient webhookClient;

    private record Setup(String token, String complexId, String slug, UUID addonId) {}

    private String register() throws Exception {
        String body = "{\"name\":\"Ana Perez\",\"email\":\"" + UUID.randomUUID()
                + "@mail.com\",\"password\":\"clave-segura-1\"}";
        String response = mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.accessToken");
    }

    private String createComplex(String token) throws Exception {
        String body = """
            {
                "name": "Delete Cabanas",
                "accountHolder": "Maria Lopez",
                "aliasCbu": "hostflow.mp",
                "bank": "Banco Nación"
            }
            """;
        return mvc.perform(post("/api/v1/complexes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
    }

    private UUID saveAddon(String complexId) {
        Addon addon = new Addon();
        addon.setComplex(complexRepository.findById(UUID.fromString(complexId)).orElseThrow());
        addon.setName("Desayuno Regional");
        addon.setDescription("Desayuno");
        addon.setPrice(new BigDecimal("1500.00"));
        addon.setActive(true);
        return addonRepository.save(addon).getId();
    }

    private Setup setup() throws Exception {
        String token = register();
        String created = createComplex(token);
        String complexId = JsonPath.read(created, "$.data.id");
        String slug = JsonPath.read(created, "$.data.slug");
        return new Setup(token, complexId, slug, saveAddon(complexId));
    }

    private void bookWithAddon(Setup s) throws Exception {
        String body = "{\"guestName\":\"Ana Perez\",\"guestEmail\":\"g-" + UUID.randomUUID() + "@mail.com\","
                + "\"checkIn\":\"2099-01-10\",\"checkOut\":\"2099-01-12\",\"guestsCount\":2,"
                + "\"addons\":[{\"addonId\":\"" + s.addonId() + "\",\"quantity\":1}]}";
        mvc.perform(post("/api/v1/public/complexes/" + s.slug() + "/onboarding")
                        .contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
    }

    @Test
    void unused_addon_is_deleted() throws Exception {
        Setup s = setup();

        mvc.perform(delete("/api/v1/addons/" + s.addonId())
                        .header("Authorization", "Bearer " + s.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.deleted").value(true));

        mvc.perform(get("/api/v1/complexes/" + s.complexId() + "/addons")
                        .header("Authorization", "Bearer " + s.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    void addon_used_in_a_booking_is_deactivated_instead_of_deleted() throws Exception {
        Setup s = setup();
        bookWithAddon(s);

        mvc.perform(delete("/api/v1/addons/" + s.addonId())
                        .header("Authorization", "Bearer " + s.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.deleted").value(false))
                .andExpect(jsonPath("$.data.addon.active").value(false));

        mvc.perform(get("/api/v1/complexes/" + s.complexId() + "/addons")
                        .header("Authorization", "Bearer " + s.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].active").value(false));
    }

    @Test
    void addon_of_another_owner_returns_404() throws Exception {
        Setup s = setup();
        String otherToken = register();

        mvc.perform(delete("/api/v1/addons/" + s.addonId())
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isNotFound());
        assertThat(addonRepository.findById(s.addonId())).isPresent();
    }

    @Test
    void complex_without_bookings_is_deleted_with_its_addons() throws Exception {
        Setup s = setup();

        mvc.perform(delete("/api/v1/complexes/" + s.complexId())
                        .header("Authorization", "Bearer " + s.token()))
                .andExpect(status().isOk());

        mvc.perform(get("/api/v1/complexes/" + s.complexId())
                        .header("Authorization", "Bearer " + s.token()))
                .andExpect(status().isNotFound());
        assertThat(addonRepository.findByComplexIdOrderByNameAsc(UUID.fromString(s.complexId()))).isEmpty();
    }

    @Test
    void complex_with_bookings_returns_409_and_stays() throws Exception {
        Setup s = setup();
        bookWithAddon(s);

        mvc.perform(delete("/api/v1/complexes/" + s.complexId())
                        .header("Authorization", "Bearer " + s.token()))
                .andExpect(status().isConflict());

        mvc.perform(get("/api/v1/complexes/" + s.complexId())
                        .header("Authorization", "Bearer " + s.token()))
                .andExpect(status().isOk());
    }

    @Test
    void complex_of_another_owner_returns_404() throws Exception {
        Setup s = setup();
        String otherToken = register();

        mvc.perform(delete("/api/v1/complexes/" + s.complexId())
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_without_token_is_rejected() throws Exception {
        Setup s = setup();

        mvc.perform(delete("/api/v1/complexes/" + s.complexId()))
                .andExpect(status().is4xxClientError());
        mvc.perform(delete("/api/v1/addons/" + s.addonId()))
                .andExpect(status().is4xxClientError());
    }
}