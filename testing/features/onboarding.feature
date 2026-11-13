# language: es
Característica: Onboarding Público de Huéspedes y Cotización de Lancha (FEAT-03 / FEAT-04 / FEAT-05)
  Como turista que reservó en un complejo del Delta
  Quiero completar mi pre-check-in, preferencias, adicionales y traslado en lancha
  Para agilizar mi ingreso al alojamiento sin requerir autenticación

  @positivo @e2e
  Escenario: Flujo E2E completo contratando adicional (Paseo en kayak) y cotizando lancha remis
    Dado un turista que ingresa al enlace de onboarding "complejo-jose"
    Entonces visualiza la cabecera white-label del complejo "Jose"
    Cuando completa el paso 1 con nombre "Marina López", documento "35123456", teléfono "+54 11 5555 4444", email "marina@mail.com", huéspedes "2", llegada "2026-12-10" y salida "2026-12-15"
    Y completa el paso 2 seleccionando alergia "Gluten", otra alergia "Polen" y preferencias "Cama matrimonial y llegada temprana"
    Y en el paso 3 selecciona el adicional "Paseo en kayak" con cantidad "1" y continúa
    Y en el paso 4 marca cotizar lancha y completa con salida "2026-12-10T10:00", regreso "2026-12-15T18:00", punto "Estación Fluvial de Tigre" y pasajeros "2"
    Entonces se muestra la pantalla de confirmación para "Marina López" con código DS, resumen de "Paseo en kayak" por "24.000" y estado de lancha "con_lancha"

  @positivo @sin_lancha
  Escenario: Flujo E2E exitoso sin cotizar lancha remis (verifica que no aparezca aviso de lancha)
    Dado un turista que ingresa al enlace de onboarding "complejo-jose"
    Cuando completa el paso 1 con nombre "Carlos Gómez", documento "32999888", teléfono "+54 11 4444 3333", email "carlos@mail.com", huéspedes "2", llegada "2026-12-10" y salida "2026-12-15"
    Y completa el paso 2 seleccionando alergia "", otra alergia "" y preferencias ""
    Y en el paso 3 selecciona el adicional "Paseo en kayak" con cantidad "1" y continúa
    Y en el paso 4 finaliza el onboarding sin cotizar lancha
    Entonces se muestra la pantalla de confirmación para "Carlos Gómez" con código DS, resumen de "Paseo en kayak" por "24.000" y estado de lancha "sin_lancha"

  @validaciones @paso1
  Esquema del escenario: Validaciones bloqueantes de Zod en el Paso 1 (Tus datos y fechas coherentes)
    Dado un turista que ingresa al enlace de onboarding "complejo-jose"
    Cuando intenta completar el paso 1 con nombre "<nombre>", documento "<documento>", teléfono "<telefono>", email "<email>", huéspedes "<huespedes>", llegada "<llegada>" y salida "<salida>"
    Entonces el onboarding permanece en el "Paso 1 de 4" y muestra un mensaje de error en el campo "<campo>"

    Ejemplos: Campos obligatorios vacíos y formatos inválidos en Paso 1
      | nombre       | documento | telefono         | email           | huespedes | llegada    | salida     | campo     |
      |              | 35123456  | +54 11 5555 4444 | marina@mail.com | 2         | 2026-12-10 | 2026-12-15 | nombre    |
      | M            | 35123456  | +54 11 5555 4444 | marina@mail.com | 2         | 2026-12-10 | 2026-12-15 | nombre    |
      | Marina 123   | 35123456  | +54 11 5555 4444 | marina@mail.com | 2         | 2026-12-10 | 2026-12-15 | nombre    |
      | Marina López |           | +54 11 5555 4444 | marina@mail.com | 2         | 2026-12-10 | 2026-12-15 | documento |
      | Marina López | 12        | +54 11 5555 4444 | marina@mail.com | 2         | 2026-12-10 | 2026-12-15 | documento |
      | Marina López | 35123456  |                  | marina@mail.com | 2         | 2026-12-10 | 2026-12-15 | telefono  |
      | Marina López | 35123456  | +54 11 5555 4444 |                 | 2         | 2026-12-10 | 2026-12-15 | email     |
      | Marina López | 35123456  | +54 11 5555 4444 | correo-invalido | 2         | 2026-12-10 | 2026-12-15 | email     |

    Ejemplos: Valores límite de huéspedes (1 a 10) y coherencia de fechas (Pasado y Salida <= Llegada)
      | nombre       | documento | telefono         | email           | huespedes | llegada    | salida     | campo     |
      | Marina López | 35123456  | +54 11 5555 4444 | marina@mail.com | 0         | 2026-12-10 | 2026-12-15 | huespedes |
      | Marina López | 35123456  | +54 11 5555 4444 | marina@mail.com | 11        | 2026-12-10 | 2026-12-15 | huespedes |
      | Marina López | 35123456  | +54 11 5555 4444 | marina@mail.com | 2         | 2025-01-10 | 2026-12-15 | llegada   |
      | Marina López | 35123456  | +54 11 5555 4444 | marina@mail.com | 2         | 2026-12-10 | 2026-12-10 | salida    |
      | Marina López | 35123456  | +54 11 5555 4444 | marina@mail.com | 2         | 2026-12-10 | 2026-12-08 | salida    |

  @validaciones @paso4_lancha
  Esquema del escenario: Validaciones condicionales al marcar Cotizar lancha remis en el Paso 4 (incluyendo Pasajeros > Huéspedes)
    Dado un turista que ingresa al enlace de onboarding "complejo-jose"
    Cuando completa el paso 1 con nombre "Marina López", documento "35123456", teléfono "+54 11 5555 4444", email "marina@mail.com", huéspedes "2", llegada "2026-12-10" y salida "2026-12-15"
    Y completa el paso 2 seleccionando alergia "", otra alergia "" y preferencias ""
    Y en el paso 3 selecciona el adicional "" con cantidad "0" y continúa
    Y en el paso 4 marca cotizar lancha y intenta completar con salida "<salida_lancha>", regreso "<regreso_lancha>", punto "<punto_salida>" y pasajeros "<pasajeros>"
    Entonces el onboarding permanece en el "Paso 4 de 4" y muestra un mensaje de error en el campo "<campo>"

    Ejemplos: Campos obligatorios de lancha, horarios incoherentes y Pasajeros (3) > Huéspedes (2)
      | salida_lancha    | regreso_lancha   | punto_salida              | pasajeros | campo           |
      |                  | 2026-12-15T18:00 | Estación Fluvial de Tigre | 2         | salidaLancha    |
      | 2026-12-10T10:00 |                  | Estación Fluvial de Tigre | 2         | regresoLancha   |
      | 2026-12-15T18:00 | 2026-12-10T10:00 | Estación Fluvial de Tigre | 2         | regresoLancha   |
      | 2026-12-10T10:00 | 2026-12-15T18:00 |                           | 2         | puntoSalida     |
      | 2026-12-10T10:00 | 2026-12-15T18:00 | Estación Fluvial de Tigre | 0         | pasajerosLancha |
      | 2026-12-10T10:00 | 2026-12-15T18:00 | Estación Fluvial de Tigre | 3         | pasajerosLancha |