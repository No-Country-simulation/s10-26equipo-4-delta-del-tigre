# Reporte de pruebas · Sprint N

**Periodo:** 25/10 – 13/11/2026 · **Rama probada:** `dev` · **Responsable:** Karol Trujillo

## Resumen

La API está bien cubierta (74 % de los casos ejecutados), pero el frontend integrado con la API sigue con baja cobertura (alrededor de 35 %), porque la automatización de la interfaz solo estuvo lista el 12/11 y corre en modo Mock. Hay 3 bugs abiertos (BUG-017 de severidad Alta) y 24 casos bloqueados, la mayoría por funciones aún no habilitadas.

## Cobertura

Fuente: Libro de Pruebas v3.3 (13/11/2026). «Ejecutados» = Pasó + Falló. Los casos N/A (2, en FEAT-01) cuentan como diseñados, no como ejecutados.

| Feature | Casos diseñados | Ejecutados | Pasaron | Fallaron | Bloqueados |
|---|---|---|---|---|---|
| FEAT-01 | 91 | 49 | 43 | 6 | 13 |
| FEAT-02 | 25 | 12 | 10 | 2 | 5 |
| FEAT-03 | 30 | 19 | 18 | 1 | 0 |
| FEAT-04 | 20 | 12 | 12 | 0 | 4 |
| FEAT-05 | 37 | 18 | 15 | 3 | 2 |
| FEAT-06 | 12 | 11 | 10 | 1 | 0 |
| Transversal | 12 | 2 | 2 | 0 | 0 |
| **Total** | **227** | **123** | **110** | **13** | **24** |

Cobertura por capa (según la etiqueta del título del caso):

| Capa | Casos | Ejecutados | % ejecutado |
|---|---|---|---|
| API (Swagger) | 74 | 55 | 74 % |
| Frontend manual (UI) | 69 | 24 | 35 % |
| Mixto (UI + API) | 58 | 19 | 33 % |
| Frontend automatizado (Selenium, modo Mock) | 8 | 8 | 100 % (sin integración con la API) |
| Sin etiqueta (correos, E2E, transversales) | 18 | 17 | 94 % |

## Bugs

| Issue | Severidad | Feature | Estado |
|---|---|---|---|
| BUG-001 | Media | FEAT-01 | Resuelto |
| BUG-002 | Media | FEAT-01 | Resuelto |
| BUG-003 | Media | FEAT-01 | Resuelto |
| BUG-004 | Media | FEAT-01 | Resuelto |
| BUG-005 | Alta | FEAT-01 | Resuelto |
| BUG-006 | Baja | FEAT-02 | Resuelto |
| BUG-007 | Alta | FEAT-01 | Resuelto |
| BUG-8 | Media | FEAT-01 | Resuelto |
| BUG-9 | Media | FEAT-01 | Resuelto |
| BUG-10 | Alta | FEAT-01 | Resuelto |
| BUG-11 | Media | FEAT-01 | Resuelto |
| BUG-12 | Alta | FEAT-01 | Resuelto |
| BUG-13 | Media | FEAT-05 | Resuelto |
| BUG-14 | Alta | FEAT-02 | Resuelto |
| BUG-15 | Alta | FEAT-03 | Resuelto |
| BUG-16 | Alta | FEAT-05 | Resuelto |
| BUG-017 | Alta | FEAT-01 | **Abierto** |
| BUG-018 | Baja | FEAT-01 | **Abierto** |
| BUG-019 | Media | FEAT-06 | **Abierto** |

- Abiertos: 3 · Resueltos en el periodo: 16

Abiertos:

- **BUG-017:** el formulario de Datos de pago (`/datos-pago`) no tiene `onSubmit` ni validación Zod; recarga la página por GET y vacía los campos (TC-223).
- **BUG-018:** la nota al pie de Datos de pago dice «DeltaFlow» en lugar de HostFlow (TC-222).
- **BUG-019:** el correo de confirmación al turista no incluye Alias/CBU ni el mensaje de transferencia (TC-089). Falta confirmar si la reserva de prueba incluía adicionales, ya que ese bloque puede ser condicional.

## Casos bloqueados y motivo

- TC-023, TC-025, TC-026, TC-027: pendientes hasta integrar el backend en la pantalla de reservas.
- TC-053, TC-055, TC-056, TC-057: la función de lancha por API estaba por implementar (respuestas 501 o 500).
- TC-076: el onboarding no se refleja en `GET /api/v1/bookings/{id}`.
- TC-183: la lancha todavía no estaba habilitada.
- TC-133, TC-136, TC-137, TC-138, TC-139, TC-140, TC-141, TC-143, TC-144, TC-145: la opción aún no estaba habilitada en la interfaz (edición, estado operativo, baja de complejo).
- TC-157, TC-158, TC-159, TC-193: bloqueados sin motivo registrado; falta documentarlo.

## Riesgos

- 77 de los 184 casos P1 siguen sin ejecutar o bloqueados, la mayoría de frontend.
- La automatización del frontend corre solo en modo Mock: no valida la integración con la API.
- Endpoint que guarda los datos de pago sin confirmar (H-16); respuestas escritas de H-16 y H-17 pendientes.
- Criterios de la interfaz que no coinciden con el Manual: punto de salida de la lancha (H-17) y mínimo de pasajeros (EL-PAX-02).
- Varias fechas de ejecución y navegadores de casos de API siguen sin completar en el libro.

## Próximos pasos

- Recorrido de punta a punta con la API real (registro, complejo, adicional, onboarding con adicional y lancha, correos en Mailpit).
- Repetir la automatización de onboarding sin Mock.
- Corregir BUG-017, BUG-018 y BUG-019 (confirmar antes este último) y repetir sus casos.
- Registrar el motivo de TC-157, TC-158, TC-159 y TC-193, y volver a evaluar los bloqueados que dependían de funciones ya implementadas.
- Ejecutar los casos P1 pendientes de frontend, empezando por los de mayor riesgo.

## Evidencias

- `evidencias/sprint-N/`
