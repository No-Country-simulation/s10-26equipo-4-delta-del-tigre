package nocountry.grupo4.delta_tigre.complex;

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
@RequestMapping("/api/complexes")
@RequiredArgsConstructor
@Tag(name = "Complejos", description = "Gestión de los complejos del dueño")
@SecurityRequirement(name = "bearerAuth")
public class ComplexController {

    private final ComplexService service;

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> create(@Valid @RequestBody CreateComplexRequest request) {
        return Response.response(HttpStatus.CREATED, "Complejo creado", service.create(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> list() {
        return Response.ok(service.list());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> get(@PathVariable UUID id) {
        return Response.ok(service.get(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> update(@PathVariable UUID id, @Valid @RequestBody UpdateComplexRequest request) {
        return Response.ok(service.update(id,request));
    }

    @PatchMapping("/{id}/payment-info")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> updatePaymentInfo(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePaymentInfoRequest request) {
        return Response.ok(service.updatePaymentInfo(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> updateStatus(@PathVariable UUID id,
                                               @Valid @RequestBody UpdateComplexStatusRequest request) {
        return Response.ok(service.updateStatus(id, request), "Estado actualizado");
    }
}