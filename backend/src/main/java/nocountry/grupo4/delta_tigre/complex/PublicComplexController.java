package nocountry.grupo4.delta_tigre.complex;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nocountry.grupo4.delta_tigre.response.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/complexes")
@RequiredArgsConstructor
@Tag(name = "Ficha pública", description = "Datos públicos del complejo para la ficha del huésped (no requiere autenticación)")
public class PublicComplexController {

    private final PublicComplexService service;

    @GetMapping("/{slug}")
    @SecurityRequirements
    @Operation(
            summary = "Ver la ficha pública de un complejo",
            description = "Devuelve nombre, dirección, logo, color de marca, si está abierto (`open`) y sus adicionales activos con precio e imagen.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ficha del complejo"),
            @ApiResponse(responseCode = "404", description = "El complejo no existe")
    })
    public ResponseEntity<Object> getBySlug(
            @Parameter(description = "Slug del complejo", example = "cabanas-del-rio-demo")
            @PathVariable String slug) {
        return Response.ok(service.getBySlug(slug));
    }
}