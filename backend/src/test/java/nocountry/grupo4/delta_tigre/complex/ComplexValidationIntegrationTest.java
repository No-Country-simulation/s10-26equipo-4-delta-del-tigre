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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ComplexValidationIntegrationTest {

    @Autowired
    MockMvc mvc;

    private String registerAndGetToken() throws Exception {
        String body = "{\"name\":\"Ana Perez\",\"email\":\"" + UUID.randomUUID() + "@mail.com\",\"password\":\"clave-segura-1\"}";
        String response = mvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.accessToken");
    }

    private static String json(String name, String address) {
        return "{\"name\":\"" + name + "\",\"address\":\"" + address + "\"}";
    }

    private String create(String token, String json, int expectedStatus) throws Exception {
        return mvc.perform(post("/api/complexes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus))
                .andReturn().getResponse().getContentAsString();
    }

    private void update(String token, String id, String json, int expectedStatus) throws Exception {
        mvc.perform(put("/api/complexes/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus));
    }

    @Test
    void create_complex_with_invalid_name_returns_400() throws Exception {
        String token = registerAndGetToken();
        for (String name : new String[]{"Eco@#Lódge*", "リゾート", " Cabañas del Sol ", "Cabañas del Sol ",
                " Cabañas del Sol", "A", "Nombre-", "Nombre\\nDoble"}) {
            create(token, json(name, "Calle Valida 123"), 400);
        }
    }

    @Test
    void create_complex_with_valid_special_names_returns_201() throws Exception {
        String token = registerAndGetToken();
        for (String name : new String[]{"Posada Val Ñandú", "Eco Lodge Validacion S.A.",
                "Villa 25 de Mayo Validacion", "O'Higgins - Norte Validacion", "Posada & Spa Validacion"}) {
            create(token, "{\"name\":\"" + name + "\"}", 201);
        }
    }

    @Test
    void create_complex_with_invalid_address_returns_400() throws Exception {
        String token = registerAndGetToken();
        for (String address : new String[]{"Río Luján #120@ *", " Arroyo Caraguata 50 ", "Arroyo Caraguata 50 ",
                "abc", "リゾート 12"}) {
            create(token, json("Direccion Invalida", address), 400);
        }
    }

    @Test
    void create_complex_with_valid_addresses_returns_201() throws Exception {
        String token = registerAndGetToken();
        create(token, json("Direccion Valida Uno", "Arroyo Gambado 123, Delta del Tigre"), 201);
        create(token, json("Direccion Valida Dos", "Río Luján #120"), 201);
        create(token, json("Direccion Valida Tres", "Av. 9 de Julio 1/2"), 201);
    }

    @Test
    void update_complex_with_invalid_name_or_address_returns_400() throws Exception {
        String token = registerAndGetToken();
        String created = create(token, "{\"name\":\"Para Validar Edicion Datos\"}", 201);
        String id = JsonPath.read(created, "$.data.id");

        update(token, id, json("Eco@#Lódge*", "Calle Valida 123"), 400);
        update(token, id, json(" Cabañas del Sol ", "Calle Valida 123"), 400);
        update(token, id, json("Nombre Valido", "Río Luján #120@ *"), 400);
        update(token, id, json("Nombre Valido", "abc"), 400);
    }

    @Test
    void update_complex_with_invalid_brand_color_returns_400() throws Exception {
        String token = registerAndGetToken();
        String created = create(token, "{\"name\":\"Para Validar Colores\"}", 201);
        String id = JsonPath.read(created, "$.data.id");

        for (String color : new String[]{"azul", "#1A73E8,#FFFFFF", "#1A73E8;#FFFFFF", "#GGGGGG",
                "#FFF", "#1A73E", "#1A73E8F", "1A73E8", " #1A73E8", "#1A73E8 "}) {
            update(token, id, "{\"name\":\"Para Validar Colores\",\"brandColors\":\"" + color + "\"}", 400);
        }
    }

    @Test
    void update_complex_accepts_valid_brand_color_and_no_brand_color() throws Exception {
        String token = registerAndGetToken();
        String created = create(token, "{\"name\":\"Para Colores Validos\"}", 201);
        String id = JsonPath.read(created, "$.data.id");

        update(token, id, "{\"name\":\"Para Colores Validos\",\"brandColors\":\"#1a73e8\"}", 200);
        update(token, id, "{\"name\":\"Para Colores Validos\",\"brandColors\":\"#1A73E8\"}", 200);
        update(token, id, "{\"name\":\"Para Colores Validos\"}", 200);
    }
}