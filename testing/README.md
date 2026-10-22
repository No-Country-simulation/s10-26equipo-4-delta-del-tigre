# Testing · HostFlow (Delta del Tigre)

Documentación y evidencias de QA del proyecto B2B2C **HostFlow** (Equipo 4, Simulación Laboral Abierta NoCountry).

- **Rol:** QA · Karol Trujillo
- **Fuente de requisitos:** Manual de Requisitos y Especificaciones del Sistema (ver `docs/` o el enlace del equipo)
- **Libro de pruebas vivo (Google Sheets):** https://docs.google.com/spreadsheets/d/1OCFhJqHh2yR_bzotv0kwFjbIKsLGmP44/edit?usp=drive_link&ouid=105270048328552521527&rtpof=true&sd=true
- **Plan de pruebas:** [`plan-de-pruebas.md`](plan-de-pruebas.md)
- **Dudas sobre requisitos:** [`hallazgos.md`](hallazgos.md)

## Resumen de pruebas

| Indicador | Valor |
|---|---|
| Casos de prueba diseñados | 105 |
| Casos de la Fase 1 (prioritarios) | 80 |
| Valores de equivalencia y límites | 134 |
| Casos con requisito "Por definir" | 31 |
| Casos ejecutados | completar |
| Pasaron / Fallaron / Bloqueados | completar |
| Bugs abiertos / cerrados | completar |

> Se actualiza al cerrar cada sprint; el detalle está en [`reportes/`](reportes/).

## Estructura de la carpeta

```
testing/
├── README.md
├── plan-de-pruebas.md
├── hallazgos.md
├── casos-de-prueba/     CSV por Feature + equivalencia y límites
├── reportes/            un reporte por sprint
└── evidencias/          capturas y videos, por sprint
```

## Casos de prueba por Feature

| Feature | Nombre | Casos | Archivo |
|---|---|---|---|
| FEAT-01 | Gestión e Identidad del Complejo | 20 | [`01_gestion-identidad-complejo.csv`](casos-de-prueba/01_gestion-identidad-complejo.csv) |
| FEAT-02 | Reservas y Disponibilidad | 11 | [`02_reservas-disponibilidad.csv`](casos-de-prueba/02_reservas-disponibilidad.csv) |
| FEAT-03 | Onboarding de Huéspedes | 21 | [`03_onboarding-huespedes.csv`](casos-de-prueba/03_onboarding-huespedes.csv) |
| FEAT-04 | Lancha Remis y Webhook | 13 | [`04_lancha-remis-webhook.csv`](casos-de-prueba/04_lancha-remis-webhook.csv) |
| FEAT-05 | Mini-Ecommerce de Adicionales | 19 | [`05_mini-ecommerce-adicionales.csv`](casos-de-prueba/05_mini-ecommerce-adicionales.csv) |
| FEAT-06 | Notificaciones por Email | 10 | [`06_notificaciones-email.csv`](casos-de-prueba/06_notificaciones-email.csv) |
| TRANSVERSAL | No funcionales y E2E | 11 | [`07_transversal-no-funcionales-e2e.csv`](casos-de-prueba/07_transversal-no-funcionales-e2e.csv) |
| EL | Equivalencia y límites | 134 valores | [`08_equivalencia-y-limites.csv`](casos-de-prueba/08_equivalencia-y-limites.csv) |

## Técnicas aplicadas

- **Partición de equivalencia:** clases válidas e inválidas por campo.
- **Valores límite:** por ejemplo logo de 1,99 / 2,00 / 2,01 MB; texto de 49 / 50 / 51 caracteres.
- **Pruebas negativas, de seguridad básica y de privacidad** (aislamiento entre complejos, XSS, HTTPS).
- **Mobile-first:** anchos de 320 a 414 px, Chrome Android y Safari iOS.
- **Flujos de extremo a extremo** (E2E) con uno y varios complejos.

## Convenciones

| Elemento | Formato |
|---|---|
| Caso de prueba | `TC-001`, `TC-002`… |
| Valor de equivalencia o límite | `EL-LOGO-PESO-04` |
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
