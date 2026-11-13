import os
import sys
from datetime import datetime

from selenium import webdriver

# Garantiza que data, pages y helpers (carpeta testing/) sean importables
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if RAIZ not in sys.path:
    sys.path.insert(0, RAIZ)

from data.data import hostflow_url  # noqa: E402


def before_scenario(context, scenario):
    if "pendiente" in scenario.tags:
        scenario.skip("Funcionalidad aún no implementada en el frontend")
        return
    context.driver = webdriver.Chrome()
    context.driver.maximize_window()
    context.base_url = hostflow_url


def after_step(context, step):
    """Captura de pantalla en la carpeta evidencias cuando un paso falla."""
    if step.status == "failed" and hasattr(context, "driver"):
        carpeta = os.path.join(RAIZ, "evidencias")
        os.makedirs(carpeta, exist_ok=True)
        marca = datetime.now().strftime("%Y%m%d_%H%M%S")
        context.driver.save_screenshot(os.path.join(carpeta, f"fallo_{marca}.png"))


def after_scenario(context, scenario):
    if hasattr(context, "driver"):
        context.driver.quit()