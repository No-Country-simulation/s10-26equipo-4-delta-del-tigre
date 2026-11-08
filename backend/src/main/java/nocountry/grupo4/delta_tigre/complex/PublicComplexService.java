package nocountry.grupo4.delta_tigre.complex;

import nocountry.grupo4.delta_tigre.addon.AddonRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PublicComplexService {

    private final ComplexRepository complexRepository;
    private final AddonRepository addonRepository;

    public PublicComplexService(ComplexRepository complexRepository, AddonRepository addonRepository) {
        this.complexRepository = complexRepository;
        this.addonRepository = addonRepository;
    }

    @Transactional(readOnly = true)
    public PublicComplexResponse getBySlug(String slug) {
        Complex complex = complexRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complejo no encontrado"));

        List<PublicComplexResponse.PublicAddonResponse> addons = addonRepository
                .findByComplexIdAndActiveTrue(complex.getId()).stream()
                .map(a -> new PublicComplexResponse.PublicAddonResponse(
                        a.getId(), a.getName(), a.getDescription(), a.getPrice()))
                .toList();

        return new PublicComplexResponse(complex.getId(), complex.getName(), complex.getSlug(),
                complex.getAddress(), complex.getLogoUrl(), complex.getBrandColors(), addons);
    }
}