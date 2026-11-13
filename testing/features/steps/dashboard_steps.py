# noinspection PyUnresolvedReferences
from behave import given, then, step

from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from data.data import hostflow_email_admin, hostflow_password_admin


# Paso compartido por todos los .feature que parten de un usuario con sesión iniciada
@given("un dueño autenticado en el panel de HostFlow")
def step_impl(context):
    context.login_page = LoginPage(context.driver)
    context.login_page.iniciar_sesion(context.base_url, hostflow_email_admin, hostflow_password_admin)
    context.dashboard_page = DashboardPage(context.driver)


# @step: sirve en Antecedentes (Dado/Y) y en escenarios (Cuando)
@step('accede a la sección "{seccion}"')
def step_impl(context, seccion):
    context.dashboard_page.ir_a_seccion(seccion)


@then('la sección "{seccion}" queda activa en el panel')
def step_impl(context, seccion):
    assert context.dashboard_page.seccion_esta_activa(seccion), (
        f"La sección '{seccion}' no quedó activa. URL actual: {context.driver.current_url}"
    )