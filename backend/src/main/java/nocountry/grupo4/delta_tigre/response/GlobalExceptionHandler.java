package nocountry.grupo4.delta_tigre.response;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.ConstraintViolationException;
import nocountry.grupo4.delta_tigre.response.Response;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class) // Reutilizamos Response.response para mantener formato consistente
    public ResponseEntity<Object> handleResponseStatus(ResponseStatusException ex) {
        return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, ex.getReason(), ex);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationErrors(MethodArgumentNotValidException ex) {
        // Construir mapa con errores por campo y reutilizar Response.response
        Map<String, String> fieldErrors = new HashMap<>();
        List<String> errors = new ArrayList<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
            errors.add(fe.getDefaultMessage());
        }
        return Response.response(HttpStatus.BAD_REQUEST, errors.get(0), fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Object> handleConstraintViolation(ConstraintViolationException ex) {
        return Response.response(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrity(DataIntegrityViolationException ex) {
        String msg = "Conflicto en operación de base de datos.";
        Throwable root = ex.getRootCause();

        if (root != null) {
            String rootMsg = root.getMessage() != null ? root.getMessage().toLowerCase() : "";

            // 1. Manejo Genérico de Violación de Unicidad
            if (rootMsg.contains("unique") || rootMsg.contains("duplicate entry")) {
                // Este mensaje aplica a cualquier campo con unique=true (legajo, nombre, email, etc.)
                msg = "El valor proporcionado ya existe y debe ser único.";

            // 2. Manejo Genérico de Violación de No Nulo (nullable=false)
            } else if (rootMsg.contains("cannot be null") || rootMsg.contains("violates not-null constraint")) {
                // Este error puede ocurrir si falla la validación @NotNull o si un campo sin anotaciones es nullable=false
                msg = "Falta un valor obligatorio (no puede ser nulo) en un campo de la base de datos.";
            
            // 3. Manejo de Violación de Clave Foránea (FK)
            } else if (rootMsg.contains("foreign key constraint") || rootMsg.contains("referential integrity")) {
                msg = "La referencia a otra entidad es inválida o el registro que intenta eliminar está en uso.";
            
            // 4. Fallback: Usar el mensaje crudo de la BD
            } else {
                msg = root.getMessage();
            }
        } else if (ex.getMessage() != null) {
            msg = ex.getMessage();
        }

        // Reutilizamos Response.dbError para response 409
        return Response.dbError(msg);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleMalformedJson(HttpMessageNotReadableException ex) {
        String msg = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
        return Response.response(HttpStatus.BAD_REQUEST, "Request body is malformed or invalid JSON" + msg, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneric(Exception ex) {
        return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex.getMessage());
    }
}
