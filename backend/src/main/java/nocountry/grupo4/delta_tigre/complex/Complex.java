package nocountry.grupo4.delta_tigre.complex;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nocountry.grupo4.delta_tigre.owner.Owner;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "complexes")
@Getter
@Setter
@NoArgsConstructor
public class Complex {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID ID;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    @Column(length = 255)
    private String address;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "brand_colors", length = 100)
    private String brandColors;

    @Column(name = "account_holder", length = 150)
    private String accountHolder;

    @Column(name = "alias_cbu", length = 60)
    private String aliasCbu;

    @Column(length =  100)
    private String bank;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
