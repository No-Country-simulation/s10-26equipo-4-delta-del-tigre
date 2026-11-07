package nocountry.grupo4.delta_tigre.booking;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nocountry.grupo4.delta_tigre.complex.ComplexRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/public/complexes")
@RequiredArgsConstructor
public class OnboardingController {

    private final ComplexRepository complexRepository;

    @PostMapping("/{slug}/onboarding")
    public ResponseEntity<Void> onboard(@PathVariable String slug,
                                        @Valid @RequestBody OnboardingRequest request) {
        complexRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complejo no encontrado"));
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "Pendiente de implementar");
    }
}