package nocountry.grupo4.delta_tigre.booking;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nocountry.grupo4.delta_tigre.addon.Addon;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "booking_addons")
@Getter @Setter @NoArgsConstructor
public class BookingAddon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID Id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne( fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "addon_id", nullable = false)
    private Addon addon;

    @Column(nullable = false) private int quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;
}
