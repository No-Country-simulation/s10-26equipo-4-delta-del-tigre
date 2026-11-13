from behave import given, when, then

from pages.registro_page import RegistroPage
from helpers.utils import generar_correo_unico
from data.data import hostflow_username_registro, hostflow_password_registro

@given("un dueño sin cuenta en la página de registro")
def step_impl(context):
    context.registro_page = RegistroPage(context.driver)
    context.registro_page.ir_a_registro(context.base_url)


@when("se registra con datos válidos")
def step_impl(context):
    context.registro_page.registrar(
        hostflow_username_registro,
        generar_correo_unico(),
        hostflow_password_registro,
        hostflow_password_registro,
    )


@when('intenta registrarse con nombre "{nombre}", correo "{correo}", contraseña "{password}" y confirmación "{confirm_password}"')
def step_impl(context, nombre, correo, password, confirm_password):
    # Manejamos los campos vacíos si Behave los pasa nulos
    n = "" if not nombre else nombre
    c = "" if not correo else correo
    p = "" if not password else password
    cp = "" if not confirm_password else confirm_password
    context.registro_page.registrar(n, c, p, cp)


@then("el sistema crea su cuenta y lo lleva al dashboard")
def step_impl(context):
    assert context.registro_page.llego_al_dashboard(), (
        f"No se llegó al dashboard. URL actual: {context.driver.current_url}"
    )


@then("el formulario no avanza y muestra el mensaje \"{mensaje_esperado}\" en el campo \"{campo}\"")
def step_impl(context, mensaje_esperado, campo):
    mensaje_actual = context.registro_page.obtener_mensaje_error_por_campo(campo)
    assert mensaje_esperado in mensaje_actual, (
        f"Se esperaba \x27{mensaje_esperado}\x27 en \x27{campo}\x27, pero se obtuvo \x27{mensaje_actual}\x27"
    )
    assert context.registro_page.esta_en_registro(), (
        f"El formulario avanzó. URL actual: {context.driver.current_url}"
    )