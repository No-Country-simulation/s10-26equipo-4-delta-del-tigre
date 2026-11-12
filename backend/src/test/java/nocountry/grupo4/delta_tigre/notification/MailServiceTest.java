package nocountry.grupo4.delta_tigre.notification;

import org.junit.jupiter.api.Test;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class MailServiceTest {

    private final JavaMailSender mailSender = mock(JavaMailSender.class);
    private final MailService mailService = new MailService(mailSender, "no-reply@hostflow.local");

    @Test
    void smtp_failure_does_not_throw() {
        doThrow(new RuntimeException("smtp caido")).when(mailSender).send(any(SimpleMailMessage.class));

        assertDoesNotThrow(() -> mailService.send("owner@mail.com", "Asunto", "Texto"));
    }

    @Test
    void blank_recipient_sends_nothing() {
        mailService.send(" ", "Asunto", "Texto");

        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }
}