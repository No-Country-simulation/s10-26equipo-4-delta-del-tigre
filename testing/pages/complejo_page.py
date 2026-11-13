from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException

from pages.base_page import BasePage


class ComplejoPage(BasePage):
    # En /complejos, "Añadir complejo" es <a role="button" href="/complejos/nuevo">
    BTN_ANADIR_COMPLEJO = (By.XPATH, "//a[@href='/complejos/nuevo']")


    NOMBRE_INPUT = (By.ID, "nombre")
    DIRECCION_INPUT = (By.ID, "direccion")
    SLUG_INPUT = (By.ID, "slug")
    CAPACIDAD_MIN_INPUT = (By.ID, "minPersonas")
    CAPACIDAD_MAX_INPUT = (By.ID, "maxPersonas")
    MAX_RESERVAS_INPUT = (By.ID, "maxReservas")
    BTN_GUARDAR = (By.XPATH, "//button[contains(normalize-space(.), 'Crear adicional')]")

    # Las claves coinciden con la columna "campo" del .feature
    ERRORES = {
        "nombre": (By.ID, "nombre-error"),
        "direccion": (By.ID, "direccion-error"),
        "slug": (By.ID, "slug-error"),
        "capacidad_min": (By.ID, "minPersonas-error"),
        "capacidad_max": (By.ID, "maxPersonas-error"),
        "reservas_max": (By.ID, "maxReservas-error"),
    }

    def hacer_clic_anadir_complejo(self):
        self.click(self.BTN_ANADIR_COMPLEJO)

    def llenar_formulario(self, nombre, direccion, slug, cap_min, cap_max, max_res):
        self.type_text(self.NOMBRE_INPUT, nombre)
        self.type_text(self.DIRECCION_INPUT, direccion)
        self.type_text(self.SLUG_INPUT, slug)
        self.type_text(self.CAPACIDAD_MIN_INPUT, cap_min)
        self.type_text(self.CAPACIDAD_MAX_INPUT, cap_max)
        self.type_text(self.MAX_RESERVAS_INPUT, max_res)

    def guardar_cambios(self):
        self.click(self.BTN_GUARDAR)

    def crear_complejo(self, nombre, direccion, slug, cap_min, cap_max, max_res):
        self.llenar_formulario(nombre, direccion, slug, cap_min, cap_max, max_res)
        self.guardar_cambios()

    def obtener_mensaje_error_por_campo(self, campo):
        return self.find_visible(self.ERRORES[campo]).text

    def aparece_en_listado(self, nombre):
        try:
            self.find_visible((By.XPATH, f"//*[contains(normalize-space(text()), '{nombre}')]"))
            return True
        except TimeoutException:
            return False