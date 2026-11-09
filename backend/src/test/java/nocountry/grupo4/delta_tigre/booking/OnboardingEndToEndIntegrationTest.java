package nocountry.grupo4.delta_tigre.booking;

import com.jayway.jsonpath.JsonPath;
import nocountry.grupo4.delta_tigre.addon.Addon;
import nocountry.grupo4.delta_tigre.addon.AddonRepository;
import nocountry.grupo4.delta_tigre.complex.Complex;
import nocountry.grupo4.delta_tigre.complex.ComplexRepository;
import nocountry.grupo4.delta_tigre.notification.BoatWebhookClient;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "boat.webhook.url=https://webhook.test/boat")
@AutoConfigureMockMvc
class OnboardingEndToEndIntegrationTest {

    private static final String WEBHOOK_URL = "https://webhook.test/boat";

    @Autowired MockMvc mvc;
    @Autowired ComplexRepository complexRepository;
    @Autowired AddonRepository addonRepository;
    @Autowired BoatRequestRepository boatRequestRepository;

    @MockitoBean JavaMailSender mailSender;
    @MockitoBean BoatWebhookClient webhookClient;

    private record Setup(String token, String ownerEmail, String complexId, String complexName,
                         String slug, UUID breakfast, UUID kayak) {}

    private String register(String email) throws Exception {
        String body = "{\"name\":\"Ana Perez\",\"email\":\"" + email + "\",\"password\":\"clave-segura-1\"}";
        String response = mvc.perform(post("/api/v1/auth/register").contentType(APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.data.accessToken");
    }

    private String createComplex(String token, String name) throws Exception {
        String body = """
            {
                "name": "%s",
                "accountHolder": "Maria Lopez",
                "aliasCbu": "hostflow.mp",
                "bank": "Banco Nación"
            }
            """.formatted(name);

        return mvc.perform(post("/api/v1/complexes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
    }

    private UUID saveAddon(String complexId, String name, String price) {
        Complex complex = complexRepository.findById(UUID.fromString(complexId)).orElseThrow();
        Addon addon = new Addon();
        addon.setComplex(complex);
        addon.setName(name);
        addon.setDescription("Descripcion de " + name);
        addon.setPrice(new BigDecimal(price));
        addon.setActive(true);
        return addonRepository.save(addon).getId();
    }

    private Setup setup() throws Exception {
        String ownerEmail = UUID.randomUUID() + "@mail.com";
        String token = register(ownerEmail);
        String complexName = "E2E Cabanas Delta";
        String created = createComplex(token, complexName);
        String complexId = JsonPath.read(created, "$.data.id");
        String slug = JsonPath.read(created, "$.data.slug");
        UUID breakfast = saveAddon(complexId, "Desayuno Regional", "1500.00");
        UUID kayak = saveAddon(complexId, "Kayak Doble", "8000.00");
        return new Setup(token, ownerEmail, complexId, complexName, slug, breakfast, kayak);
    }

    private String onboardingBody(Setup s, String guestEmail) {
        return "{\"guestName\":\"Ana Perez\",\"guestEmail\":\"" + guestEmail + "\","
                + "\"guestPhone\":\"+5493511234567\","
                + "\"checkIn\":\"2099-01-10\",\"checkOut\":\"2099-01-12\",\"guestsCount\":3,"
                + "\"addons\":[{\"addonId\":\"" + s.breakfast() + "\",\"quantity\":2},"
                + "{\"addonId\":\"" + s.kayak() + "\",\"quantity\":1}],"
                + "\"boat\":{\"departureAt\":\"2099-01-10T08:30:00\",\"returnAt\":\"2099-01-12T18:00:00\","
                + "\"passengers\":3,\"pickupPoint\":\"Muelle de Tigre\",\"comments\":\"Con equipaje\"}}";
    }

    private String postOnboarding(String slug, String json, int expectedStatus) throws Exception {
        return mvc.perform(post("/api/v1/public/complexes/" + slug + "/onboarding")
                        .contentType(APPLICATION_JSON).content(json))
                .andExpect(status().is(expectedStatus))
                .andReturn().getResponse().getContentAsString();
    }

    private BoatRequestStatus waitForBoatStatus(UUID bookingId, BoatRequestStatus expected) throws Exception {
        BoatRequestStatus current = null;
        for (int i = 0; i < 30; i++) {
            current = boatRequestRepository.findByBookingId(bookingId).orElseThrow().getStatus();
            if (current == expected) {
                return current;
            }
            Thread.sleep(100);
        }
        return current;
    }

    @Test
    void full_flow_owner_creates_complex_guest_books_and_everyone_is_notified() throws Exception {
        Setup s = setup();
        String guestEmail = "ana-" + UUID.randomUUID() + "@mail.com";

        // 1) el turista ve la ficha pública del complejo
        mvc.perform(get("/api/v1/public/complexes/" + s.slug()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.open").value(true))
                .andExpect(jsonPath("$.data.addons.length()").value(2));

        // 2) el turista completa el onboarding con adicionales y bote
        String response = postOnboarding(s.slug(), onboardingBody(s, guestEmail), 201);
        assertThat(JsonPath.<String>read(response, "$.data.status")).isEqualTo("PENDIENTE");
        assertThat(JsonPath.<Number>read(response, "$.data.total").doubleValue()).isEqualTo(11000.0);
        assertThat(JsonPath.<Boolean>read(response, "$.data.boatRequested")).isTrue();
        assertThat(JsonPath.<String>read(response, "$.data.paymentInfo.accountHolder")).isEqualTo("Maria Lopez");
        UUID bookingId = UUID.fromString(JsonPath.read(response, "$.data.bookingId"));

        // 3) el dueño ve la reserva en su listado y en el detalle
        mvc.perform(get("/api/v1/complexes/" + s.complexId() + "/bookings")
                        .header("Authorization", "Bearer " + s.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(bookingId.toString()))
                .andExpect(jsonPath("$.data[0].guestName").value("Ana Perez"))
                .andExpect(jsonPath("$.data[0].status").value("PENDIENTE"));
        mvc.perform(get("/api/v1/bookings/" + bookingId)
                        .header("Authorization", "Bearer " + s.token()))
                .andExpect(status().isOk());

        // 4) salen dos mails: uno al dueño y una confirmación al turista
        ArgumentCaptor<SimpleMailMessage> mails = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, timeout(3000).times(2)).send(mails.capture());
        List<SimpleMailMessage> sent = mails.getAllValues();
        List<String> recipients = sent.stream().map(m -> m.getTo()[0]).toList();
        assertThat(recipients).containsExactlyInAnyOrder(s.ownerEmail(), guestEmail);

        SimpleMailMessage ownerMail = sent.stream()
                .filter(m -> m.getTo()[0].equals(s.ownerEmail())).findFirst().orElseThrow();
        assertThat(ownerMail.getSubject()).contains(s.complexName());
        assertThat(ownerMail.getText()).contains("Ana Perez", "Desayuno Regional x2", "Total: 11000");

        // 5) el webhook del bote recibe el JSON y la solicitud queda en SENT
        ArgumentCaptor<String> payload = ArgumentCaptor.forClass(String.class);
        verify(webhookClient, timeout(3000)).post(eq(WEBHOOK_URL), payload.capture());
        assertThat(payload.getValue()).contains(bookingId.toString(), "Ana Perez", "2099-01-10T08:30");
        assertThat(waitForBoatStatus(bookingId, BoatRequestStatus.SENT)).isEqualTo(BoatRequestStatus.SENT);
    }

    @Test
    void booking_is_created_even_if_mail_and_webhook_fail() throws Exception {
        doThrow(new RuntimeException("smtp caido")).when(mailSender).send(any(SimpleMailMessage.class));
        doThrow(new RuntimeException("webhook caido")).when(webhookClient).post(anyString(), anyString());
        Setup s = setup();

        String response = postOnboarding(s.slug(), onboardingBody(s, "ana@mail.com"), 201);
        UUID bookingId = UUID.fromString(JsonPath.read(response, "$.data.bookingId"));

        mvc.perform(get("/api/v1/complexes/" + s.complexId() + "/bookings")
                        .header("Authorization", "Bearer " + s.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
        assertThat(waitForBoatStatus(bookingId, BoatRequestStatus.FAILED)).isEqualTo(BoatRequestStatus.FAILED);
    }
}