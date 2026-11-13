import os

# URL base de HostFlow. Las rutas (/register, /login, ...) las agrega cada page.
hostflow_url = os.getenv("HOSTFLOW_URL", "http://localhost:3000")
# Para el Registro
hostflow_username_registro = "Pablo Rincon"
hostflow_email_login = "pablor@gmail.com"
# Debe cumplir las reglas de contraseña de la app (>= 8 caracteres, etc.)
hostflow_password_registro = "Pass1234!"
hostflow_password_confirm = "Pass1234!"

# Para el Login (usuario de prueba; se puede sobreescribir con variables de entorno)
hostflow_email_admin = os.getenv("HOSTFLOW_EMAIL_ADMIN", "demo@hostflow.com")
hostflow_password_admin = os.getenv("HOSTFLOW_PASSWORD_ADMIN", "hostflow123")