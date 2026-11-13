# language: es
Característica: Configuración de Datos de Pago (US-01.2 / US-05.2)
  Como dueño autenticado
  Quiero configurar los datos bancarios de transferencia de mi complejo
  Para que mis huéspedes vean a qué cuenta transferir cuando contraten adicionales

  Antecedentes:
    Dado un dueño autenticado en el panel de HostFlow
    Y accede a la sección "Datos de pago"
    Y selecciona el complejo "Complejo Los Sauces" en datos de pago

  @positivo
  Esquema del escenario: Configuración válida de datos de pago (Con Alias y con CBU de 22 dígitos)
    Cuando guarda los datos de pago con banco "<banco>", alias o CBU "<alias_cbu>" y titular "<titular>"
    Entonces el formulario de datos de pago permanece en la vista sin errores y muestra la nota informativa

    Ejemplos: Casos válidos según reglas de negocio (Alias 6-20 chars o CBU 22 dígitos)
      | banco            | alias_cbu              | titular              |
      | Mercado Pago     | ISLASAUCE.MP           | Juan Pérez           |
      | Banco Galicia    | 0070099920000012345678 | Cabañas del Tigre SA |
      | Banco Santander  | MI.CABANA.01           | María O'Brien-Núñez  |

  @validaciones @pendiente
  Esquema del escenario: Validaciones de campos obligatorios y valores límite en datos de pago
    Cuando intenta guardar los datos de pago con banco "<banco>", alias o CBU "<alias_cbu>" y titular "<titular>"
    Entonces el formulario de datos de pago no avanza y muestra un mensaje de error en el campo "<campo>"

    Ejemplos: Validaciones de Banco (campo obligatorio y caracteres inválidos)
      | banco | alias_cbu    | titular    | campo |
      |       | ISLASAUCE.MP | Juan Pérez | banco |
      | B     | ISLASAUCE.MP | Juan Pérez | banco |
      | @#*$% | ISLASAUCE.MP | Juan Pérez | banco |

    Ejemplos: Validaciones de Alias (6 a 20 chars) y CBU (22 dígitos exactos)
      | banco        | alias_cbu               | titular    | campo    |
      | Mercado Pago |                         | Juan Pérez | aliasCbu |
      | Mercado Pago | CORTO                   | Juan Pérez | aliasCbu |
      | Mercado Pago | ALIAS.DEMASIADO.LARGO.X | Juan Pérez | aliasCbu |
      | Mercado Pago | 007009992000001234567   | Juan Pérez | aliasCbu |
      | Mercado Pago | 00700999200000123456789 | Juan Pérez | aliasCbu |
      | Mercado Pago | ALIAS CON ESPACIOS      | Juan Pérez | aliasCbu |
      | Mercado Pago | ALIAS@#                 | Juan Pérez | aliasCbu |

    Ejemplos: Validaciones de Titular de la cuenta (campo obligatorio y formato)
      | banco        | alias_cbu    | titular    | campo   |
      | Mercado Pago | ISLASAUCE.MP |            | titular |
      | Mercado Pago | ISLASAUCE.MP | A          | titular |
      | Mercado Pago | ISLASAUCE.MP | Titular @# | titular |