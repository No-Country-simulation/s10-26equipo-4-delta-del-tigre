package nocountry.grupo4.delta_tigre;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DeltaTigreApplication {

	public static void main(String[] args) {
		SpringApplication.run(DeltaTigreApplication.class, args);
	}

}
