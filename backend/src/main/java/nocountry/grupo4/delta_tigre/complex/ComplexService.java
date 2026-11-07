package nocountry.grupo4.delta_tigre.complex;

import lombok.RequiredArgsConstructor;
import nocountry.grupo4.delta_tigre.owner.Owner;
import nocountry.grupo4.delta_tigre.owner.OwnerRepository;
import nocountry.grupo4.delta_tigre.security.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplexService {

    private final ComplexRepository complexRepository;
    private final OwnerRepository ownerRepository;

    @Transactional
    public ComplexResponse create(CreateComplexRequest r) {
        UUID ownerId = SecurityUtils.currentOwnerId();
        Owner owner = ownerRepository.getReferenceById(ownerId);

        Complex c = new Complex();
        c.setOwner(owner);
        c.setName(r.name().trim());
        c.setAddress(r.address());
        c.setAccountHolder(r.accountHolder());
        c.setAliasCbu(r.aliasCbu());
        c.setBank(r.bank());
        c.setSlug(uniqueSlug(c.getName()));
        return ComplexResponse.from(complexRepository.save(c));
    }

    private String uniqueSlug(String name) {
        String base = SlugUtils.slugify(name);
        String slug = base;
        int n = 2;
        while (complexRepository.existsBySlug(slug)) {
            slug = base + "-" + n++;
        }
        return slug;
    }

    @Transactional(readOnly = true)
    public List<ComplexResponse> list() {
        return complexRepository.findByOwnerIdOrderByNameAsc(SecurityUtils.currentOwnerId())
                .stream()
                .map(ComplexResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ComplexResponse get(UUID id) {
        return ComplexResponse.from(findOwned(id));
    }

    @Transactional
    public ComplexResponse update(UUID id, UpdateComplexRequest r) {
        Complex complex = findOwned(id);
        complex.setName(r.name().trim());
        complex.setAddress(r.address());
        complex.setBrandColors(r.brandColors());
        return ComplexResponse.from(complexRepository.save(complex));
    }

    private Complex findOwned(UUID id) {
        return complexRepository.findByIdAndOwnerId(id, SecurityUtils.currentOwnerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complejo no encontrado"));
    }

    @Transactional
    public ComplexResponse updatePaymentInfo(UUID complexId, UpdatePaymentInfoRequest request) {
        Complex complex = findOwned(complexId);
        complex.setAccountHolder(request.accountHolder().trim());
        complex.setAliasCbu(request.aliasCbu().trim());
        complex.setBank(request.bank().trim());
        return ComplexResponse.from(complexRepository.save(complex));
    }
}
