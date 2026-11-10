package nocountry.grupo4.delta_tigre.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.Test;

class OpenApiConfigTest {

    @Test
    void declaresBearerJwtSchemeAndTitle() {
        OpenAPI api = new OpenApiConfig().hostflowOpenApi();

        assertEquals("HostFlow API", api.getInfo().getTitle());
        var scheme = api.getComponents().getSecuritySchemes().get(OpenApiConfig.BEARER);
        assertEquals("bearer", scheme.getScheme());
        assertEquals("JWT", scheme.getBearerFormat());
        assertTrue(api.getSecurity().get(0).containsKey(OpenApiConfig.BEARER));
    }
}