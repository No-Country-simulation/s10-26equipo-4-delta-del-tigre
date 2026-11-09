package nocountry.grupo4.delta_tigre.notification;

import nocountry.grupo4.delta_tigre.booking.BoatRequest;
import nocountry.grupo4.delta_tigre.booking.BoatRequestRepository;
import nocountry.grupo4.delta_tigre.booking.BoatRequestStatus;
import nocountry.grupo4.delta_tigre.booking.BookingCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
public class BoatWebhookService {

    private static final Logger log = LoggerFactory.getLogger(BoatWebhookService.class);

    private final BoatRequestRepository boatRequestRepository;
    private final BoatWebhookClient client;
    private final String webhookUrl;

    public BoatWebhookService(BoatRequestRepository boatRequestRepository,
                              BoatWebhookClient client,
                              @Value("${boat.webhook.url:}") String webhookUrl) {
        this.boatRequestRepository = boatRequestRepository;
        this.client = client;
        this.webhookUrl = webhookUrl;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onBookingCreated(BookingCreatedEvent event) {
        BoatRequest request = boatRequestRepository.findByBookingId(event.bookingId()).orElse(null);
        if (request == null) {
            return;
        }
        if (webhookUrl == null || webhookUrl.isBlank()) {
            log.info("BOAT_WEBHOOK_URL no está configurada: la solicitud de bote {} queda en PENDING", request.getId());
            return;
        }
        try {
            client.post(webhookUrl, request.getPayloadJson());
            request.setStatus(BoatRequestStatus.SENT);
        } catch (Exception e) {
            log.warn("No se pudo enviar la solicitud de bote {} al webhook: {}", request.getId(), e.getMessage());
            request.setStatus(BoatRequestStatus.FAILED);
        }
        boatRequestRepository.save(request);
    }
}