package nocountry.grupo4.delta_tigre.notification;

import nocountry.grupo4.delta_tigre.booking.BoatRequest;
import nocountry.grupo4.delta_tigre.booking.BoatRequestRepository;
import nocountry.grupo4.delta_tigre.booking.Booking;
import nocountry.grupo4.delta_tigre.booking.BookingAddon;
import nocountry.grupo4.delta_tigre.booking.BookingAddonRepository;
import nocountry.grupo4.delta_tigre.booking.BookingCreatedEvent;
import nocountry.grupo4.delta_tigre.booking.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Component
public class BookingNotificationListener {

    private static final Logger log = LoggerFactory.getLogger(BookingNotificationListener.class);

    private final BookingRepository bookingRepository;
    private final BookingAddonRepository bookingAddonRepository;
    private final BoatRequestRepository boatRequestRepository;
    private final MailService mailService;
    private final boolean notifyGuest;

    public BookingNotificationListener(BookingRepository bookingRepository,
                                       BookingAddonRepository bookingAddonRepository,
                                       BoatRequestRepository boatRequestRepository,
                                       MailService mailService,
                                       @Value("${app.mail.notify-guest:true}") boolean notifyGuest) {
        this.bookingRepository = bookingRepository;
        this.bookingAddonRepository = bookingAddonRepository;
        this.boatRequestRepository = boatRequestRepository;
        this.mailService = mailService;
        this.notifyGuest = notifyGuest;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void onBookingCreated(BookingCreatedEvent event) {
        try {
            Booking booking = bookingRepository.findById(event.bookingId()).orElse(null);
            if (booking == null) {
                return;
            }

            List<BookingAddon> items = bookingAddonRepository.findByBookingIdWithAddon(booking.getId());
            BigDecimal total = BigDecimal.ZERO;
            StringBuilder lines = new StringBuilder();
            for (BookingAddon item : items) {
                BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                total = total.add(subtotal);
                lines.append("- ").append(item.getAddon().getName())
                        .append(" x").append(item.getQuantity())
                        .append(" = ").append(subtotal).append("\n");
            }

            Optional<BoatRequest> boat = boatRequestRepository.findByBookingId(booking.getId());
            String boatText = boat
                    .map(b -> "Bote solicitado:\n"
                            + "- Salida: " + b.getDepartureAt() + "\n"
                            + "- Regreso: " + b.getReturnAt() + "\n"
                            + "- Punto de encuentro: " + (b.getPickupPoint() == null ? "-" : b.getPickupPoint()) + "\n"
                            + "- Pasajeros: " + b.getPassengers() + "\n")
                    .orElse("Bote: no solicitado\n");

            String complexName = booking.getComplex().getName();
            String ownerEmail = booking.getComplex().getOwner().getEmail();

            String ownerText = "Nueva reserva en " + complexName + "\n\n"
                    + "Huésped: " + booking.getGuestName() + "\n"
                    + "Email: " + (booking.getGuestEmail() == null ? "-" : booking.getGuestEmail()) + "\n"
                    + "Teléfono: " + (booking.getGuestPhone() == null ? "-" : booking.getGuestPhone()) + "\n"
                    + "Cantidad de huéspedes: " + booking.getGuestsCount() + "\n"
                    + "Check-in: " + booking.getCheckIn() + "\n"
                    + "Check-out: " + booking.getCheckOut() + "\n\n"
                    + "Adicionales:\n" + (lines.length() == 0 ? "- ninguno\n" : lines)
                    + "\nTotal: " + total + "\n\n"
                    + boatText;
            mailService.send(ownerEmail, "Nueva reserva en " + complexName, ownerText);

            if (notifyGuest && booking.getGuestEmail() != null && !booking.getGuestEmail().isBlank()) {
                String guestText = "Hola " + booking.getGuestName() + ",\n\n"
                        + "Recibimos tu pedido en " + complexName + " para el " + booking.getCheckIn()
                        + " al " + booking.getCheckOut() + ". El alojamiento se va a poner en contacto con vos.\n";
                mailService.send(booking.getGuestEmail(), "Recibimos tu pedido en " + complexName, guestText);
            }
        } catch (Exception e) {
            log.warn("Error armando la notificación de la reserva {}: {}", event.bookingId(), e.getMessage());
        }
    }
}