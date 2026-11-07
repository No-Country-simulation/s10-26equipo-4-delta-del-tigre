package nocountry.grupo4.delta_tigre.addon;

import lombok.RequiredArgsConstructor;
import nocountry.grupo4.delta_tigre.complex.Complex;
import nocountry.grupo4.delta_tigre.complex.ComplexRepository;
import nocountry.grupo4.delta_tigre.security.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddonService {

    private final AddonRepository addonRepository;
    private final ComplexRepository complexRepository;

    @Transactional
    public AddonResponse create(UUID complexId, AddonRequest r) {
        Complex complex = findOwnedComplex(complexId);
        Addon addon = new Addon();
        addon.setComplex(complex);
        addon.setName(r.name().trim());
        addon.setDescription(r.description());
        addon.setPrice(r.price());
        addon.setActive(true);
        return AddonResponse.from(addonRepository.save(addon));
    }

    private Complex findOwnedComplex(UUID complexId) {
        return complexRepository.findByIdAndOwnerId(complexId, SecurityUtils.currentOwnerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complejo no encontrado"));
    }

    @Transactional(readOnly = true)
    public List<AddonResponse> list(UUID complexId) {
        findOwnedComplex(complexId);
        return addonRepository.findByComplexIdOrderByNameAsc(complexId).stream()
                .map(AddonResponse::from)
                .toList();
    }

    @Transactional
    public AddonResponse update(UUID id, AddonRequest r) {
        Addon addon = findOwnedAddon(id);
        addon.setName(r.name().trim());
        addon.setDescription(r.description());
        addon.setPrice(r.price());
        return AddonResponse.from(addonRepository.save(addon));
    }

    private Addon findOwnedAddon(UUID id) {
        return addonRepository.findByIdAndComplexOwnerId(id, SecurityUtils.currentOwnerId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Adicional no encontrado"));
    }

    @Transactional
    public AddonResponse updateStatus(UUID id, UpdateAddonStatusRequest r) {
        Addon addon = findOwnedAddon(id);
        addon.setActive(r.active());;
        return AddonResponse.from(addonRepository.save(addon));
    }
}