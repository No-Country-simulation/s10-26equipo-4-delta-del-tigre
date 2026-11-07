package nocountry.grupo4.delta_tigre.booking;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record BoatRequestResponse(UUID id, LocalDate desiredDate, LocalTime departureTime,
                                  LocalTime returnTime, int passengers, String comments,
                                  BoatRequestStatus status) {

    public static BoatRequestResponse from(BoatRequest r) {
        return new BoatRequestResponse(r.getId(), r.getDesiredDate(), r.getDepartureTime(),
                r.getReturnTime(), r.getPassengers(), r.getComments(), r.getStatus());
    }
}
