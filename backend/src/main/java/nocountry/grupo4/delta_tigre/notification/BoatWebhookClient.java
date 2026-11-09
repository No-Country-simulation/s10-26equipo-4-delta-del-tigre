package nocountry.grupo4.delta_tigre.notification;

import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;

@Component
public class BoatWebhookClient {

    private final RestClient restClient;

    public BoatWebhookClient() {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    /** Hace POST del JSON. Lanza excepción si el destino no responde 2xx o no se puede conectar. */
    public void post(String url, String json) {
        restClient.post()
                .uri(URI.create(url))
                .contentType(MediaType.APPLICATION_JSON)
                .body(json)
                .retrieve()
                .toBodilessEntity();
    }
}