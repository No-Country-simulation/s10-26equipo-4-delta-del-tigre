package nocountry.grupo4.delta_tigre.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint, AccessDeniedHandler {

    @Override
    public void commence(HttpServletRequest req, HttpServletResponse res, AuthenticationException ex)
            throws IOException {
        write(res, HttpStatus.UNAUTHORIZED, "Token ausente, inválido o vencido");
    }

    @Override
    public void handle(HttpServletRequest req, HttpServletResponse res, AccessDeniedException ex)
            throws IOException {
        write(res, HttpStatus.FORBIDDEN, "No tenés permisos para esta acción");
    }

    private void write(HttpServletResponse res, HttpStatus s, String msg) throws IOException {
        res.setStatus(s.value());
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"status\":%d,\"message\":\"%s\",\"data\":null}".formatted(s.value(), msg));
    }
}