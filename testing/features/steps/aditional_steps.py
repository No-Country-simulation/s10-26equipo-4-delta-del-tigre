# noinspection PyUnresolvedReferences
from behave import given, when, then, use_step_matcher
from selenium.common.exceptions import TimeoutException

from pages.adicional_page import AdicionalPage


# "un dueño autenticado..." y 'accede a la sección "..."' viven en dashboard_steps.py
@given('selecciona el complejo "{nombre_complejo}"')
def step_impl(context, nombre_complejo):
    context.adicional_page = AdicionalPage(context.driver)
    context.adicional_page.seleccionar_complejo(nombre_complejo)


@given("accede al formulario de nuevo adicional")
def step_impl(context):
    context.adicional_page.hacer_clic_nuevo_adicional()


# Matcher "re": ([^"]*) sí acepta cadenas vacías ("").
# Un solo paso cubre "crea" (caso exitoso) e "intenta crear" (validaciones).
use_step_matcher("re")


@when(r'(?:crea|intenta crear) un adicional con nombre "([^"]*)", '
      r'descripción "([^"]*)" y precio "([^"]*)"')
def step_impl(context, nombre, descripcion, precio):
    context.adicional_page.crear_adicional(nombre, descripcion, precio)


use_step_matcher("parse")


@then('el sistema registra el adicional y "{nombre_adicional}" aparece en el listado')
def step_impl(context, nombre_adicional):
    assert context.adicional_page.aparece_en_listado(nombre_adicional), (
        f"El adicional '{nombre_adicional}' no se encontró en el listado tras guardar. "
        f"URL actual: {context.driver.current_url}"
    )


@then('el formulario de adicional no avanza y muestra un mensaje de error en el campo "{campo}"')
def step_impl(context, campo):
    assert "/adicionales/nuevo" in context.driver.current_url, (
        f"El formulario avanzó cuando debía fallar en '{campo}'. URL actual: {context.driver.current_url}"
    )
    try:
        mensaje_actual = context.adicional_page.obtener_mensaje_error_por_campo(campo)
    except TimeoutException:
        raise AssertionError(
            f"No apareció ningún mensaje de error en el campo '{campo}'. URL actual: {context.driver.current_url}"
        )
    assert mensaje_actual.strip() != "", f"El campo '{campo}' no mostró texto de error."