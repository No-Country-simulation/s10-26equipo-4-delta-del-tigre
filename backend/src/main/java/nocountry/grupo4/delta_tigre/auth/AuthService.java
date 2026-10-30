package nocountry.grupo4.delta_tigre.auth;


import lombok.RequiredArgsConstructor;
import nocountry.grupo4.delta_tigre.owner.Owner;
import nocountry.grupo4.delta_tigre.owner.OwnerRepository;
import nocountry.grupo4.delta_tigre.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final OwnerRepository owners;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwt;

    @Transactional
    public AuthResponse register(RegisterRequest r) {
        String email = r.email().trim().toLowerCase();
        if (owners.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }
        Owner o = new Owner();
        o.setName(r.name().trim());
        o.setEmail(email);
        o.setPasswordHash(encoder.encode(r.password()));
        o.setPhone(r.phone());
        o.setCountry(r.country());
        o.setIdentificationType(r.identificationType());
        o.setIdentificationNumber(r.identificationNumber());
        owners.save(o);
        return token(o);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest r) {
        String email = r.email().trim().toLowerCase();
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(email, r.password()));
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }
        Owner o = owners.findByEmail(email).orElseThrow();
        return token(o);
    }

    private AuthResponse token(Owner o) {
        return new AuthResponse(jwt.generate(o), "Bearer", jwt.expiresInSeconds());
    }
}