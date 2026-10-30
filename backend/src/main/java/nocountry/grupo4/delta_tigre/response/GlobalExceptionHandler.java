package nocountry.grupo4.delta_tigre.response;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Object> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        return Response.response(status, ex.getReason(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        String msg = fieldErrors.isEmpty()
                ? "Datos inválidos"
                : fieldErrors.values().iterator().next();
        return Response.response(HttpStatus.BAD_REQUEST, msg, fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Object> handleConstraintViolation(ConstraintViolationException ex) {
        return Response.response(HttpStatus.BAD_REQUEST, "Datos inválidos", null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrity(DataIntegrityViolationException ex) {
        String msg = "Conflicto en la operación de base de datos.";
        Throwable root = ex.getRootCause();
        if (root != null && root.getMessage() != null) {
            String rootMsg = root.getMessage().toLowerCase();
            if (rootMsg.contains("unique") || rootMsg.contains("duplicate entry")) {
                msg = "El valor proporcionado ya existe y debe ser único.";
            } else if (rootMsg.contains("cannot be null") || rootMsg.contains("violates not-null constraint")) {
                msg = "Falta un valor obligatorio.";
            } else if (rootMsg.contains("foreign key constraint") || rootMsg.contains("referential integrity")) {
                msg = "La referencia a otro registro es inválida o el registro está en uso.";
            }
        }
        log.warn("Violación de integridad de datos", ex);
        return Response.dbError(msg);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleMalformedJson(HttpMessageNotReadableException ex) {
        return Response.response(HttpStatus.BAD_REQUEST,
                "El cuerpo de la solicitud es inválido o tiene un JSON mal formado", null);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Object> handleAuthentication(AuthenticationException ex) {
        return Response.unauthorized("Credenciales inválidas");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDenied(AccessDeniedException ex) {
        return Response.error(HttpStatus.FORBIDDEN, "No tenés permisos para esta acción");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Object> handleNoResource(NoResourceFoundException ex) {
        return Response.notFound("Recurso no encontrado");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneric(Exception ex) {
        log.error("Error no controlado", ex);
        return Response.error(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor");
    }
}
