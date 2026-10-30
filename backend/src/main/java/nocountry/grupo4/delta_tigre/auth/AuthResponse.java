package nocountry.grupo4.delta_tigre.auth;

public record AuthResponse(String accessToken, String tokenType, long expiresIn) {
}
