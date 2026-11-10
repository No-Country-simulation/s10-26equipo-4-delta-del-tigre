package nocountry.grupo4.delta_tigre.booking;

import java.time.LocalDateTime;
import java.util.UUID;

public record BoatRequestResponse(UUID id, LocalDateTime departureAt, LocalDateTime returnAt,
                                  String pickupPoint, int passengers, String comments,
                                  BoatRequestStatus status) {

    public static BoatRequestResponse from(BoatRequest r) {
        return new BoatRequestResponse(r.getId(), r.getDepartureAt(), r.getReturnAt(),
                r.getPickupPoint(), r.getPassengers(), r.getComments(), r.getStatus());
    }
}