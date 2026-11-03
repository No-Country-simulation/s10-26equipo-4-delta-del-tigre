package nocountry.grupo4.delta_tigre.complex;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nocountry.grupo4.delta_tigre.response.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/complexes")
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
}