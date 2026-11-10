package nocountry.grupo4.delta_tigre.booking;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nocountry.grupo4.delta_tigre.response.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/complexes")
@RequiredArgsConstructor
@Tag(name = "Onboarding público", description = "Ficha del huésped: crea la reserva desde el link del complejo (no requiere autenticación)")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping("/{slug}/onboarding")
    @SecurityRequirements
    @Operation(
            summary = "Completar la ficha y crear la reserva",
            description = "Crea una reserva en estado PENDIENTE para el complejo indicado por su slug. "
                    + "Opcionalmente incluye adicionales (`addons`) y una solicitud de cotización de bote (`boat`). "
                    + "`paymentInfo` solo se devuelve si hay adicionales. "
                    + "Después de guardar, el dueño y el huésped reciben un email y, si hay bote, se envía el JSON al webhook.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Reserva creada"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos, o adicional inexistente, inactivo o de otro complejo"),
            @ApiResponse(responseCode = "404", description = "El complejo no existe"),
            @ApiResponse(responseCode = "409", description = "El complejo está cerrado y no recibe reservas")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(
            mediaType = "application/json",
            examples = {
                    @ExampleObject(name = "Solo huésped", value = """
                            {
                              "guestName": "Ana Perez",
                              "guestEmail": "ana@mail.com",
                              "guestPhone": "+5491123456789",
                              "checkIn": "2027-01-10",
                              "checkOut": "2027-01-12",
                              "guestsCount": 2,
                              "preferences": "Cama matrimonial"
                            }
                            """),
                    @ExampleObject(name = "Con bote", value = """
                            {
                              "guestName": "Ana Perez",
                              "guestEmail": "ana@mail.com",
                              "guestPhone": "+5491123456789",
                              "checkIn": "2027-01-10",
                              "checkOut": "2027-01-12",
                              "guestsCount": 2,
                              "boat": {
                                "departureAt": "2027-01-10T09:00:00",
                                "returnAt": "2027-01-12T17:00:00",
                                "passengers": 2,
                                "pickupPoint": "Muelle principal",
                                "comments": "Llevamos equipaje"
                              }
                            }
                            """)
            }))
    public ResponseEntity<Object> onboard(
            @Parameter(description = "Slug del complejo", example = "cabanas-del-rio-demo")
            @PathVariable String slug,
            @Valid @RequestBody OnboardingRequest request) {

        return Response.response(
                HttpStatus.CREATED,
                "Reserva creada",
                onboardingService.create(slug, request)
        );
    }
}