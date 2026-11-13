# language: es
Característica: Creación de adicionales (US-05.1)
  Como dueño autenticado
  Quiero crear servicios adicionales de mi complejo
  Para ofrecer servicios extra para mi alojamiento en HostFlow

  Antecedentes:
    Dado un dueño autenticado en el panel de HostFlow
    Y accede a la sección "Adicionales"
    Y selecciona el complejo "Ana"
    Y accede al formulario de nuevo adicional

  @positivo
  Esquema del escenario: Creación exitosa de un nuevo adicional
    Cuando crea un adicional con nombre "<nombre>", descripción "<descripcion>" y precio "<precio>"
    Entonces el sistema registra el adicional y "<nombre>" aparece en el listado

    Ejemplos: Con y sin descripción (campo opcional)
      | nombre        | descripcion                                                                                                                                                                                                                                               | precio |
      | Desayuno VIP  | Café y tostadas caseras                                                                                                                                                                                                                                   | 15000  |
      | Late checkout |                                                                                                                                                                                                                                                           | 8000   |
      | Masaje Relax  | Disfruta de una sesion de masajes relajantes frente al rio con aceites esenciales naturales, musica ambiental suave, infusiones de hierbas locales y toallas calientes. Ideal para desconectar del estres urbano durante tu estadia en nuestras cabanas!! | 25000  |
      | Combo 2x1     | Almuerzo y Desayuno                                                                                                                                                                                                                                       | 15000  |

  @validaciones
  Esquema del escenario: Validaciones de campos obligatorios y valores límite en formulario de adicionales
    Cuando intenta crear un adicional con nombre "<nombre>", descripción "<descripcion>" y precio "<precio>"
    Entonces el formulario de adicional no avanza y muestra un mensaje de error en el campo "<campo>"

    Ejemplos: Validaciones de nombre (campo obligatorio)
      | nombre       | descripcion        | precio | campo  |
      |              | Descripción válida | 15000  | nombre |
      | A            | Descripción válida | 15000  | nombre |
      | Desayuno @#* | Descripción válida | 15000  | nombre |
      | 早餐套餐       | Descripción válida | 15000  | nombre |

    Ejemplos: Validaciones de descripción (caracteres especiales y alfabetos no latinos)
      | nombre       | descripcion          | precio | campo       |
      | Desayuno VIP | Menú especial @#*!   | 15000  | descripcion |
      | Desayuno VIP | パンとコーヒーの朝食     | 15000  | descripcion |

    Ejemplos: Validaciones de precio (campo obligatorio y mayor a cero)
      | nombre       | descripcion        | precio | campo  |
      | Desayuno VIP | Descripción válida |        | precio |
      | Desayuno VIP | Descripción válida | 0      | precio |
      | Desayuno VIP | Descripción válida | -100   | precio |
      | Desayuno VIP | Descripción válida | abc    | precio |
