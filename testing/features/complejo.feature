# language: es
Característica: Creación de complejo (US-01.2)
  Como dueño autenticado
  Quiero crear un complejo
  Para gestionar mi alojamiento en HostFlow

  Antecedentes:
    Dado un dueño autenticado en el panel de HostFlow
    Y accede al formulario de nuevo complejo

  # PENDIENTE: quitar @pendiente cuando el guardado esté implementado en el frontend.
  @positivo @pendiente
  Escenario: Creación exitosa de un nuevo complejo
    Cuando crea un complejo con datos válidos
    Entonces el sistema registra el complejo y vuelve al listado

  @validaciones
  Esquema del escenario: Validaciones de campos y valores límite en formulario de complejo
    Cuando intenta crear un complejo con nombre "<nombre>", dirección "<direccion>", slug "<slug>" y capacidad mínima "<cap_min>"
    Entonces el formulario de complejo no avanza y muestra el mensaje "<mensaje_esperado>" en el campo "<campo>"

    Ejemplos: Validaciones extraídas de la UI
      | nombre | direccion | slug | cap_min | campo         | mensaje_esperado                              |
      | A      | Dir 123   | abc  | 1       | nombre        | El nombre debe tener al menos 2 caracteres.   |
      | Test   | Ab        | abc  | 1       | direccion     | La dirección debe tener al menos 3 caracteres. |
      | Test   | Dir 123   | a    | 1       | slug          | El slug debe tener al menos 2 caracteres.     |
      | Test   | Dir 123   | abc  |         | capacidad_min | Este campo es obligatorio.                    |
