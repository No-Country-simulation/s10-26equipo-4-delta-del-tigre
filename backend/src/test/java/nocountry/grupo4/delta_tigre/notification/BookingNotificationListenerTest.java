package nocountry.grupo4.delta_tigre.notification;

import nocountry.grupo4.delta_tigre.booking.BoatRequestRepository;
import nocountry.grupo4.delta_tigre.booking.Booking;
import nocountry.grupo4.delta_tigre.booking.BookingAddon;
import nocountry.grupo4.delta_tigre.booking.BookingAddonRepository;
import nocountry.grupo4.delta_tigre.booking.BookingCreatedEvent;
import nocountry.grupo4.delta_tigre.booking.BookingRepository;
import nocountry.grupo4.delta_tigre.complex.Complex;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BookingNotificationListenerTest {

    private final BookingRepository bookingRepository = mock(BookingRepository.class);
    private final BookingAddonRepository bookingAddonRepository = mock(BookingAddonRepository.class);
    private final BoatRequestRepository boatRequestRepository = mock(BoatRequestRepository.class);
    private final MailService mailService = mock(MailService.class);

    private void prepareBooking(UUID id, String guestEmail) {
        Complex complex = mock(Complex.class, RETURNS_DEEP_STUBS);
        when(complex.getName()).thenReturn("Casa del Delta");
        when(complex.getOwner().getEmail()).thenReturn("owner@mail.com");

        Booking booking = mock(Booking.class);
        when(booking.getId()).thenReturn(id);
        when(booking.getComplex()).thenReturn(complex);
        when(booking.getGuestName()).thenReturn("Ana");
        when(booking.getGuestEmail()).thenReturn(guestEmail);
        when(bookingRepository.findById(id)).thenReturn(Optional.of(booking));
        when(boatRequestRepository.findByBookingId(id)).thenReturn(Optional.empty());
    }

    private BookingAddon prepareLine() {
        BookingAddon line = mock(BookingAddon.class, RETURNS_DEEP_STUBS);
        when(line.getAddon().getName()).thenReturn("Desayuno");
        when(line.getUnitPrice()).thenReturn(new BigDecimal("1500"));
        when(line.getQuantity()).thenReturn(2);
        return line;
    }

    private BookingNotificationListener listener(boolean notifyGuest) {
        return new BookingNotificationListener(bookingRepository, bookingAddonRepository,
                boatRequestRepository, mailService, notifyGuest);
    }

    @Test
    void sends_mail_to_owner_and_confirmation_to_guest() {
        UUID id = UUID.randomUUID();
        prepareBooking(id, "ana@mail.com");
        BookingAddon line = prepareLine();
        when(bookingAddonRepository.findByBookingIdWithAddon(id)).thenReturn(List.of(line));

        listener(true).onBookingCreated(new BookingCreatedEvent(id));

        ArgumentCaptor<String> ownerBody = ArgumentCaptor.forClass(String.class);
        verify(mailService).send(eq("owner@mail.com"), eq("Nueva reserva en Casa del Delta"), ownerBody.capture());
        assertTrue(ownerBody.getValue().contains("Desayuno x2 = 3000"));
        assertTrue(ownerBody.getValue().contains("Total: 3000"));
        verify(mailService).send(eq("ana@mail.com"), anyString(), anyString());
    }

    @Test
    void does_not_mail_guest_when_disabled() {
        UUID id = UUID.randomUUID();
        prepareBooking(id, "ana@mail.com");
        when(bookingAddonRepository.findByBookingIdWithAddon(id)).thenReturn(List.of());

        listener(false).onBookingCreated(new BookingCreatedEvent(id));

        verify(mailService).send(eq("owner@mail.com"), anyString(), anyString());
        verify(mailService, never()).send(eq("ana@mail.com"), anyString(), anyString());
    }

    @Test
    void unknown_booking_sends_nothing() {
        UUID id = UUID.randomUUID();
        when(bookingRepository.findById(id)).thenReturn(Optional.empty());

        listener(true).onBookingCreated(new BookingCreatedEvent(id));

        verify(mailService, never()).send(anyString(), anyString(), anyString());
    }
}