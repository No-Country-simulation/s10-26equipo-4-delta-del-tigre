package nocountry.grupo4.delta_tigre.auth;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    JwtDecoder decoder;

    private static final String REGISTER = """
        {"name":"Ana Perez","email":"%s","password":"clave-segura-1"}""";

    @Test
    void register_and_login_return_valid_token() throws Exception {
        String email = "ana-" + UUID.randomUUID() + "@mail.com";

        mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON)
                        .content(REGISTER.formatted(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());

        String body = mvc.perform(post("/api/v1/auth/login").contentType(APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"clave-segura-1\"}".formatted(email)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String token = JsonPath.read(body, "$.data.accessToken");
        Jwt jwt = decoder.decode(token);
        assertThat(jwt.getClaimAsStringList("roles")).contains("OWNER");
        assertThat(jwt.getClaimAsString("email")).isEqualTo(email);
    }

    @Test
    void protected_route_without_token_returns_401() throws Exception {
        mvc.perform(get("/api/v1/complexes")).andExpect(status().isUnauthorized());
    }

    @Test
    void protected_route_with_invalid_token_returns_401() throws Exception {
        mvc.perform(get("/api/v1/complexes").header("Authorization", "Bearer basura"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_duplicate_email_returns_409() throws Exception {
        String email = "dup-" + UUID.randomUUID() + "@mail.com";
        mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON)
                .content(REGISTER.formatted(email))).andExpect(status().isCreated());
        mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON)
                .content(REGISTER.formatted(email))).andExpect(status().isConflict());
    }

    @Test
    void register_with_short_password_returns_400() throws Exception {
        mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON)
                        .content("{\"name\":\"Ana\",\"email\":\"a@mail.com\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.password").exists());
    }

    @Test
    void login_with_wrong_password_returns_401() throws Exception {
        String email = "bad-" + UUID.randomUUID() + "@mail.com";
        mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON)
                .content(REGISTER.formatted(email))).andExpect(status().isCreated());
        mvc.perform(post("/api/v1/auth/login").contentType(APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"incorrecta-123\"}".formatted(email)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_returns_current_owner() throws Exception {
        String email = "me-" + UUID.randomUUID() + "@mail.com";
        String body = mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON)
                        .content(REGISTER.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(body, "$.data.accessToken");

        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(email));
    }

    @Test
    void me_without_token_returns_401() throws Exception {
        mvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());
    }
}