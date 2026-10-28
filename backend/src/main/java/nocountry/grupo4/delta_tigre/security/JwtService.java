package nocountry.grupo4.delta_tigre.security;

import nocountry.grupo4.delta_tigre.owner.Owner;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class JwtService {
    private final JwtEncoder encoder;
    private final JwtProperties props;

    public JwtService(JwtEncoder encoder, JwtProperties props) {
        this.encoder = encoder;
        this.props = props;
    }

    public String generate(Owner owner) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(owner.getId().toString())
                .claim("email", owner.getEmail())
                .claim("roles", List.of("OWNER"))
                .issuedAt(now)
                .expiresAt(now.plus(props.expirationMinutes(), ChronoUnit.MINUTES))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public long expiresInSeconds() { return props.expirationMinutes() * 60; }
}
