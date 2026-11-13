from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException

from pages.base_page import BasePage


class RegistroPage(BasePage):
    # Localizadores: VERIFICAR con DevTools (F12) contra el frontend real
    NOMBRE_INPUT = (By.ID, "name")
    CORREO_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    CONFIRM_PASSWORD_INPUT = (By.ID, "confirm-password")
    BTN_REGISTRO = (By.XPATH, "//button[@type=\"submit\"]")

    # Las claves coinciden con la columna campo del .feature
    ERRORES = {
        "nombre": (By.ID, "name-error"),
        "correo": (By.ID, "email-error"),
        "password": (By.ID, "password-error"),
        "confirmacion": (By.ID, "confirm-password-error"),
    }

    def ir_a_registro(self, base_url):
        self.open(f"{base_url}/register")

    def ingresar_credenciales(self, nombre, correo, password, confirm_password):
        self.type_text(self.NOMBRE_INPUT, nombre)
        self.type_text(self.CORREO_INPUT, correo)
        self.type_text(self.PASSWORD_INPUT, password)
        self.type_text(self.CONFIRM_PASSWORD_INPUT, confirm_password)

    def hacer_clic_registrar(self):
        self.click(self.BTN_REGISTRO)

    def registrar(self, nombre, correo, password, confirm_password):
        self.ingresar_credenciales(nombre, correo, password, confirm_password)
        self.hacer_clic_registrar()

    def obtener_mensaje_error_por_campo(self, campo):
        locator = self.ERRORES[campo]  # KeyError claro si el campo no existe
        return self.find_visible(locator).text

    def esta_en_registro(self):
        return "/register" in self.driver.current_url

    def llego_al_dashboard(self):
        try:
            self.wait_url_contains("dashboard")
            return True
        except TimeoutException:
            return False