# Plan de pruebas · HostFlow

## 1. Objetivo

Verificar que el MVP de HostFlow cumple los requisitos del Manual de Requisitos y Especificaciones del Sistema: dashboard del dueño, ficha de onboarding white-label para el turista, mini-ecommerce con pago por transferencia, trigger de lancha remis y notificaciones por email.

## 2. Alcance

**Dentro del alcance (MVP)**

- FEAT-01 Gestión e identidad del complejo
- FEAT-02 Reservas y disponibilidad (lista cronológica, no calendario)
- FEAT-03 Formulario de onboarding de huéspedes
- FEAT-04 Cotización de lancha remis y webhook/JSON
- FEAT-05 Mini-ecommerce de adicionales (sin tarjeta)
- FEAT-06 Notificaciones por email
- Requisitos no funcionales: mobile-first, seguridad básica, privacidad

**Fuera del alcance (no se prueba como requisito)**

- Motor de reservas tipo Booking/Airbnb
- Calendarios de disponibilidad en tiempo real (iCal / Channel Manager)
- Dominios personalizados por complejo
- Pasarelas de cobro con tarjeta (Stripe, Mercado Pago)
- Pruebas de seguridad especializadas (pentesting, inyección SQL/XSS con payloads, análisis de vulnerabilidades, pruebas de carga): no son parte de QA funcional; se recomienda coordinarlas con backend/DevOps

## 3. Enfoque de pruebas

| Tipo | Qué se verifica |
|---|---|
| Funcional | Cada historia de usuario y sus criterios de aceptación |
| Partición de equivalencia | Clases válidas e inválidas por campo |
| Valores límite | Mínimos y máximos definidos en el Manual |
| Negativas | Campos vacíos, formatos inválidos, accesos indebidos |
| Negativas de acceso y datos | Acceso sin sesión, botón Atrás tras cerrar sesión, ID cambiado en la URL, texto con símbolos, HTTPS visible |
| UI / Mobile-first | 320, 360, 375, 390 y 414 px; sin scroll horizontal; teclados correctos |
| Integración | Webhook, emails, ficha ↔ dashboard |
| Extremo a extremo | Flujos completos con uno y varios complejos |

## 4. Entorno

| Elemento | Detalle |
|---|---|
| Rama probada | `dev` (confirmar con el equipo cuándo hay un despliegue estable) |
| Navegadores | Chrome, Firefox, Safari y Edge (últimas versiones) |
| Móviles | Chrome en Android y Safari en iOS; emulación con DevTools como apoyo |
| Datos de prueba | Datos ficticios; no usar datos personales reales |

## 5. Criterios

**Entrada:** funcionalidad desplegada en el entorno de pruebas, criterios de aceptación definidos y casos de prueba revisados.

**Salida (Fase 1):**
- 100 % de los casos P1 de la Fase 1 ejecutados
- Sin bugs críticos ni altos abiertos
- Hallazgos que bloquean pruebas respondidos o documentados como riesgo

## 6. Priorización

- **P1:** crítico para el MVP. **P2:** importante. **P3:** deseable.
- **Fase 1:** lo prioritario para la primera entrega. **Fase 2:** validaciones secundarias y mejoras.
- Los casos con requisito **"Por definir"** se ejecutan al resolverse el hallazgo asociado; mientras tanto quedan en *Bloqueado*.

## 7. Entregables

- Casos de prueba por Feature (Markdown) y libro de pruebas en Google Sheets
- Reporte de pruebas por sprint
- Issues de bug con evidencia
- Registro de hallazgos y dudas de requisitos

## 8. Cronograma propuesto (ajustar con el equipo)

| Sprint | Foco de QA |
|---|---|
| Sprint 1 | Plan de pruebas, hallazgos del Manual, casos de la Fase 1, criterios de aceptación en las tarjetas |
| Sprint 2 | Ejecución de la Fase 1 sobre lo desarrollado, reporte de bugs |
| Sprint 3 | Re-pruebas, casos de la Fase 2, pruebas móviles reales |
| Sprint 4 | Regresión, flujos de extremo a extremo, reporte final |

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Requisitos ambiguos o "Por definir" | Registrar en `hallazgos.md` y abrir issue de duda |
| Webhook y módulo de lancha aún no existen | Probar el JSON generado y el estado "Pendiente de reenvío" |
| Pocos dispositivos móviles reales | Combinar emulación con al menos un Android y un iPhone |
| Cambios de alcance durante el sprint | Revisar el plan al inicio de cada sprint |
| Datos personales y alergias en las pruebas | Usar solo datos ficticios |
| Seguridad avanzada no cubierta por QA funcional | Solicitar revisión a backend/DevOps (validación en servidor, inyecciones, permisos por API) |
