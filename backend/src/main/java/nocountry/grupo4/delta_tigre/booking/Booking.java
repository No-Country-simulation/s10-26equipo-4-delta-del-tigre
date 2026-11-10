package nocountry.grupo4.delta_tigre.booking;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nocountry.grupo4.delta_tigre.complex.Complex;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "complex_id", nullable = false)
    private Complex complex;

    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDIENTE;

    @Column(name = "guest_name", nullable = false, length = 150) private String guestName;
    @Column(name = "guest_identification_type", length = 20) private String guestIdentificationType;
    @Column(name = "guest_identification_number", length = 40) private String guestIdentificationNumber;
    @Column(name = "guest_email", length = 180) private String guestEmail;
    @Column(name = "guest_phone", length = 40) private String guestPhone;
    @Column(length = 1000) private String preferences;
    @Column(name = "other_allergies", length = 500) private String otherAllergies;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "booking_allergies", joinColumns = @JoinColumn(name = "booking_id"))
    @Column(name = "allergy", length = 40)
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private Set<Allergy> allergies = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now();
    }
}
