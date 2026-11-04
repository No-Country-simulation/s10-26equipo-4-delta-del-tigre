package nocountry.grupo4.delta_tigre.addon;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AddonIntegrationTest {

    @Autowired
    MockMvc mvc;

    private String registerAndGetToken() throws Exception {
        String body = "{\"name\":\"Ana Perez\",\"email\":\"" + UUID.randomUUID() + "@mail.com\",\"password\":\"clave-segura-1\"}";
        String response = mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.accessToken");
    }

    private String createComplex(String token, String name) throws Exception {
        String response = mvc.perform(post("/api/v1/complexes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON).content("{\"name\":\"" + name + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.id");
    }

    private String createAddon(String token, String complexId, String json, int expectedStatus) throws Exception {
        return mvc.perform(post("/api/v1/complexes/" + complexId + "/addons")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus))
                .andReturn().getResponse().getContentAsString();
    }

    @Test
    void create_addon_returns_201_and_is_active() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Adicionales");

        mvc.perform(post("/api/v1/complexes/" + complexId + "/addons")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("{\"name\":\"Desayuno\",\"description\":\"Para dos\",\"price\":15000.00}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Desayuno"))
                .andExpect(jsonPath("$.data.price").value(15000.0))
                .andExpect(jsonPath("$.data.active").value(true))
                .andExpect(jsonPath("$.data.complexId").value(complexId));
    }

    @Test
    void create_addon_with_zero_or_negative_price_returns_400() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Precio");
        createAddon(token, complexId, "{\"name\":\"Gratis\",\"price\":0}", 400);
        createAddon(token, complexId, "{\"name\":\"Negativo\",\"price\":-5}", 400);
    }

    @Test
    void create_addon_with_blank_name_returns_400() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Nombre");
        createAddon(token, complexId, "{\"name\":\"\",\"price\":100}", 400);
    }

    @Test
    void create_addon_in_another_owners_complex_returns_404() throws Exception {
        String tokenA = registerAndGetToken();
        String tokenB = registerAndGetToken();
        String complexId = createComplex(tokenA, "Complejo Ajeno Adicional");
        createAddon(tokenB, complexId, "{\"name\":\"Intruso\",\"price\":100}", 404);
    }

    @Test
    void create_addon_without_token_returns_401() throws Exception {
        mvc.perform(post("/api/v1/complexes/" + UUID.randomUUID() + "/addons")
                        .contentType(APPLICATION_JSON).content("{\"name\":\"Sin token\",\"price\":100}"))
                .andExpect(status().isUnauthorized());
    }
}