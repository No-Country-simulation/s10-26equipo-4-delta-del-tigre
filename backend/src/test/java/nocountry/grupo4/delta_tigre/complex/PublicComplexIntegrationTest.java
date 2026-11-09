package nocountry.grupo4.delta_tigre.complex;

import com.jayway.jsonpath.JsonPath;
import nocountry.grupo4.delta_tigre.addon.Addon;
import nocountry.grupo4.delta_tigre.addon.AddonRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PublicComplexIntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ComplexRepository complexRepository;

    @Autowired
    AddonRepository addonRepository;

    private String registerAndGetToken() throws Exception {
        String body = "{\"name\":\"Ana Perez\",\"email\":\"" + UUID.randomUUID() + "@mail.com\",\"password\":\"clave-segura-1\"}";
        String response = mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.accessToken");
    }

    private String create(String token, String json) throws Exception {
        return mvc.perform(post("/api/v1/complexes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
    }

    private Addon saveAddon(String complexId, String name, String price, boolean active) {
        Complex complex = complexRepository.findById(UUID.fromString(complexId)).orElseThrow();
        Addon addon = new Addon();
        addon.setComplex(complex);
        addon.setName(name);
        addon.setDescription("Descripcion de " + name);
        addon.setPrice(new BigDecimal(price));
        addon.setActive(active);
        return addonRepository.save(addon);
    }

    @Test
    void get_by_slug_returns_200_without_token_and_hides_bank_data() throws Exception {
        String token = registerAndGetToken();
        String created = create(token,
                "{\"name\":\"Publico Visible\",\"address\":\"Arroyo Gambado 123\",\"accountHolder\":\"Ana Perez\","
                        + "\"aliasCbu\":\"hostflow.delta\",\"bank\":\"Banco Nación\"}");
        String id = JsonPath.read(created, "$.data.id");
        String slug = JsonPath.read(created, "$.data.slug");

        mvc.perform(get("/api/v1/public/complexes/" + slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id))
                .andExpect(jsonPath("$.data.name").value("Publico Visible"))
                .andExpect(jsonPath("$.data.slug").value(slug))
                .andExpect(jsonPath("$.data.address").value("Arroyo Gambado 123"))
                .andExpect(jsonPath("$.data.addons").isEmpty())
                .andExpect(jsonPath("$.data.accountHolder").doesNotExist())
                .andExpect(jsonPath("$.data.aliasCbu").doesNotExist())
                .andExpect(jsonPath("$.data.bank").doesNotExist());
    }

    @Test
    void get_by_unknown_slug_returns_404() throws Exception {
        mvc.perform(get("/api/v1/public/complexes/no-existe-xyz-" + UUID.randomUUID()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Complejo no encontrado"));
    }

    @Test
    void get_by_slug_lists_only_active_addons() throws Exception {
        String token = registerAndGetToken();
        String created = create(token, "{\"name\":\"Publico Con Addons\"}");
        String id = JsonPath.read(created, "$.data.id");
        String slug = JsonPath.read(created, "$.data.slug");
        saveAddon(id, "Desayuno Activo", "1500.00", true);
        saveAddon(id, "Kayak Inactivo", "8000.00", false);

        mvc.perform(get("/api/v1/public/complexes/" + slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.addons.length()").value(1))
                .andExpect(jsonPath("$.data.addons[0].name").value("Desayuno Activo"))
                .andExpect(jsonPath("$.data.addons[0].price").value(Double.valueOf(1500.00)));
    }

    @Test
    void get_by_slug_does_not_list_addons_of_other_complexes() throws Exception {
        String token = registerAndGetToken();
        String first = create(token, "{\"name\":\"Publico Uno Aislado\"}");
        String second = create(token, "{\"name\":\"Publico Dos Aislado\"}");
        saveAddon(JsonPath.read(first, "$.data.id"), "Solo Del Uno", "900.00", true);
        String secondSlug = JsonPath.read(second, "$.data.slug");

        mvc.perform(get("/api/v1/public/complexes/" + secondSlug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.addons").isEmpty());
    }
}