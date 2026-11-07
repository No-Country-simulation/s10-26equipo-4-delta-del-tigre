package nocountry.grupo4.delta_tigre.booking;

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
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping("/{slug}/onboarding")
    public ResponseEntity<Object> onboard(
            @PathVariable String slug,
            @Valid @RequestBody OnboardingRequest request) {

        return Response.response(
                HttpStatus.CREATED,
                "Reserva creada",
                onboardingService.create(slug, request)
        );
    }
}
