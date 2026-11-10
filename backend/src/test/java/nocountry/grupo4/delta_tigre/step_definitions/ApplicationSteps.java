package nocountry.grupo4.delta_tigre.step_definitions;

import io.cucumber.java.en.Then;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.assertNotNull;

public class ApplicationSteps {

    @Autowired
    private ApplicationContext applicationContext;

    @Then("el contexto de Spring está disponible")
    public void springContextIsAvailable() {
        assertNotNull(applicationContext);
    }
}
