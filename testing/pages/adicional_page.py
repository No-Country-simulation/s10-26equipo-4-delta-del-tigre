from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import TimeoutException

from pages.base_page import BasePage


class AdicionalPage(BasePage):
    # Listado: <select id="complejo"> (texto visible = nombre del complejo, value = id del complejo)
    DROPDOWN_COMPLEJO = (By.ID, "complejo")

    # Formulario (VERIFICAR los IDs exactos con F12; se asume la misma convención que el formulario de complejo)
    NOMBRE_INPUT = (By.ID, "nombre")
    DESCRIPCION_INPUT = (By.ID, "descripcion")
    PRECIO_INPUT = (By.ID, "precio")
    BTN_CREAR = (By.XPATH, "//button[contains(normalize-space(.), 'Crear adicional')]")

    # Las claves coinciden con la columna "campo" del .feature
    ERRORES = {
        "nombre": (By.ID, "nombre-error"),
        "descripcion": (By.ID, "descripcion-error"),
        "precio": (By.ID, "precio-error"),
    }

    # id (value del <option>) del complejo elegido en el dropdown
    complejo_id = None

    def seleccionar_complejo(self, nombre_complejo):
        # <select> nativo: se usa Select, no se hace clic en las <option>
        elemento = self.wait.until(EC.element_to_be_clickable(self.DROPDOWN_COMPLEJO))
        dropdown = Select(elemento)
        dropdown.select_by_visible_text(nombre_complejo)
        self.complejo_id = dropdown.first_selected_option.get_attribute("value")

    def hacer_clic_nuevo_adicional(self):
        # El href cambia según el complejo (/adicionales/nuevo?complejo=<id>), por eso no se fija un id.
        # Al esperar el href del complejo elegido, no se hace clic antes de que la lista se actualice.
        ruta = "/adicionales/nuevo"
        if self.complejo_id:
            ruta += f"?complejo={self.complejo_id}"
        self.click((By.XPATH, f"//a[contains(@href, '{ruta}')]"))

    def llenar_formulario(self, nombre, descripcion, precio):
        self.type_text(self.NOMBRE_INPUT, nombre)
        self.type_text(self.DESCRIPCION_INPUT, descripcion)
        self.type_text(self.PRECIO_INPUT, precio)

    def guardar_adicional(self):
        self.click(self.BTN_CREAR)

    def crear_adicional(self, nombre, descripcion, precio):
        self.llenar_formulario(nombre, descripcion, precio)
        self.guardar_adicional()

    def obtener_mensaje_error_por_campo(self, campo):
        return self.find_visible(self.ERRORES[campo]).text

    def aparece_en_listado(self, nombre_adicional):
        try:
            # La URL del formulario ya contiene "adicionales": hay que esperar a que salga de /nuevo
            self.wait.until(lambda d: "/adicionales/nuevo" not in d.current_url)
            self.find_visible(
                (By.XPATH, f"//*[contains(normalize-space(text()), '{nombre_adicional}')]")
            )
            return True
        except TimeoutException:
            return False