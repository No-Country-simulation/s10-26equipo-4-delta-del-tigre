# Evidencias

Capturas, videos y documentos que respaldan los bugs y las pruebas ejecutadas.

## Respaldo en Issues

Todos los bugs del libro de pruebas fueron reportados por QA (Karol Trujillo) como **Issues de GitHub** con la plantilla *Reporte de bug (QA)*. El Issue es el registro oficial del bug: ahí quedan los pasos, el resultado esperado y el obtenido, la severidad, el estado y la evidencia. Los reportes de sprint (`reportes/`) y el libro de pruebas se apoyan en esos Issues.

| Dónde | Qué guarda | Cómo se vincula |
|---|---|---|
| Issue de GitHub | Descripción del bug, evidencia y seguimiento hasta el cierre | Lleva el caso `TC-xxx` y la tarjeta afectada |
| Libro de pruebas, hoja Bugs | Una fila por bug, con su Issue | La columna del Issue enlaza al reporte |
| Libro de pruebas, hoja Casos de Prueba | Resultado de cada caso | La columna Bugs apunta al `BUG-xxx` |
| `reportes/` | Resumen por sprint | La tabla de bugs cita los Issues |
| `evidencias/` (esta carpeta) | Archivos que deben conservarse | El nombre del archivo lleva el bug o el caso |

Bugs reportados hasta el 13/11/2026: 19 (16 resueltos, 3 abiertos: BUG-017, BUG-018 y BUG-019).

https://github.com/No-Country-simulation/s10-26equipo-4-delta-del-tigre/issues/59
https://github.com/No-Country-simulation/s10-26equipo-4-delta-del-tigre/issues/72
https://github.com/No-Country-simulation/s10-26equipo-4-delta-del-tigre/issues/75
https://github.com/No-Country-simulation/s10-26equipo-4-delta-del-tigre/issues/78
https://github.com/No-Country-simulation/s10-26equipo-4-delta-del-tigre/issues/86
https://github.com/No-Country-simulation/s10-26equipo-4-delta-del-tigre/issues/95
https://github.com/No-Country-simulation/s10-26equipo-4-delta-del-tigre/issues/105
https://github.com/No-Country-simulation/s10-26equipo-4-delta-del-tigre/issues/114

## Organización

```
evidencias/
└── sprint-1/
    ├── BUG-45_total-no-se-recalcula.png
    └── TC-075_cantidades-adicional.mp4
```

## Nombres

- Para un bug: `BUG-<número de issue>_descripcion-corta.png`
- Para un caso: `TC-<id>_descripcion-corta.png`
- Sin espacios ni tildes; usar guiones.

## Qué evidencia se guarda

- **Bugs:** captura o video del fallo, enlazados al Issue correspondiente.
- **API:** respuesta de Swagger (código y cuerpo) del caso probado.
- **Correos:** captura de Mailpit con el mensaje al dueño y el de confirmación al turista.
- **Webhook de lancha:** registro del envío y su estado (SENT, FAILED o PENDING).
- **Automatización:** reportes de Selenium + Behave y los libros de evidencia por historia de usuario (por ejemplo, US-01.1 y US-01.2). Aclarar si la corrida fue en modo Mock.

## Reglas

- Usar **datos ficticios**. Nunca subir datos personales, contraseñas ni claves.
- Preferir imágenes (`.png`, `.jpg`) y videos cortos (`.mp4`, `.gif`).
- Desde el navegador de GitHub el límite por archivo es de 25 MB; con Git, 100 MB. Mantenerlos por debajo de unos 10 MB.
- Para un bug, la evidencia también se arrastra al Issue; aquí se guarda lo que debe conservarse.
- Un caso solo se marca *Pasó* si hay evidencia o confirmación de quien lo ejecutó.
