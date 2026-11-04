package nocountry.grupo4.delta_tigre.complex;

import java.text.Normalizer;
import java.util.Locale;

public final class SlugUtils {

    // La columna slug admite 160; se deja lugar para el sufijo numérico
    private static final int MAX_BASE_LENGTH = 150;

    private SlugUtils() {}

    public static String slugify(String input) {
        String s = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
        if (s.length() > MAX_BASE_LENGTH) {
            s = s.substring(0, MAX_BASE_LENGTH).replaceAll("-+$", "");
        }
        return s.isEmpty() ? "complejo" : s;
    }
}