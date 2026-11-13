# noinspection PyUnresolvedReferences
from behave import given, when, then, use_step_matcher

from pages.complejo_page import ComplejoPage
from helpers.utils import generar_string_aleatorio


# El paso "un dueño autenticado en el panel de HostFlow" vive en dashboard_steps.py
@given("accede al formulario de nuevo complejo")
def step_impl(context):
    context.dashboard_page.ir_a_seccion("Complejos")
    context.complejo_page = ComplejoPage(context.driver)
    context.complejo_page.hacer_clic_anadir_complejo()


@when("crea un complejo con datos válidos")
def step_impl(context):
    # Datos únicos para que el slug/nombre no choquen entre ejecuciones
    sufijo = generar_string_aleatorio()
    context.nombre_complejo = f"Cabañas Delta {sufijo}"
    context.url_formulario = context.driver.current_url
    context.complejo_page.crear_complejo(
        context.nombre_complejo, "Río Tigre 123", f"cabanas-delta-{sufijo}", "2", "6", "10"
    )


# Matcher "re": ([^"]*) sí acepta cadenas vacías ("")
use_step_matcher("re")


@when(r'intenta crear un complejo con nombre "([^"]*)", dirección "([^"]*)", '
      r'slug "([^"]*)" y capacidad mínima "([^"]*)"')
def step_impl(context, nombre, direccion, slug, cap_min):
    # Capacidad máxima y reservas fijas y válidas, para no provocar otros errores
    context.url_formulario = context.driver.current_url
    context.complejo_page.crear_complejo(nombre, direccion, slug, cap_min, "6", "10")


use_step_matcher("parse")


@then("el sistema registra el complejo y vuelve al listado")
def step_impl(context):
    context.complejo_page.wait.until(lambda d: d.current_url != context.url_formulario)
    assert context.complejo_page.aparece_en_listado(context.nombre_complejo), (
        f"El complejo '{context.nombre_complejo}' no aparece en el listado"
    )


@then('el formulario de complejo no avanza y muestra el mensaje "{mensaje_esperado}" en el campo "{campo}"')
def step_impl(context, mensaje_esperado, campo):
    # 1. Valida el texto rojo (esto ya lo está haciendo bien)
    mensaje_actual = context.complejo_page.obtener_mensaje_error_por_campo(campo)
    assert mensaje_esperado in mensaje_actual, (
        f"Se esperaba '{mensaje_esperado}' en '{campo}', pero se obtuvo '{mensaje_actual}'"
    )

    # 2. Le enseñamos que quedarse en /complejos/nuevo es el éxito de la prueba
    assert "complejos/nuevo" in context.driver.current_url, (
        f"El formulario avanzó. URL actual: {context.driver.current_url}"
    )