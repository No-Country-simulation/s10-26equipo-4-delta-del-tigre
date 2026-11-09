package nocountry.grupo4.delta_tigre.config;

import nocountry.grupo4.delta_tigre.addon.Addon;
import nocountry.grupo4.delta_tigre.addon.AddonRepository;
import nocountry.grupo4.delta_tigre.booking.Allergy;
import nocountry.grupo4.delta_tigre.booking.BoatRequest;
import nocountry.grupo4.delta_tigre.booking.BoatRequestRepository;
import nocountry.grupo4.delta_tigre.booking.BoatRequestStatus;
import nocountry.grupo4.delta_tigre.booking.Booking;
import nocountry.grupo4.delta_tigre.booking.BookingAddon;
import nocountry.grupo4.delta_tigre.booking.BookingAddonRepository;
import nocountry.grupo4.delta_tigre.booking.BookingRepository;
import nocountry.grupo4.delta_tigre.booking.BookingStatus;
import nocountry.grupo4.delta_tigre.complex.Complex;
import nocountry.grupo4.delta_tigre.complex.ComplexRepository;
import nocountry.grupo4.delta_tigre.owner.Owner;
import nocountry.grupo4.delta_tigre.owner.OwnerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    static final String OWNER_EMAIL = "demo@hostflow.local";
    static final String MAIN_SLUG = "cabanas-del-rio-demo";
    static final String CLOSED_SLUG = "posada-isla-verde-demo";

    private static final String IMG = "https://res.cloudinary.com/demo/image/upload/";
    private static final BookingStatus[] STATUSES = BookingStatus.values();

    private final OwnerRepository ownerRepository;
    private final ComplexRepository complexRepository;
    private final AddonRepository addonRepository;
    private final BookingRepository bookingRepository;
    private final BookingAddonRepository bookingAddonRepository;
    private final BoatRequestRepository boatRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final String ownerPassword;

    public DemoDataSeeder(OwnerRepository ownerRepository,
                          ComplexRepository complexRepository,
                          AddonRepository addonRepository,
                          BookingRepository bookingRepository,
                          BookingAddonRepository bookingAddonRepository,
                          BoatRequestRepository boatRequestRepository,
                          PasswordEncoder passwordEncoder,
                          ObjectMapper objectMapper,
                          @Value("${app.seed.owner-password:Demo1234!}") String ownerPassword) {
        this.ownerRepository = ownerRepository;
        this.complexRepository = complexRepository;
        this.addonRepository = addonRepository;
        this.bookingRepository = bookingRepository;
        this.bookingAddonRepository = bookingAddonRepository;
        this.boatRequestRepository = boatRequestRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
        this.ownerPassword = ownerPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (ownerRepository.existsByEmail(OWNER_EMAIL)
                || complexRepository.existsBySlug(MAIN_SLUG)
                || complexRepository.existsBySlug(CLOSED_SLUG)) {
            log.info("Los datos de demo ya estan cargados: no se hace nada");
            return;
        }

        Owner owner = new Owner();
        owner.setName("Ana Pérez");
        owner.setEmail(OWNER_EMAIL);
        owner.setPasswordHash(passwordEncoder.encode(ownerPassword));
        owner.setPhone("+5491123456789");
        owner.setCountry("Argentina");
        owner = ownerRepository.save(owner);

        Complex main = createComplex(owner, "Cabañas del Río", MAIN_SLUG,
                "Arroyo Gambado 123, Delta del Tigre", "sample.jpg", "#1A73E8", true);
        createComplex(owner, "Posada Isla Verde", CLOSED_SLUG,
                "Canal Honda 456, Delta del Tigre", "cld-sample.jpg", "#2E7D32", false);

        Addon breakfast = createAddon(main, "Desayuno en el muelle",
                "Desayuno para dos personas con productos de la isla", "15000.00", "cld-sample-2.jpg", true);
        Addon kayak = createAddon(main, "Paseo en kayak",
                "Salida guiada de dos horas por los arroyos del Delta", "12000.00", "cld-sample-3.jpg", true);
        Addon dinner = createAddon(main, "Cena regional",
                "Cena con productos de la zona, precio por persona", "28000.00", "cld-sample-4.jpg", true);
        Addon bikes = createAddon(main, "Alquiler de bicicletas",
                "Bicicletas por día con casco incluido", "8000.00", "cld-sample-5.jpg", true);
        createAddon(main, "Fogón nocturno",
                "Fogón con leña y malvaviscos (temporalmente no disponible)", "6000.00", null, false);

        Booking first = createBooking(main, 0, "Ana Pérez", "ana@mail.com", "+5491123456789",
                2, 10, 2, "Cama matrimonial", Set.of());
        addLine(first, breakfast, 2);
        addLine(first, kayak, 1);
        addBoat(first, main, 2, "Muelle principal", "Llevamos equipaje", BoatRequestStatus.SENT);

        Booking second = createBooking(main, 1, "Martín Gómez", "martin@mail.com", "+5491155550001",
                4, 15, 3, "Habitación en planta baja", Set.of(Allergy.GLUTEN));
        addLine(second, bikes, 4);

        createBooking(main, 2, "Lucía Fernández", "lucia@mail.com", "+5491155550002",
                1, 20, 1, "Llegamos después de las 22", Set.of(Allergy.MARISCOS));

        Booking fourth = createBooking(main, 3, "Carlos Ruiz", "carlos@mail.com", "+5491155550003",
                6, 30, 5, "Celebramos un cumpleaños", Set.of());
        addLine(fourth, dinner, 6);
        addBoat(fourth, main, 5, "Embarcadero del Tigre", null, BoatRequestStatus.PENDING);

        log.info("Datos de demo cargados: dueño {} con 2 complejos ({} y {})", OWNER_EMAIL, MAIN_SLUG, CLOSED_SLUG);
    }

    private Complex createComplex(Owner owner, String name, String slug, String address,
                                  String logoFile, String color, boolean open) {
        Complex complex = new Complex();
        complex.setOwner(owner);
        complex.setName(name);
        complex.setSlug(slug);
        complex.setAddress(address);
        complex.setLogoUrl(IMG + logoFile);
        complex.setBrandColors(color);
        complex.setAccountHolder("Ana Pérez");
        complex.setAliasCbu("hostflow.delta");
        complex.setBank("Banco Nación");
        complex.setOpen(open);
        return complexRepository.save(complex);
    }

    private Addon createAddon(Complex complex, String name, String description, String price,
                              String imageFile, boolean active) {
        Addon addon = new Addon();
        addon.setComplex(complex);
        addon.setName(name);
        addon.setDescription(description);
        addon.setPrice(new BigDecimal(price));
        addon.setImageUrl(imageFile == null ? null : IMG + imageFile);
        addon.setActive(active);
        return addonRepository.save(addon);
    }

    private Booking createBooking(Complex complex, int number, String name, String email, String phone,
                                  int guests, int startInDays, int nights, String preferences,
                                  Set<Allergy> allergies) {
        LocalDate checkIn = LocalDate.now().plusDays(startInDays);
        Booking booking = new Booking();
        booking.setComplex(complex);
        booking.setCheckIn(checkIn);
        booking.setCheckOut(checkIn.plusDays(nights));
        booking.setGuestsCount(guests);
        booking.setStatus(STATUSES[number % STATUSES.length]);
        booking.setGuestName(name);
        booking.setGuestEmail(email);
        booking.setGuestPhone(phone);
        booking.setPreferences(preferences);
        booking.setAllergies(new HashSet<>(allergies));
        return bookingRepository.save(booking);
    }

    private void addLine(Booking booking, Addon addon, int quantity) {
        BookingAddon line = new BookingAddon();
        line.setBooking(booking);
        line.setAddon(addon);
        line.setQuantity(quantity);
        line.setUnitPrice(addon.getPrice());
        bookingAddonRepository.save(line);
    }

    private void addBoat(Booking booking, Complex complex, int passengers, String pickupPoint,
                         String comments, BoatRequestStatus status) {
        LocalDateTime departureAt = booking.getCheckIn().atTime(9, 0);
        LocalDateTime returnAt = booking.getCheckOut().atTime(17, 0);

        BoatRequest request = new BoatRequest();
        request.setBooking(booking);
        request.setDepartureAt(departureAt);
        request.setReturnAt(returnAt);
        request.setPickupPoint(pickupPoint);
        request.setPassengers(passengers);
        request.setComments(comments);
        request.setStatus(status);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("bookingId", booking.getId().toString());
        payload.put("complex", complex.getName());
        payload.put("guestName", booking.getGuestName());
        payload.put("guestPhone", booking.getGuestPhone());
        payload.put("guestsCount", booking.getGuestsCount());
        payload.put("departureAt", departureAt.toString());
        payload.put("returnAt", returnAt.toString());
        payload.put("pickupPoint", pickupPoint);
        payload.put("passengers", passengers);
        payload.put("comments", comments);
        request.setPayloadJson(objectMapper.writeValueAsString(payload));

        boatRequestRepository.save(request);
    }
}