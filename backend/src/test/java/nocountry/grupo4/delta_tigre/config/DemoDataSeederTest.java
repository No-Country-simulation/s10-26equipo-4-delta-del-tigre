package nocountry.grupo4.delta_tigre.config;

import nocountry.grupo4.delta_tigre.addon.AddonRepository;
import nocountry.grupo4.delta_tigre.booking.BookingRepository;
import nocountry.grupo4.delta_tigre.complex.Complex;
import nocountry.grupo4.delta_tigre.complex.ComplexRepository;
import nocountry.grupo4.delta_tigre.owner.OwnerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(properties = "app.seed.enabled=true")
class DemoDataSeederTest {

    @Autowired OwnerRepository ownerRepository;
    @Autowired ComplexRepository complexRepository;
    @Autowired AddonRepository addonRepository;
    @Autowired BookingRepository bookingRepository;
    @Autowired DemoDataSeeder seeder;

    @Test
    void seeds_demo_data_and_is_idempotent() {
        assertTrue(ownerRepository.findByEmail(DemoDataSeeder.OWNER_EMAIL).isPresent());

        Complex open = complexRepository.findBySlug(DemoDataSeeder.MAIN_SLUG).orElseThrow();
        Complex closed = complexRepository.findBySlug(DemoDataSeeder.CLOSED_SLUG).orElseThrow();
        assertTrue(open.isOpen());
        assertFalse(closed.isOpen());
        assertEquals(5, addonRepository.findByComplexIdOrderByNameAsc(open.getId()).size());

        long bookings = bookingRepository.count();
        assertTrue(bookings >= 4);

        seeder.run(null);

        assertEquals(bookings, bookingRepository.count());
        assertEquals(5, addonRepository.findByComplexIdOrderByNameAsc(open.getId()).size());
    }
}