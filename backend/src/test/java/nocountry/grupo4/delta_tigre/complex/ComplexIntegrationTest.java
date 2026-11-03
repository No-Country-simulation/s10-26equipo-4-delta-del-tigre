package nocountry.grupo4.delta_tigre.complex;

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
class ComplexIntegrationTest {

    @Autowired
    MockMvc mvc;

    private String registerAndGetToken() throws Exception {
        String body = "{\"name\":\"Ana Perez\",\"email\":\"" + UUID.randomUUID() + "@mail.com\",\"password\":\"clave-segura-1\"}";
        String response = mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.accessToken");
    }

    private String create(String token, String json, int expectedStatus) throws Exception {
        return mvc.perform(post("/api/v1/complexes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus))
                .andReturn().getResponse().getContentAsString();
    }

    @Test
    void create_complex_generates_slug_without_accents() throws Exception {
        String token = registerAndGetToken();
        mvc.perform(post("/api/v1/complexes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("{\"name\":\"Cabañas del Río\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.slug").value("cabanas-del-rio"))
                .andExpect(jsonPath("$.data.name").value("Cabañas del Río"));
    }

    @Test
    void create_complex_with_same_name_adds_suffix() throws Exception {
        String token = registerAndGetToken();
        create(token, "{\"name\":\"Posada Duplicada\"}", 201);
        String second = create(token, "{\"name\":\"Posada Duplicada\"}", 201);
        org.assertj.core.api.Assertions.assertThat(JsonPath.<String>read(second, "$.data.slug"))
                .isEqualTo("posada-duplicada-2");
    }

    @Test
    void owner_can_create_several_complexes() throws Exception {
        String token = registerAndGetToken();
        create(token, "{\"name\":\"Complejo Uno Multiple\"}", 201);
        create(token, "{\"name\":\"Complejo Dos Multiple\"}", 201);
    }

    @Test
    void create_complex_without_token_returns_401() throws Exception {
        mvc.perform(post("/api/v1/complexes").contentType(APPLICATION_JSON)
                        .content("{\"name\":\"Sin Token\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void create_complex_with_blank_name_returns_400() throws Exception {
        String token = registerAndGetToken();
        create(token, "{\"name\":\"\"}", 400);
    }

    @Test
    void create_complex_with_invalid_alias_returns_400() throws Exception {
        String token = registerAndGetToken();
        create(token, "{\"name\":\"Alias Invalido\",\"aliasCbu\":\"ab\"}", 400);
    }

    @Test
    void create_complex_accepts_valid_alias_and_cbu() throws Exception {
        String token = registerAndGetToken();
        create(token, "{\"name\":\"Con Alias\",\"aliasCbu\":\"hostflow.delta\"}", 201);
        create(token, "{\"name\":\"Con Cbu\",\"aliasCbu\":\"1234567890123456789012\"}", 201);
    }
}