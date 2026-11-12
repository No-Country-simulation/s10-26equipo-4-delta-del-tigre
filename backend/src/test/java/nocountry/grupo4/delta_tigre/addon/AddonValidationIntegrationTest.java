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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AddonValidationIntegrationTest {

    @Autowired
    MockMvc mvc;

    private String registerAndGetToken() throws Exception {
        String body = "{\"name\":\"Ana Perez\",\"email\":\"" + UUID.randomUUID() + "@mail.com\",\"password\":\"clave-segura-1\"}";
        String response = mvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.accessToken");
    }

    private String createComplex(String token, String name) throws Exception {
        String response = mvc.perform(post("/api/complexes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON).content("{\"name\":\"" + name + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.id");
    }

    private static String json(String name, String description) {
        return description == null
                ? "{\"name\":\"" + name + "\",\"price\":100}"
                : "{\"name\":\"" + name + "\",\"description\":\"" + description + "\",\"price\":100}";
    }

    private String create(String token, String complexId, String json, int expectedStatus) throws Exception {
        return mvc.perform(post("/api/complexes/" + complexId + "/addons")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus))
                .andReturn().getResponse().getContentAsString();
    }

    @Test
    void create_addon_with_invalid_name_returns_400() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Validacion Adicional");
        for (String name : new String[]{"Desayuno@#*", "朝食", " Desayuno", "Desayuno ", "A", "Nombre-", "A".repeat(85)}) {
            create(token, complexId, json(name, null), 400);
        }
    }

    @Test
    void create_addon_with_invalid_description_returns_400() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Validacion Descripcion");
        for (String description : new String[]{"Con @#*", "朝食 incluido", " Con espacio", "Con espacio ", "ab", "a".repeat(251)}) {
            create(token, complexId, json("Adicional Valido", description), 400);
        }
    }

    @Test
    void create_addon_with_valid_name_and_description_returns_201() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Validacion Valida");
        create(token, complexId, json("Desayuno en el muelle", null), 201);
        create(token, complexId, json("Cena (vegetariana) & vino", "Incluye entrada, plato y postre."), 201);
        create(token, complexId, json("Kayak O'Brien - 2 hs.", "¿Alergias? Avisá antes (sin cargo)"), 201);
    }

    @Test
    void update_addon_with_invalid_name_or_description_returns_400() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Validacion Edicion");
        String created = create(token, complexId, json("Original Valido", null), 201);
        String id = JsonPath.read(created, "$.data.id");

        for (String body : new String[]{json("Nuevo@#*", null), json(" Nuevo", null), json("A", null),
                json("Nuevo Valido", "Con @#*"), json("Nuevo Valido", "ab")}) {
            mvc.perform(put("/api/addons/" + id)
                            .header("Authorization", "Bearer " + token)
                            .contentType(APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest());
        }
    }
}