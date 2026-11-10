# Hallazgos y dudas sobre los requisitos

Ambigüedades encontradas al revisar el Manual de Requisitos. Afectan el resultado esperado de varios casos de prueba y deben resolverse con el equipo.

**Cómo usar este registro:** cada hallazgo que bloquea trabajo de otro rol se abre como issue con la plantilla *Duda de requisito* y se enlaza en la última columna.

| ID | Ubicación | Observación | Impacto en las pruebas | Pregunta para el equipo | Estado | Issue |
|---|---|---|---|---|---|---|
| H-01 | US-02.1 | El orden dice 'cronológico por fecha de llegada (más reciente primero)', pero el objetivo es ver las 'próximas reservas'. | No se sabe si el orden esperado es ascendente o descendente. | ¿Se ordena por las próximas llegadas primero o por las más recientes? | Abierto | |
| H-02 | US-05.1 / US-05.2 | Se limita a 1 adicional por complejo, pero el turista puede elegir 'uno, varios o ninguno' y ajustar cantidades. El brief original habla de varios adicionales. | Cambian los casos de selección múltiple y de límite. | ¿El límite de 1 es solo del MVP? ¿'Varios' se refiere a cantidades del mismo adicional? | Abierto | |
| H-03 | US-06.1 | El botón del email dice 'Ver reserva en DeltaFlow', pero el producto se llama HostFlow. | Texto y marca inconsistentes en el email. | ¿El nombre correcto es HostFlow? | Abierto | |
| H-04 | US-06.2 | El email al turista no aparece en el brief original. Su objetivo menciona 'datos de pago', pero los criterios no incluyen Alias/CBU. | No se sabe si el email debe llevar los datos bancarios. | ¿El email al turista incluye Alias/CBU y el mensaje de transferencia? | Abierto | |
| H-05 | Varias | Faltan límites y formatos: máximo de huéspedes y pasajeros, precio máximo, largo del nombre, reglas de contraseña, formato de DNI, pasaporte y teléfono. | Los valores límite de EL quedan marcados como 'A definir'. | ¿Cuáles son los mínimos y máximos de cada campo? | Abierto | |
| H-06 | US-03.2 | Los emojis se rechazan en la ficha, pero no se define para el dashboard (nombre del complejo, adicionales). | Criterio distinto entre pantallas. | ¿Los emojis se rechazan también en el dashboard? | Abierto | |
| H-07 | US-05.1 | La moneda es 'USD/ARS' pero Alias/CBU son cuentas argentinas. No se dice quién elige la moneda ni dónde se muestra. | Formato de moneda y totales sin criterio único. | ¿La moneda se configura por complejo y se muestra en éxito y emails? | Abierto | |
| H-08 | US-01.3 | La baja definitiva no menciona confirmación ni qué pasa con reservas y fichas existentes. | Riesgo de pérdida de datos. | ¿Hay confirmación previa? ¿Qué pasa con los datos históricos? | Abierto | |
| H-09 | US-02.2 / US-03.2 | No está definida la relación entre ficha y reserva: ¿quién crea la reserva y quién cambia el estado a 'Onboarding completo'? | Afecta RES_LINK y el flujo de extremo a extremo. | ¿La ficha crea o actualiza una reserva existente? | Abierto | |
| H-10 | US-02.1 / US-03.2 | Las fechas de llegada y salida de la ficha y las de Check-in y Check-out de la reserva podrían duplicarse. | Posibles datos inconsistentes. | ¿Son el mismo dato? ¿Cuál prevalece si difieren? | Abierto | |
| H-11 | US-05.2 | El Alias/CBU se muestra en la pantalla de éxito, pero ninguna historia indica dónde ni cuándo lo carga el dueño. | Falta una historia o criterio para cargarlo y validarlo. | ¿Se carga en el branding (US-01.2) o en el adicional? | Abierto | |
| H-12 | US-03.3 / US-05.1 | Los límites de texto son distintos: 50 caracteres en el texto libre y 45 en la descripción del adicional. | Puede ser intencional o una inconsistencia. | ¿Los límites son correctos? | Abierto | |

## Prioridad sugerida para resolver

1. **H-11** · Dónde carga el dueño el Alias/CBU (bloquea la pantalla de éxito).
2. **H-09** · Relación entre ficha y reserva.
3. **H-02** · Límite de 1 adicional frente a selección múltiple.
4. **H-05** · Límites y formatos de campos sin definir.
5. **H-01** · Orden de la lista de reservas.
