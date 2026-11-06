package nocountry.grupo4.delta_tigre.complex;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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

    @Test
    void list_returns_only_own_complexes_sorted_by_name() throws Exception {
        String tokenA = registerAndGetToken();
        String tokenB = registerAndGetToken();
        create(tokenA, "{\"name\":\"Zeta Lista\"}", 201);
        create(tokenA, "{\"name\":\"Alfa Lista\"}", 201);
        create(tokenB, "{\"name\":\"Beta Ajeno\"}", 201);

        mvc.perform(get("/api/v1/complexes").header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].name").value("Alfa Lista"))
                .andExpect(jsonPath("$.data[1].name").value("Zeta Lista"));
    }

    @Test
    void list_returns_empty_for_owner_without_complexes() throws Exception {
        String token = registerAndGetToken();
        mvc.perform(get("/api/v1/complexes").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    void list_complexes_without_token_returns_401() throws Exception {
        mvc.perform(get("/api/v1/complexes")).andExpect(status().isUnauthorized());
    }

    @Test
    void get_own_complex_returns_200_with_all_fields() throws Exception {
        String token = registerAndGetToken();
        String created = create(token,
                "{\"name\":\"Detalle Completo\",\"address\":\"Arroyo Gambado 123\",\"accountHolder\":\"Ana Perez\","
                        + "\"aliasCbu\":\"hostflow.delta\",\"bank\":\"Banco Nación\"}", 201);
        String id = JsonPath.read(created, "$.data.id");

        mvc.perform(get("/api/v1/complexes/" + id).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Detalle Completo"))
                .andExpect(jsonPath("$.data.slug").value("detalle-completo"))
                .andExpect(jsonPath("$.data.aliasCbu").value("hostflow.delta"))
                .andExpect(jsonPath("$.data.bank").value("Banco Nación"));
    }

    @Test
    void get_complex_of_another_owner_returns_404() throws Exception {
        String tokenA = registerAndGetToken();
        String tokenB = registerAndGetToken();
        String created = create(tokenA, "{\"name\":\"Complejo Ajeno\"}", 201);
        String id = JsonPath.read(created, "$.data.id");

        mvc.perform(get("/api/v1/complexes/" + id).header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
    }

    @Test
    void get_nonexistent_complex_returns_404() throws Exception {
        String token = registerAndGetToken();
        mvc.perform(get("/api/v1/complexes/" + UUID.randomUUID()).header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Complejo no encontrado"));
    }

    @Test
    void get_complex_without_token_returns_401() throws Exception {
        mvc.perform(get("/api/v1/complexes/" + UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }

    private String update(String token, String id, String json, int expectedStatus) throws Exception {
        return mvc.perform(put("/api/v1/complexes/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus))
                .andReturn().getResponse().getContentAsString();
    }

    @Test
    void update_changes_editable_fields_and_keeps_slug_and_bank_data() throws Exception {
        String token = registerAndGetToken();
        String created = create(token,
                "{\"name\":\"Nombre Original\",\"aliasCbu\":\"hostflow.delta\",\"bank\":\"Banco Nación\"}", 201);
        String id = JsonPath.read(created, "$.data.id");

        mvc.perform(put("/api/v1/complexes/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("{\"name\":\"Nombre Nuevo\",\"address\":\"Calle 1\",\"brandColors\":\"#1A73E8\"}"))                .andExpect(jsonPath("$.data.name").value("Nombre Nuevo"))
                .andExpect(jsonPath("$.data.address").value("Calle 1"))
                .andExpect(jsonPath("$.data.brandColors").value("#1A73E8"))
                .andExpect(jsonPath("$.data.slug").value("nombre-original"))
                .andExpect(jsonPath("$.data.aliasCbu").value("hostflow.delta"))
                .andExpect(jsonPath("$.data.bank").value("Banco Nación"));
    }

    @Test
    void update_complex_of_another_owner_returns_404() throws Exception {
        String tokenA = registerAndGetToken();
        String tokenB = registerAndGetToken();
        String created = create(tokenA, "{\"name\":\"Complejo Editable Ajeno\"}", 201);
        String id = JsonPath.read(created, "$.data.id");

        update(tokenB, id, "{\"name\":\"Intento de otro dueño\"}", 404);
    }

    @Test
    void update_nonexistent_complex_returns_404() throws Exception {
        String token = registerAndGetToken();
        update(token, UUID.randomUUID().toString(), "{\"name\":\"No existe\"}", 404);
    }

    @Test
    void update_complex_with_blank_name_returns_400() throws Exception {
        String token = registerAndGetToken();
        String created = create(token, "{\"name\":\"Para Validar Edicion\"}", 201);
        String id = JsonPath.read(created, "$.data.id");

        update(token, id, "{\"name\":\"\"}", 400);
    }

    @Test
    void update_complex_without_token_returns_401() throws Exception {
        mvc.perform(put("/api/v1/complexes/" + UUID.randomUUID())
                        .contentType(APPLICATION_JSON).content("{\"name\":\"Sin token\"}"))
                .andExpect(status().isUnauthorized());
    }
}