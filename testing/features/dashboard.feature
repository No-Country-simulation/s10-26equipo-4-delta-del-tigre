# language: es
Característica: Navegación del panel de HostFlow
  Como dueño autenticado
  Quiero acceder a las distintas secciones del panel
  Para gestionar mi alojamiento

  Antecedentes:
    Dado un dueño autenticado en el panel de HostFlow

  @navegacion
  Esquema del escenario: Acceso a las secciones del panel
    Cuando accede a la sección "<seccion>"
    Entonces la sección "<seccion>" queda activa en el panel

    Ejemplos: Secciones del menú lateral
      | seccion           |
      | Inicio            |
      | Complejos         |
      | Reservas          |
      | Adicionales       |
      | Datos de pago     |
      | Link de onboarding |
