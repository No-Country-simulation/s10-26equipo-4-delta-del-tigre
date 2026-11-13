package nocountry.grupo4.delta_tigre.notification;

import nocountry.grupo4.delta_tigre.booking.BoatRequest;
import nocountry.grupo4.delta_tigre.booking.BoatRequestRepository;
import nocountry.grupo4.delta_tigre.booking.BoatRequestStatus;
import nocountry.grupo4.delta_tigre.booking.BookingCreatedEvent;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BoatWebhookServiceTest {

    private static final String URL = "https://webhook.test/boat";
    private static final String PAYLOAD = "{\"bookingId\":\"abc\"}";

    private final BoatRequestRepository repository = mock(BoatRequestRepository.class);
    private final BoatWebhookClient client = mock(BoatWebhookClient.class);

    private BoatRequest prepare(UUID bookingId) {
        BoatRequest request = new BoatRequest();
        request.setPayloadJson(PAYLOAD);
        when(repository.findByBookingId(bookingId)).thenReturn(Optional.of(request));
        return request;
    }

    private BoatWebhookService service(String url) {
        return new BoatWebhookService(repository, client, url);
    }

    @Test
    void marks_sent_when_webhook_responds_ok() {
        UUID bookingId = UUID.randomUUID();
        BoatRequest request = prepare(bookingId);

        service(URL).onBookingCreated(new BookingCreatedEvent(bookingId));

        assertEquals(BoatRequestStatus.SENT, request.getStatus());
        verify(client).post(URL, PAYLOAD);
        verify(repository).save(request);
    }

    @Test
    void marks_failed_when_webhook_fails() {
        UUID bookingId = UUID.randomUUID();
        BoatRequest request = prepare(bookingId);
        doThrow(new RuntimeException("webhook caido")).when(client).post(anyString(), anyString());

        service(URL).onBookingCreated(new BookingCreatedEvent(bookingId));

        assertEquals(BoatRequestStatus.FAILED, request.getStatus());
        verify(repository).save(request);
    }

    @Test
    void stays_pending_when_url_is_not_configured() {
        UUID bookingId = UUID.randomUUID();
        BoatRequest request = prepare(bookingId);

        service("").onBookingCreated(new BookingCreatedEvent(bookingId));

        assertEquals(BoatRequestStatus.PENDING, request.getStatus());
        verify(client, never()).post(anyString(), anyString());
        verify(repository, never()).save(any(BoatRequest.class));
    }

    @Test
    void does_nothing_when_booking_has_no_boat_request() {
        UUID bookingId = UUID.randomUUID();
        when(repository.findByBookingId(bookingId)).thenReturn(Optional.empty());

        service(URL).onBookingCreated(new BookingCreatedEvent(bookingId));

        verify(client, never()).post(anyString(), anyString());
        verify(repository, never()).save(any(BoatRequest.class));
    }
}