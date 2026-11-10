package nocountry.grupo4.delta_tigre.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    static final String BEARER = "bearerAuth";

    @Bean
    OpenAPI hostflowOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("HostFlow API")
                        .version("v1")
                        .description("Onboarding y gestión para pequeños alojamientos del Delta del Tigre. "
                                + "Las rutas del dueño requieren token: hacer POST /api/v1/auth/login, copiar "
                                + "`data.accessToken` y pegarlo en el botón Authorize. "
                                + "Las rutas públicas (ficha del huésped) no requieren autenticación."))
                .components(new Components().addSecuritySchemes(BEARER, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER));
    }
}