from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import TimeoutException

from pages.base_page import BasePage


class DatosPagoPage(BasePage):
    # Selectores exactos extraídos de tu HTML
    DROPDOWN_COMPLEJO = (By.ID, "complejo")
    BANCO_INPUT = (By.ID, "banco")
    ALIAS_CBU_INPUT = (By.ID, "aliasCbu")
    TITULAR_INPUT = (By.ID, "titular")
    BTN_GUARDAR = (By.XPATH, "//button[@type='submit' and @form='datos-pago-form']")

    # Nota informativa de negocio al pie del formulario
    NOTA_INFORMATIVA = (
        By.XPATH,
        "//*[contains(normalize-space(.), 'no procesa pagos ni solicita datos de tarjetas')]"
    )

    # Mapeo de los inputs para verificar aria-invalid o mensajes de error asociados
    CAMPOS_INPUT = {
        "banco": BANCO_INPUT,
        "aliasCbu": ALIAS_CBU_INPUT,
        "titular": TITULAR_INPUT,
    }

    ERRORES = {
        "banco": (By.XPATH, "//*[@id='banco-error'] | //input[@id='banco']/following-sibling::*[1]"),
        "aliasCbu": (By.XPATH, "//*[@id='aliasCbu-error'] | //input[@id='aliasCbu']/following-sibling::*[1]"),
        "titular": (By.XPATH, "//*[@id='titular-error'] | //input[@id='titular']/following-sibling::*[1]"),
    }

    def seleccionar_complejo(self, nombre_complejo):
        elemento = self.wait.until(EC.element_to_be_clickable(self.DROPDOWN_COMPLEJO))
        dropdown = Select(elemento)
        dropdown.select_by_visible_text(nombre_complejo)

    def llenar_formulario(self, banco, alias_cbu, titular):
        self.type_text(self.BANCO_INPUT, banco)
        self.type_text(self.ALIAS_CBU_INPUT, alias_cbu)
        self.type_text(self.TITULAR_INPUT, titular)

    def guardar_cambios(self):
        self.click(self.BTN_GUARDAR)

    def configurar_datos_pago(self, banco, alias_cbu, titular):
        self.llenar_formulario(banco, alias_cbu, titular)
        self.guardar_cambios()

    def obtener_mensaje_error_por_campo(self, campo):
        return self.find_visible(self.ERRORES[campo]).text

    def campo_tiene_error(self, campo):
        """Verifica si aparece texto de error debajo del campo o si el input se marcó con aria-invalid='true'."""
        try:
            texto = self.obtener_mensaje_error_por_campo(campo)
            if texto.strip():
                return texto
        except TimeoutException:
            pass

        # Respaldo: verifica si el input tiene aria-invalid="true" en el HTML
        input_el = self.find(self.CAMPOS_INPUT[campo])
        if input_el.get_attribute("aria-invalid") == "true":
            return "[Campo marcado como inválido (aria-invalid=true)]"

        raise TimeoutException(f"Sin error en {campo}")

    def ninguno_tiene_error(self):
        """Comprueba instantáneamente (sin esperar 10s por campo) que no haya errores visibles."""
        for campo, locator_error in self.ERRORES.items():
            elementos = self.driver.find_elements(*locator_error)
            for el in elementos:
                if el.is_displayed() and el.text.strip():
                    return False
            input_el = self.find(self.CAMPOS_INPUT[campo])
            if input_el.get_attribute("aria-invalid") == "true":
                return False
        return True

    def nota_informativa_es_visible(self):
        try:
            return self.find_visible(self.NOTA_INFORMATIVA).is_displayed()
        except TimeoutException:
            return False