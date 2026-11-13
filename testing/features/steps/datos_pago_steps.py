# noinspection PyUnresolvedReferences
from behave import given, when, then, use_step_matcher
from selenium.common.exceptions import TimeoutException

from pages.datos_pago_page import DatosPagoPage


@given('selecciona el complejo "{nombre_complejo}" en datos de pago')
def step_impl(context, nombre_complejo):
    context.datos_pago_page = DatosPagoPage(context.driver)
    context.datos_pago_page.seleccionar_complejo(nombre_complejo)


use_step_matcher("re")


@when(r'(?:guarda|intenta guardar) los datos de pago con banco "([^"]*)", '
      r'alias o CBU "([^"]*)" y titular "([^"]*)"')
def step_impl(context, banco, alias_cbu, titular):
    context.datos_pago_page.configurar_datos_pago(banco, alias_cbu, titular)


use_step_matcher("parse")


@then("el formulario de datos de pago permanece en la vista sin errores y muestra la nota informativa")
def step_impl(context):
    assert "/datos-pago" in context.driver.current_url, (
        f"La URL cambió inesperadamente: {context.driver.current_url}"
    )
    assert context.datos_pago_page.nota_informativa_es_visible(), (
        "No se encontró la nota informativa sobre transferencias directas."
    )
    assert context.datos_pago_page.ninguno_tiene_error(), (
        "Se mostraron mensajes de error en el formulario al intentar guardar datos válidos."
    )


@then('el formulario de datos de pago no avanza y muestra un mensaje de error en el campo "{campo}"')
def step_impl(context, campo):
    # 1. Detecta al instante el BUG de recarga de formulario (cuando mete ?banco=... en la URL y limpia los inputs)
    assert "?" not in context.driver.current_url, (
        f"BUG FRONTEND: Al guardar, el formulario recargó la página por GET y vació los campos "
        f"sin ejecutar validaciones. URL: {context.driver.current_url}"
    )

    # 2. Si no recargó la página, busca el mensaje de error debajo del campo
    try:
        mensaje_actual = context.datos_pago_page.campo_tiene_error(campo)
    except TimeoutException:
        raise AssertionError(
            f"No apareció ningún mensaje de error en el campo '{campo}'. "
            f"URL actual: {context.driver.current_url}"
        )
    assert mensaje_actual.strip() != "", f"El campo '{campo}' no mostró texto de error."