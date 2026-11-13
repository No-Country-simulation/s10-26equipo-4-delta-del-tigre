# noinspection PyUnresolvedReferences
from behave import given, when, then, use_step_matcher
from selenium.common.exceptions import TimeoutException

from pages.onboarding_page import OnboardingPage


@given('un turista que ingresa al enlace de onboarding "{slug}"')
def step_impl(context, slug):
    context.onboarding_page = OnboardingPage(context.driver)
    context.onboarding_page.abrir_onboarding(context.base_url, slug)


@then('visualiza la cabecera white-label del complejo "{nombre_complejo}"')
def step_impl(context, nombre_complejo):
    assert context.onboarding_page.verificar_cabecera_whitelabel(nombre_complejo), (
        f"No se renderizó correctamente la cabecera white-label para '{nombre_complejo}'."
    )


@then("el sistema muestra la vista de complejo no encontrado (404)")
def step_impl(context):
    assert context.onboarding_page.muestra_vista_404(), (
        f"No se mostró la vista 404 para un slug inexistente. URL: {context.driver.current_url}"
    )


# Usamos "re" para que puedas enviar campos vacíos "" desde las tablas de Gherkin
use_step_matcher("re")


@when(r'(?:completa|intenta completar) el paso 1 con nombre "([^"]*)", documento "([^"]*)", '
      r'teléfono "([^"]*)", email "([^"]*)", huéspedes "([^"]*)", llegada "([^"]*)" y salida "([^"]*)"')
def step_impl(context, nombre, documento, telefono, email, huespedes, llegada, salida):
    context.onboarding_page.completar_paso_1(
        nombre, documento, telefono, email, huespedes, llegada, salida
    )
    context.onboarding_page.hacer_clic_continuar()


@when(r'(?:completa|intenta completar) el paso 2 seleccionando alergia "([^"]*)", '
      r'otra alergia "([^"]*)" y preferencias "([^"]*)"')
def step_impl(context, alergia_chip, otra_alergia, preferencias):
    context.onboarding_page.completar_paso_2(alergia_chip, otra_alergia, preferencias)
    context.onboarding_page.hacer_clic_continuar()


@when(r'en el paso 3 selecciona el adicional "([^"]*)" con cantidad "([^"]*)" y continúa')
def step_impl(context, nombre_adicional, cantidad):
    context.onboarding_page.agregar_adicional(nombre_adicional, cantidad)
    context.onboarding_page.hacer_clic_continuar()


@when(r'en el paso 4 marca cotizar lancha y (?:completa|intenta completar) con salida "([^"]*)", '
      r'regreso "([^"]*)", punto "([^"]*)" y pasajeros "([^"]*)"')
def step_impl(context, salida_lancha, regreso_lancha, punto_salida, pasajeros):
    context.onboarding_page.marcar_cotizar_lancha()
    context.onboarding_page.completar_datos_lancha(
        salida_lancha, regreso_lancha, punto_salida, pasajeros
    )
    context.onboarding_page.hacer_clic_finalizar()


use_step_matcher("parse")


@when("en el paso 4 finaliza el onboarding sin cotizar lancha")
def step_impl(context):
    context.onboarding_page.esperar_paso(4)
    context.onboarding_page.hacer_clic_finalizar()


@then('el onboarding permanece en el "Paso {numero_paso:d} de 4" y muestra un mensaje de error en el campo "{campo}"')
def step_impl(context, numero_paso, campo):
    assert context.onboarding_page.esta_en_paso(numero_paso), (
        f"BUG: El formulario avanzó del Paso {numero_paso} de 4 cuando debía bloquearse por el campo '{campo}'."
    )
    try:
        mensaje_actual = context.onboarding_page.obtener_mensaje_error_por_campo(campo)
    except TimeoutException:
        raise AssertionError(
            f"El formulario se quedó en el Paso {numero_paso} de 4, pero no mostró error en el campo '{campo}'."
        )
    assert mensaje_actual != "", f"El mensaje de error del campo '{campo}' está vacío."


@then('se muestra la pantalla de confirmación para "{nombre_turista}" con código DS, resumen de "{adicional}" por "{total}" y estado de lancha "{estado_lancha}"')
def step_impl(context, nombre_turista, adicional, total, estado_lancha):
    assert context.onboarding_page.confirmar_checkin_completo(nombre_turista), (
        f"No apareció el mensaje de CHECK-IN COMPLETO para '{nombre_turista}'."
    )
    assert context.onboarding_page.tiene_codigo_reserva_mock(), (
        "No se encontró un código de reserva con formato DS-#### en la pantalla final."
    )
    if adicional:
        assert context.onboarding_page.muestra_resumen_adicional_y_copiar_alias(adicional, total), (
            f"Falta el desglose del adicional '{adicional}' ({total}) o el botón de copiar alias/CBU."
        )

    aviso_lancha_visible = context.onboarding_page.muestra_aviso_lancha_recibida()
    if estado_lancha == "con_lancha":
        assert aviso_lancha_visible, "Se cotizó lancha, pero NO apareció el cartel 'Solicitud de lancha recibida'."
    else:
        assert not aviso_lancha_visible, "NO se cotizó lancha, pero apareció el cartel 'Solicitud de lancha recibida'."