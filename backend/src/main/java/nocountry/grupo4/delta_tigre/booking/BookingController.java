package nocountry.grupo4.delta_tigre.booking;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nocountry.grupo4.delta_tigre.response.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Reservas", description = "Gestión de las reservas de cada complejo")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    private final BookingService service;

    @PostMapping("/complexes/{complexId}/bookings")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> create(@PathVariable UUID complexId,
                                         @Valid @RequestBody BookingRequest request) {
        return Response.response(HttpStatus.CREATED, "Reserva creada", service.create(complexId, request));
    }

    @GetMapping("/complexes/{complexId}/bookings")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> list(@PathVariable UUID complexId,
                                       @Parameter(description = "Filtro opcional: PENDIENTE, CONFIRMADA, FINALIZADA O CANCELADA")
                                       @RequestParam(required = false) BookingStatus status) {
        return Response.ok(service.list(complexId, status));
    }

    @GetMapping("/bookings/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> get(@PathVariable UUID id) {
        return Response.ok(service.get(id));
    }

}