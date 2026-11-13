import random
import string

def generar_string_aleatorio(longitud=6):
    """Genera una cadena de texto aleatoria de letras en minúscula."""
    letras = string.ascii_lowercase
    return ''.join(random.choice(letras) for i in range(longitud))

def generar_correo_unico():
    """Genera un correo dinámico para evitar errores de 'usuario ya registrado'."""
    cadena_aleatoria = generar_string_aleatorio()
    return f"prueba_dueno_{cadena_aleatoria}@hostflow.com"