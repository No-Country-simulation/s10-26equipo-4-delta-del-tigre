package nocountry.grupo4.delta_tigre.complex;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nocountry.grupo4.delta_tigre.response.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/public/complexes")
@RequiredArgsConstructor
public class PublicComplexController {

    private final PublicComplexService service;

    @GetMapping("/{slug}")
    public ResponseEntity<Object> getBySlug(@PathVariable String slug) {
        return Response.ok(service.getBySlug(slug));
    }
}
