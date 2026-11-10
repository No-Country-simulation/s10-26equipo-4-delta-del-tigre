package nocountry.grupo4.delta_tigre.addon;

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
@Tag(name = "Adicionales", description = "Gestión de los adicionales de cada complejo")
@SecurityRequirement(name = "bearerAuth")
public class AddonController {
    private  final AddonService service;

    @PostMapping("/complexes/{complexId}/addons")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> create(@PathVariable UUID complexId,
                                         @Valid @RequestBody AddonRequest request) {
        return Response.response(HttpStatus.CREATED, "Adicional creado", service.create(complexId, request));
    }

    @GetMapping("/complexes/{complexId}/addons")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> list(@PathVariable UUID complexId) {
        return Response.ok(service.list(complexId));
    }

    @PutMapping("/addons/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> update(@PathVariable UUID id, @Valid @RequestBody AddonRequest request) {
        return Response.ok(service.update(id, request));
    }

    @PatchMapping("/addons/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Object> updateStatus(@PathVariable UUID id,
                                               @Valid @RequestBody UpdateAddonStatusRequest request) {
        return Response.ok(service.updateStatus(id, request));
    }
}
