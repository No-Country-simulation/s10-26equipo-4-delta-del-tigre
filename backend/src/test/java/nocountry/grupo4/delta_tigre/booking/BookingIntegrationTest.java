package nocountry.grupo4.delta_tigre.booking;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import nocountry.grupo4.delta_tigre.addon.AddonRepository;
import java.math.BigDecimal;

@SpringBootTest
@AutoConfigureMockMvc
class BookingIntegrationTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    AddonRepository addonRepository;
    @Autowired
    BookingRepository bookingRepository;
    @Autowired
    BookingAddonRepository bookingAddonRepository;
    @Autowired
    BoatRequestRepository boatRequestRepository;


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

    private String createBooking(String token, String complexId, String json, int expectedStatus) throws Exception {
        return mvc.perform(post("/api/v1/complexes/" + complexId + "/bookings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus))
                .andReturn().getResponse().getContentAsString();
    }

    private static String bookingJson(String guest, String checkIn, String checkOut) {
        return "{\"guestName\":\"" + guest + "\",\"checkIn\":\"" + checkIn + "\",\"checkOut\":\"" + checkOut + "\"}";
    }

    private String createAddon(String token, String complexId, String name) throws Exception {
        String response = mvc.perform(post("/api/v1/complexes/" + complexId + "/addons")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON).content("{\"name\":\"" + name + "\",\"price\":100}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.id");
    }

    private void attachAddon(String bookingId, String addonId, int quantity, String unitPrice) {
        BookingAddon ba = new BookingAddon();
        ba.setBooking(bookingRepository.getReferenceById(UUID.fromString(bookingId)));
        ba.setAddon(addonRepository.getReferenceById(UUID.fromString(addonId)));
        ba.setQuantity(quantity);
        ba.setUnitPrice(new BigDecimal(unitPrice));
        bookingAddonRepository.save(ba);
    }

    private void attachBoatRequest(String bookingId, int passengers) {
        BoatRequest br = new BoatRequest();
        br.setBooking(bookingRepository.getReferenceById(UUID.fromString(bookingId)));
        br.setDepartureAt(LocalDateTime.of(2026, 12, 10, 15, 0));
        br.setPassengers(passengers);
        boatRequestRepository.save(br);
    }

    private String patchStatus(String token, String id, String json, int expectedStatus) throws Exception {
        return mvc.perform(patch("/api/v1/bookings/" + id + "/status")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus))
                .andReturn().getResponse().getContentAsString();
    }

    @Test
    void create_booking_returns_201_pending_with_guest_data() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Reservas");

        mvc.perform(post("/api/v1/complexes/" + complexId + "/bookings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("{\"guestName\":\"Juan Gomez\",\"checkIn\":\"2026-12-10\",\"checkOut\":\"2026-12-13\","
                                + "\"guestEmail\":\"juan@mail.com\",\"guestPhone\":\"+54 9 351 555 1234\","
                                + "\"allergies\":[\"MANI\",\"GLUTEN\"],\"otherAllergies\":\"Kiwi\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDIENTE"))
                .andExpect(jsonPath("$.data.guestName").value("Juan Gomez"))
                .andExpect(jsonPath("$.data.checkIn").value("2026-12-10"))
                .andExpect(jsonPath("$.data.checkOut").value("2026-12-13"))
                .andExpect(jsonPath("$.data.complexId").value(complexId))
                .andExpect(jsonPath("$.data.allergies.length()").value(2))
                .andExpect(jsonPath("$.data.allergies[0]").value("GLUTEN"))
                .andExpect(jsonPath("$.data.allergies[1]").value("MANI"))
                .andExpect(jsonPath("$.data.otherAllergies").value("Kiwi"));
    }

    @Test
    void create_booking_with_only_required_fields_returns_201() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Minimo");
        mvc.perform(post("/api/v1/complexes/" + complexId + "/bookings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(bookingJson("Solo Obligatorios", "2026-12-10", "2026-12-11")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDIENTE"))
                .andExpect(jsonPath("$.data.allergies.length()").value(0));
    }

    @Test
    void create_booking_with_checkout_not_after_checkin_returns_400() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Fechas");
        createBooking(token, complexId, bookingJson("Igual", "2026-12-10", "2026-12-10"), 400);
        createBooking(token, complexId, bookingJson("Antes", "2026-12-10", "2026-12-09"), 400);
    }

    @Test
    void create_booking_without_guest_name_or_dates_returns_400() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Obligatorios");
        createBooking(token, complexId, bookingJson("", "2026-12-10", "2026-12-12"), 400);
        createBooking(token, complexId, "{\"guestName\":\"Sin check-in\",\"checkOut\":\"2026-12-12\"}", 400);
        createBooking(token, complexId, "{\"guestName\":\"Sin check-out\",\"checkIn\":\"2026-12-10\"}", 400);
    }

    @Test
    void create_booking_with_unknown_allergy_returns_400() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Alergia");
        createBooking(token, complexId,
                "{\"guestName\":\"Alergia\",\"checkIn\":\"2026-12-10\",\"checkOut\":\"2026-12-12\",\"allergies\":[\"POLEN\"]}", 400);
    }

    @Test
    void create_booking_in_another_owners_complex_returns_404() throws Exception {
        String tokenA = registerAndGetToken();
        String tokenB = registerAndGetToken();
        String complexId = createComplex(tokenA, "Complejo Ajeno Reserva");
        createBooking(tokenB, complexId, bookingJson("Intruso", "2026-12-10", "2026-12-12"), 404);
    }

    @Test
    void create_booking_without_token_returns_401() throws Exception {
        mvc.perform(post("/api/v1/complexes/" + UUID.randomUUID() + "/bookings")
                        .contentType(APPLICATION_JSON)
                        .content(bookingJson("Sin token", "2026-12-10", "2026-12-12")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void create_booking_with_invalid_guest_data_returns_400() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Validacion Huesped");
        for (String name : new String[]{"Juan123", "Juan@#", "张伟", " Juan", "J"}) {
            createBooking(token, complexId, bookingJson(name, "2026-12-10", "2026-12-12"), 400);
        }
        for (String field : new String[]{"\"guestEmail\":\"张伟@mail.com\"", "\"guestEmail\":\"juan@\"",
                "\"guestPhone\":\"abc123456\"", "\"guestPhone\":\"12345\"",
                "\"guestIdentificationNumber\":\"12\"", "\"guestIdentificationNumber\":\"12 345 678\"",
                "\"guestIdentificationType\":\"D1\"",
                "\"preferences\":\"Con @#*\"", "\"preferences\":\"朝食 incluido\"", "\"otherAllergies\":\"ab\""}) {
            createBooking(token, complexId,
                    "{\"guestName\":\"Huesped Valido\",\"checkIn\":\"2026-12-10\",\"checkOut\":\"2026-12-12\"," + field + "}", 400);
        }
    }

    @Test
    void create_booking_accepts_valid_guest_data() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Huesped Valido");
        createBooking(token, complexId,
                "{\"guestName\":\"María José O'Brien-Núñez\",\"checkIn\":\"2026-12-10\",\"checkOut\":\"2026-12-12\","
                        + "\"guestEmail\":\"maria.jose+hf@mail.com\",\"guestPhone\":\"+54 (351) 555-1234\","
                        + "\"guestIdentificationType\":\"DNI\",\"guestIdentificationNumber\":\"30.123.456\","
                        + "\"preferences\":\"Llegamos en la lancha de las 15. ¿Hay cuna?\",\"otherAllergies\":\"Kiwi y mango\"}", 201);
    }

    @Test
    void list_bookings_returns_sorted_by_check_in_only_for_that_complex() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Lista Reservas");
        String otherId = createComplex(token, "Complejo Otro Reservas");
        createBooking(token, complexId, bookingJson("Tercero", "2026-12-20", "2026-12-22"), 201);
        createBooking(token, complexId, bookingJson("Primero", "2026-12-01", "2026-12-03"), 201);
        createBooking(token, complexId, bookingJson("Segundo", "2026-12-10", "2026-12-12"), 201);
        createBooking(token, otherId, bookingJson("De otro complejo", "2026-12-05", "2026-12-06"), 201);

        mvc.perform(get("/api/v1/complexes/" + complexId + "/bookings").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(3))
                .andExpect(jsonPath("$.data[0].guestName").value("Primero"))
                .andExpect(jsonPath("$.data[1].guestName").value("Segundo"))
                .andExpect(jsonPath("$.data[2].guestName").value("Tercero"));
    }

    @Test
    void list_bookings_empty_for_complex_without_bookings() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Sin Reservas");
        mvc.perform(get("/api/v1/complexes/" + complexId + "/bookings").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    void list_bookings_can_be_filtered_by_status() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Filtro Estado");
        createBooking(token, complexId, bookingJson("Pendiente", "2026-12-10", "2026-12-12"), 201);

        mvc.perform(get("/api/v1/complexes/" + complexId + "/bookings?status=PENDIENTE")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
        mvc.perform(get("/api/v1/complexes/" + complexId + "/bookings?status=CONFIRMADA")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    void list_bookings_with_invalid_status_returns_400() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Estado Invalido");
        mvc.perform(get("/api/v1/complexes/" + complexId + "/bookings?status=ARCHIVADA")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    @Test
    void list_bookings_with_invalid_complex_id_returns_400() throws Exception {
        String token = registerAndGetToken();
        mvc.perform(get("/api/v1/complexes/no-es-un-uuid/bookings").header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    @Test
    void list_bookings_of_another_owners_complex_returns_404() throws Exception {
        String tokenA = registerAndGetToken();
        String tokenB = registerAndGetToken();
        String complexId = createComplex(tokenA, "Complejo Lista Reservas Ajeno");
        mvc.perform(get("/api/v1/complexes/" + complexId + "/bookings").header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
    }

    @Test
    void get_booking_detail_includes_guest_addons_and_boat_request() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Detalle");
        String created = createBooking(token, complexId,
                "{\"guestName\":\"Juan Gomez\",\"checkIn\":\"2026-12-10\",\"checkOut\":\"2026-12-13\","
                        + "\"guestEmail\":\"juan@mail.com\",\"allergies\":[\"MANI\"]}", 201);
        String bookingId = JsonPath.read(created, "$.data.id");
        String desayuno = createAddon(token, complexId, "Desayuno");
        String cena = createAddon(token, complexId, "Cena");
        attachAddon(bookingId, desayuno, 2, "100.00");
        attachAddon(bookingId, cena, 1, "50.50");
        attachBoatRequest(bookingId, 3);

        mvc.perform(get("/api/v1/bookings/" + bookingId).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.guestName").value("Juan Gomez"))
                .andExpect(jsonPath("$.data.guestEmail").value("juan@mail.com"))
                .andExpect(jsonPath("$.data.allergies[0]").value("MANI"))
                .andExpect(jsonPath("$.data.addons.length()").value(2))
                .andExpect(jsonPath("$.data.addons[0].name").value("Cena"))
                .andExpect(jsonPath("$.data.addons[1].name").value("Desayuno"))
                .andExpect(jsonPath("$.data.addons[1].quantity").value(2))
                .andExpect(jsonPath("$.data.addonsTotal").value(Double.valueOf(250.5)))
                .andExpect(jsonPath("$.data.boatRequests.length()").value(1))
                .andExpect(jsonPath("$.data.boatRequests[0].passengers").value(3))
                .andExpect(jsonPath("$.data.boatRequests[0].status").value("PENDING"));
    }

    @Test
    void get_booking_detail_without_addons_or_boat_returns_empty_lists() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Detalle Vacio");
        String created = createBooking(token, complexId, bookingJson("Sin Extras", "2026-12-10", "2026-12-12"), 201);
        String bookingId = JsonPath.read(created, "$.data.id");

        mvc.perform(get("/api/v1/bookings/" + bookingId).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.addons").isEmpty())
                .andExpect(jsonPath("$.data.addonsTotal").value(Double.valueOf(0)))
                .andExpect(jsonPath("$.data.boatRequests").isEmpty());
    }

    @Test
    void get_booking_of_another_owner_returns_404() throws Exception {
        String tokenA = registerAndGetToken();
        String tokenB = registerAndGetToken();
        String complexId = createComplex(tokenA, "Complejo Detalle Ajeno");
        String created = createBooking(tokenA, complexId, bookingJson("Mio", "2026-12-10", "2026-12-12"), 201);
        String bookingId = JsonPath.read(created, "$.data.id");

        mvc.perform(get("/api/v1/bookings/" + bookingId).header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
    }

    @Test
    void get_nonexistent_booking_returns_404() throws Exception {
        String token = registerAndGetToken();
        mvc.perform(get("/api/v1/bookings/" + UUID.randomUUID()).header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void get_booking_with_invalid_id_returns_400() throws Exception {
        String token = registerAndGetToken();
        mvc.perform(get("/api/v1/bookings/no-es-un-uuid").header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    @Test
    void get_booking_without_token_returns_401() throws Exception {
        mvc.perform(get("/api/v1/bookings/" + UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void update_booking_status_accepts_all_valid_states() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Estados");
        String created = createBooking(token, complexId, bookingJson("Estados", "2026-12-10", "2026-12-12"), 201);
        String id = JsonPath.read(created, "$.data.id");

        for (String state : new String[]{"CONFIRMADA", "FINALIZADA", "CANCELADA", "PENDIENTE"}) {
            String response = patchStatus(token, id, "{\"status\":\"" + state + "\"}", 200);
            org.assertj.core.api.Assertions.assertThat(JsonPath.<String>read(response, "$.data.status")).isEqualTo(state);
        }
    }

    @Test
    void list_bookings_filtered_by_status_reflects_the_change() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Filtro Cambio");
        createBooking(token, complexId, bookingJson("Sigue Pendiente", "2026-12-01", "2026-12-02"), 201);
        String second = createBooking(token, complexId, bookingJson("Se Confirma", "2026-12-10", "2026-12-12"), 201);
        patchStatus(token, JsonPath.read(second, "$.data.id"), "{\"status\":\"CONFIRMADA\"}", 200);

        mvc.perform(get("/api/v1/complexes/" + complexId + "/bookings?status=CONFIRMADA")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].guestName").value("Se Confirma"));
        mvc.perform(get("/api/v1/complexes/" + complexId + "/bookings?status=PENDIENTE")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].guestName").value("Sigue Pendiente"));
    }

    @Test
    void update_booking_status_of_another_owner_returns_404() throws Exception {
        String tokenA = registerAndGetToken();
        String tokenB = registerAndGetToken();
        String complexId = createComplex(tokenA, "Complejo Estado Ajeno Reserva");
        String created = createBooking(tokenA, complexId, bookingJson("Mio", "2026-12-10", "2026-12-12"), 201);
        String id = JsonPath.read(created, "$.data.id");
        patchStatus(tokenB, id, "{\"status\":\"CANCELADA\"}", 404);
    }

    @Test
    void update_status_of_nonexistent_booking_returns_404() throws Exception {
        String token = registerAndGetToken();
        patchStatus(token, UUID.randomUUID().toString(), "{\"status\":\"CONFIRMADA\"}", 404);
    }

    @Test
    void update_booking_status_without_or_with_invalid_value_returns_400() throws Exception {
        String token = registerAndGetToken();
        String complexId = createComplex(token, "Complejo Estado Invalido Reserva");
        String created = createBooking(token, complexId, bookingJson("Invalido", "2026-12-10", "2026-12-12"), 201);
        String id = JsonPath.read(created, "$.data.id");
        patchStatus(token, id, "{}", 400);
        patchStatus(token, id, "{\"status\":\"ARCHIVADA\"}", 400);
    }

    @Test
    void update_booking_status_without_token_returns_401() throws Exception {
        mvc.perform(patch("/api/v1/bookings/" + UUID.randomUUID() + "/status")
                        .contentType(APPLICATION_JSON).content("{\"status\":\"CONFIRMADA\"}"))
                .andExpect(status().isUnauthorized());
    }
}
