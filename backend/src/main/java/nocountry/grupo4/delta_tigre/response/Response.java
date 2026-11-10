package nocountry.grupo4.delta_tigre.response;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class Response {

	public static ResponseEntity<Object> response(HttpStatus status, String message, Object responseObj) {
		Map<String, Object> map = new HashMap<>();
		
		map.put("status", status.value());
		map.put("message", message);
		map.put("data", responseObj);

		return new ResponseEntity<Object>(map, status);
	}

	public static ResponseEntity<Object> ok(Object responseObj) {
		return response(HttpStatus.OK, "OK", responseObj);
	}

	public static ResponseEntity<Object> ok(Object responseObj, String msj) {
		return response(HttpStatus.OK, msj, responseObj);
	}

    public static ResponseEntity<Object> notFound() {
        return response(HttpStatus.NOT_FOUND, "Not found", null);
    }

	public static ResponseEntity<Object> notFound(String msj) {
        return response(HttpStatus.NOT_FOUND, msj, null);
    }

	public static ResponseEntity<Object> notAcceptable(Object responseObj, String msj) {
        return response(HttpStatus.NOT_ACCEPTABLE, msj, responseObj);
    }

	public static ResponseEntity<Object> error(HttpStatus status, String msj) {
        return response(status, msj, null);
    }

	public static ResponseEntity<Object> dbError(String msj) {
		return response(HttpStatus.CONFLICT, msj, null);
	}

	public static ResponseEntity<Object> unauthorized(String msj) {
		return response(HttpStatus.UNAUTHORIZED, msj, null);
	}

	public static ResponseEntity<Object> tooManyRequests(String msj) {
		return response(HttpStatus.TOO_MANY_REQUESTS, msj, null);
	}
}