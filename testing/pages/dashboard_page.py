from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException

from pages.base_page import BasePage


class DashboardPage(BasePage):
    """Menú lateral del panel. Sirve para cualquier sección (Inicio, Complejos, Reservas, ...)."""

    @staticmethod
    def _item_menu(seccion):
        # Estructura real del HTML: <a data-slot="sidebar-menu-button" href="..."><svg/><span>Texto</span></a>
        return (By.XPATH,
                f"//a[@data-slot='sidebar-menu-button'][normalize-space(.)='{seccion}']")

    @staticmethod
    def _item_menu_activo(seccion):
        # El ítem de la página actual lleva el atributo data-active (los demás no, o lo traen en "false")
        return (By.XPATH,
                f"//a[@data-slot='sidebar-menu-button'][normalize-space(.)='{seccion}']"
                "[@data-active and not(@data-active='false')]")

    def ir_a_seccion(self, seccion):
        self.click(self._item_menu(seccion))

    def seccion_esta_activa(self, seccion):
        try:
            self.find(self._item_menu_activo(seccion))
            return True
        except TimeoutException:
            return False