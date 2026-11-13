import re
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import TimeoutException

from pages.base_page import BasePage


class OnboardingPage(BasePage):
    # --- Cabecera White-Label y Navegación del Wizard ---
    LINK_AYUDA = (By.XPATH, "//*[contains(normalize-space(.), '¿Necesitás ayuda?')]")
    BTN_CONTINUAR = (By.XPATH, "//button[@type='submit' and contains(normalize-space(.), 'Continuar')]")
    BTN_FINALIZAR = (By.XPATH, "//button[@type='submit' and contains(normalize-space(.), 'Finalizar onboarding')]")

    # --- Paso 1: Tus datos ---
    NOMBRE_INPUT = (By.ID, "nombre")
    DOCUMENTO_INPUT = (By.ID, "documento")
    TELEFONO_INPUT = (By.ID, "telefono")
    EMAIL_INPUT = (By.ID, "email")
    HUESPEDES_INPUT = (By.ID, "huespedes")
    LLEGADA_INPUT = (By.ID, "llegada")
    SALIDA_INPUT = (By.ID, "salida")

    # --- Paso 2: Preferencias y alergias ---
    OTRA_ALERGIA_INPUT = (By.ID, "otraAlergia")
    PREFERENCIAS_INPUT = (By.ID, "preferencias")
    CONTADOR_PREFERENCIAS = (By.XPATH, "//*[contains(text(), '/1000')]")

    # --- Paso 4: Lancha remis ---
    CHECK_LANCHA = (By.XPATH, "//button[@role='checkbox' and @aria-label='Cotizar lancha remis']")
    SALIDA_LANCHA_INPUT = (By.ID, "salidaLancha")
    REGRESO_LANCHA_INPUT = (By.ID, "regresoLancha")
    PUNTO_SALIDA_SELECT = (By.ID, "puntoSalida")
    PASAJEROS_LANCHA_INPUT = (By.ID, "pasajerosLancha")

    # --- Pantalla Final de Confirmación (Ajustado a la captura real) ---
    CHECKIN_COMPLETADO = (
        By.XPATH,
        "//*[contains(translate(., 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'CHECK-IN COMPLETADO') or contains(., '¡Todo listo')]"
    )
    AVISO_LANCHA_RECIBIDA = (
        By.XPATH,
        "//*[contains(normalize-space(.), 'Solicitud de lancha recibida')]"
    )
    BTN_COPIAR_ALIAS = (By.XPATH, "//button[contains(normalize-space(.), 'Copiar alias')]")

    # --- Diccionario de campos para validaciones por tabla Gherkin ---
    CAMPOS = {
        "nombre": NOMBRE_INPUT,
        "documento": DOCUMENTO_INPUT,
        "telefono": TELEFONO_INPUT,
        "email": EMAIL_INPUT,
        "huespedes": HUESPEDES_INPUT,
        "llegada": LLEGADA_INPUT,
        "salida": SALIDA_INPUT,
        "otraAlergia": OTRA_ALERGIA_INPUT,
        "preferencias": PREFERENCIAS_INPUT,
        "salidaLancha": SALIDA_LANCHA_INPUT,
        "regresoLancha": REGRESO_LANCHA_INPUT,
        "puntoSalida": PUNTO_SALIDA_SELECT,
        "pasajerosLancha": PASAJEROS_LANCHA_INPUT,
    }

    def abrir_onboarding(self, base_url, slug):
        self.open(f"{base_url}/onboarding/{slug}")

    def esperar_paso(self, numero_paso):
        locator = (By.XPATH, f"//*[contains(normalize-space(.), 'Paso {numero_paso} de 4')]")
        self.find_visible(locator)

    def esta_en_paso(self, numero_paso):
        locator = (By.XPATH, f"//*[contains(normalize-space(.), 'Paso {numero_paso} de 4')]")
        try:
            return self.find_visible(locator).is_displayed()
        except TimeoutException:
            return False

    def verificar_cabecera_whitelabel(self, nombre_complejo):
        nombre_visible = self.find_visible(
            (By.XPATH, f"//*[contains(normalize-space(.), '{nombre_complejo}')]")
        ).is_displayed()
        ayuda_visible = self.find_visible(self.LINK_AYUDA).is_displayed()
        return nombre_visible and ayuda_visible

    def _set_date_or_datetime(self, locator, valor):
        """Inyecta fechas YYYY-MM-DD o YYYY-MM-DDTHH:MM en inputs controlados por React."""
        elemento = self.find(locator)
        self.driver.execute_script(
            """
            const el = arguments[0];
            const val = arguments[1];
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            """,
            elemento,
            valor,
        )

    # --- Acciones Paso 1 ---
    def completar_paso_1(self, nombre, documento, telefono, email, huespedes, llegada, salida):
        self.esperar_paso(1)
        self.type_text(self.NOMBRE_INPUT, nombre)
        self.type_text(self.DOCUMENTO_INPUT, documento)
        self.type_text(self.TELEFONO_INPUT, telefono)
        self.type_text(self.EMAIL_INPUT, email)
        self.type_text(self.HUESPEDES_INPUT, huespedes)
        self._set_date_or_datetime(self.LLEGADA_INPUT, llegada)
        self._set_date_or_datetime(self.SALIDA_INPUT, salida)

    def hacer_clic_continuar(self):
        self.click(self.BTN_CONTINUAR)

    # --- Acciones Paso 2 ---
    def seleccionar_alergia_chip(self, alergia):
        if alergia.strip():
            chip = (By.XPATH, f"//button[@type='button' and contains(normalize-space(.), '{alergia}')]")
            self.click(chip)

    def completar_paso_2(self, alergia_chip, otra_alergia, preferencias):
        self.esperar_paso(2)
        if alergia_chip:
            self.seleccionar_alergia_chip(alergia_chip)
        if otra_alergia is not None:
            self.type_text(self.OTRA_ALERGIA_INPUT, otra_alergia)
        if preferencias is not None:
            self.type_text(self.PREFERENCIAS_INPUT, preferencias)

    # --- Acciones Paso 3 ---
    def agregar_adicional(self, nombre_adicional, cantidad=1):
        self.esperar_paso(3)
        if not nombre_adicional or int(cantidad) <= 0:
            return
        btn_mas = (
            By.XPATH,
            f"//*[contains(normalize-space(text()), '{nombre_adicional}')]/ancestor::div[contains(@class, 'rounded')][1]//button[.//*[contains(@class, 'lucide-plus')] or normalize-space(.)='+']"
        )
        for _ in range(int(cantidad)):
            self.click(btn_mas)

    # --- Acciones Paso 4 ---
    def marcar_cotizar_lancha(self):
        self.esperar_paso(4)
        checkbox = self.find_visible(self.CHECK_LANCHA)
        if checkbox.get_attribute("aria-checked") == "false":
            self.click(self.CHECK_LANCHA)

    def completar_datos_lancha(self, salida_lancha, regreso_lancha, punto_salida, pasajeros):
        self._set_date_or_datetime(self.SALIDA_LANCHA_INPUT, salida_lancha)
        self._set_date_or_datetime(self.REGRESO_LANCHA_INPUT, regreso_lancha)

        elemento_select = self.wait.until(EC.element_to_be_clickable(self.PUNTO_SALIDA_SELECT))
        dropdown = Select(elemento_select)
        if punto_salida:
            dropdown.select_by_visible_text(punto_salida)
        else:
            dropdown.select_by_value("")

        self.type_text(self.PASAJEROS_LANCHA_INPUT, pasajeros)

    def hacer_clic_finalizar(self):
        self.click(self.BTN_FINALIZAR)

    # --- Validaciones de Errores por Campo ---
    def obtener_mensaje_error_por_campo(self, campo):
        locator_error = (
            By.XPATH,
            f"//*[@id='{campo}-error'] | "
            f"//*[@id='{campo}']/following-sibling::*[1] | "
            f"//*[@id='{campo}']/parent::*/following-sibling::*[1]"
        )
        try:
            texto = self.find_visible(locator_error).text.strip()
            if texto:
                return texto
        except TimeoutException:
            pass

        el = self.find(self.CAMPOS[campo])
        if el.get_attribute("aria-invalid") == "true":
            return f"[Campo {campo} en rojo con aria-invalid=true]"

        raise TimeoutException(f"No se detectó error en el campo '{campo}'")

    # --- Aserciones Pantalla Final Mock ---
    def confirmar_checkin_completo(self, nombre_turista):
        self.find_visible(self.CHECKIN_COMPLETADO)
        body_text = self.driver.find_element(By.TAG_NAME, "body").text
        # La UI saluda solo con el primer nombre (ej. "¡Todo listo, Marina!" para "Marina López")
        primer_nombre = nombre_turista.split()[0]
        return f"¡Todo listo, {primer_nombre}!" in body_text or primer_nombre in body_text

    def tiene_codigo_reserva_mock(self):
        body_text = self.driver.find_element(By.TAG_NAME, "body").text
        return bool(re.search(r"DS-\d{4}", body_text))

    def muestra_aviso_lancha_recibida(self):
        elementos = self.driver.find_elements(*self.AVISO_LANCHA_RECIBIDA)
        return any(el.is_displayed() for el in elementos)

    def muestra_resumen_adicional_y_copiar_alias(self, nombre_adicional, total_esperado):
        body_text = self.driver.find_element(By.TAG_NAME, "body").text
        adicional_ok = nombre_adicional in body_text
        total_ok = f"${total_esperado}" in body_text or total_esperado in body_text
        datos_pago_ok = "Asegurá tus adicionales" in body_text
        boton_copiar_ok = self.find_visible(self.BTN_COPIAR_ALIAS).is_enabled()
        return adicional_ok and total_ok and datos_pago_ok and boton_copiar_ok

    def muestra_vista_404(self):
        body_text = self.driver.find_element(By.TAG_NAME, "body").text.lower()
        return "404" in body_text or "no encontrado" in body_text or "no existe" in body_text