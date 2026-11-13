# Testing · HostFlow (Delta del Tigre)

Documentación y evidencias de QA del proyecto B2B2C **HostFlow** (Equipo 4, Simulación Laboral Abierta NoCountry).

- **Rol:** QA · Karol Trujillo
- **Fuente de requisitos:** Manual de Requisitos y Especificaciones del Sistema https://docs.google.com/document/d/1uwiU7HdbH2wIMPGld7pijM6ZbwitDxpi/edit?usp=sharing&ouid=105270048328552521527&rtpof=true&sd=true
- **Libro de pruebas vivo (Google Sheets):** https://docs.google.com/spreadsheets/d/1zyUAGHuR8GOqKA3KYheYx68xpC7a4x2O/edit?usp=sharing&ouid=105270048328552521527&rtpof=true&sd=true
- **Copia del libro (versión 3.3):** `HostFlow_QA_Libro_de_Pruebas_v3_3_SinJira.xlsx`
- **Plan de pruebas:** [`plan-de-pruebas.md`](plan-de-pruebas.md)
- **Dudas sobre requisitos:** [`hallazgos.md`](hallazgos.md)

## Resumen de pruebas

Estado al 13/11/2026 (libro de pruebas v3.3).

| Indicador | Valor |
|---|---|
| Casos de prueba diseñados | 227 |
| Casos de la Fase 1 (prioritarios) | 199 |
| Clases de equivalencia y límites | 157 |
| Casos con requisito "Por definir" | 17 |
| Casos ejecutados (Pasó + Falló) | 123 |
| Pasaron / Fallaron / Bloqueados | 110 / 13 / 24 |
| Sin ejecutar | 78 (más 2 N/A) |
| Bugs abiertos / resueltos | 3 / 16 |

Cobertura por capa (según la etiqueta del título del caso): API 74 % ejecutado, frontend manual 35 %, mixto (UI + API) 33 %. Los 8 casos de Selenium corren en modo Mock y no validan la integración con la API.

> Se actualiza al cerrar cada sprint; el detalle está en [`reportes/`](reportes/).

## Estructura de la carpeta

```
testing/
├── README.md
├── plan-de-pruebas.md
├── hallazgos.md
├── casos-de-prueba-csv/   casos por Feature + equivalencia y límites (CSV)
├── reportes/              un reporte por sprint
└── evidencias/            capturas y videos, por sprint
```

## Casos de prueba por Feature

| Feature | Nombre | Casos | Archivo |
|---|---|---|---|
| FEAT-01 | Gestión e Identidad del Complejo | 91 | [`FEAT-01.csv`](casos-de-prueba-csv/casos-de-prueba/FEAT-01.csv) |
| FEAT-02 | Reservas y Disponibilidad | 25 | [`FEAT-02.csv`](casos-de-prueba-csv/casos-de-prueba/FEAT-02.csv) |
| FEAT-03 | Onboarding de Huéspedes | 30 | [`FEAT-03.csv`](casos-de-prueba-csv/casos-de-prueba/FEAT-03.csv) |
| FEAT-04 | Lancha Remis y Webhook | 20 | [`FEAT-04.csv`](casos-de-prueba-csv/casos-de-prueba/FEAT-04.csv) |
| FEAT-05 | Mini-Ecommerce de Adicionales | 37 | [`FEAT-05.csv`](casos-de-prueba-csv/casos-de-prueba/FEAT-05.csv) |
| FEAT-06 | Notificaciones por Email | 12 | [`FEAT-06.csv`](casos-de-prueba-csv/casos-de-prueba/FEAT-06.csv) |
| TRANSVERSAL | No funcionales y E2E | 12 | [`TRANSVERSAL.csv`](casos-de-prueba-csv/casos-de-prueba/TRANSVERSAL.csv) |
| EL | Equivalencia y límites | 157 clases | [`EL-equivalencia-y-limites.csv`](casos-de-prueba-csv/casos-de-prueba/EL-equivalencia-y-limites.csv) |

## Técnicas aplicadas

- **Partición de equivalencia:** clases válidas e inválidas por campo.
- **Valores límite:** por ejemplo logo de 1,99 / 2,00 / 2,01 MB; descripción de adicional de 249 / 250 / 251 caracteres; huéspedes de 1 a 10.
- **Pruebas de API con Swagger:** códigos de respuesta, validaciones y seguridad por rol (OWNER).
- **Notificaciones y webhook:** correos al dueño y al turista verificados en Mailpit (`http://localhost:8025`); envío de la solicitud de lancha al webhook y tolerancia a fallos.
- **Automatización de la interfaz:** Selenium + Behave (Gherkin) sobre Datos de pago, adicionales y onboarding, en modo Mock. Ver la sección *Automatización de la interfaz*.
- **Pruebas negativas básicas de acceso y datos:** acceso sin sesión, botón Atrás tras cerrar sesión, cambio de ID en la URL, texto con símbolos y HTTPS visible.
- **Mobile-first:** anchos de 320 a 414 px, Chrome Android y Safari iOS.
- **Flujos de extremo a extremo** (E2E) con uno y varios complejos.

## Automatización de la interfaz

Pruebas automatizadas del frontend, hechas por QA, con 8 casos ejecutados (TC-220 a TC-227) sobre Datos de pago, adicionales y onboarding. Corren en **modo Mock**: la interfaz usa datos simulados (`complejo.json`) y no se conecta a la API, así que no validan la integración.

**Herramientas**

| Herramienta | Uso |
|---|---|
| Python | Lenguaje de la automatización |
| Selenium | Control del navegador |
| Behave | Ejecuta los escenarios escritos en Gherkin |
| Gherkin | Escenarios en formato Dado / Cuando / Entonces |
| PyCharm | Entorno de desarrollo |

**Estructura del proyecto de automatización**

```
data/
├── __init__.py
└── data.py                 datos de prueba
evidencias/                 capturas de las corridas
features/
├── steps/                  pasos de cada escenario
│   ├── aditional_steps.py
│   ├── complejo_steps.py
│   ├── dashboard_steps.py
│   ├── datos_pago_steps.py
│   ├── onboarding_steps.py
│   └── registro_steps.py
├── adicional.feature
├── complejo.feature
├── dashboard.feature
├── datos_pago.feature
├── onboarding.feature
├── registro.feature
└── environment.py          configuración de Behave (antes y después de cada prueba)
helpers/
├── __init__.py
└── utils.py                funciones de apoyo
pages/                      una clase por pantalla
├── __init__.py
├── base_page.py            acciones comunes
├── adicional_page.py
├── complejo_page.py
├── dashboard_page.py
├── datos_pago_page.py
├── login_page.py
├── onboarding_page.py
└── registro_page.py
```

| Carpeta | Contenido |
|---|---|
| `features/` | Escenarios en Gherkin (`.feature`) por funcionalidad y, en `steps/`, el código de cada paso |
| `pages/` | Una clase por pantalla de la aplicación, sobre una base común (`base_page.py`) |
| `helpers/` | Funciones de apoyo (`utils.py`) |
| `data/` | Datos de prueba (`data.py`) |
| `evidencias/` | Evidencias de las corridas |

Los resultados de estas pruebas están en los casos TC-220 a TC-227 del libro. La corrida contra la API real sigue pendiente.

## Convenciones

| Elemento | Formato |
|---|---|
| Caso de prueba | `TC-001`, `TC-002`… |
| Valor de equivalencia o límite | `EL-LOGO-PESO-04` |
| Bug | `BUG-001`, `BUG-002`… |
| Hallazgo | `H-01`, `H-02`… |
| Prioridad | P1 crítico · P2 importante · P3 deseable |
| Fase | Fase 1 (prioritaria para la primera entrega) · Fase 2 |
| Requisito | Definido · Por definir (depende de [`hallazgos.md`](hallazgos.md)) |
| Estado de ejecución | No ejecutado · Pasó · Falló · Bloqueado · N/A |
| Tarjetas del Project | `QA-01 · Plan de pruebas` |

## Cómo se reporta un bug

1. Abrir un issue con la plantilla **Reporte de bug (QA)**.
2. Mencionar la tarjeta afectada (por ejemplo `#11`) y el caso `TC-xxx`.
3. Adjuntar evidencia en `evidencias/sprint-N/` o directamente en el issue.
4. Cuando se corrija, QA vuelve a probar, comenta el resultado y cierra.

## Severidad

| Severidad | Cuándo se usa |
|---|---|
| Crítica | Bloquea el flujo principal o expone datos de otro complejo |
| Alta | Falla una función clave sin alternativa |
| Media | Falla con alternativa o afecta una función secundaria |
| Baja | Texto, estilo o mejora menor |