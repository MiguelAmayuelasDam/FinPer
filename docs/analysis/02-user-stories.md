# User stories y backlog priorizado (MoSCoW)

Formato: **Como** [rol] **quiero** [acción] **para** [beneficio].

Priorización MoSCoW:
- **Must** — imprescindible para un MVP defendible.
- **Should** — importante, sube claramente el valor y la nota.
- **Could** — deseable si sobra tiempo.
- **Won't (esta versión)** — fuera de alcance de la v1, documentado a propósito.

---

## Épica: Autenticación y cuenta

| ID    | Prioridad | Historia |
| ----- | --------- | -------- |
| US-01 | Must      | Como usuario nuevo quiero registrarme con email y contraseña para tener mi espacio privado. |
| US-02 | Must      | Como usuario quiero iniciar sesión de forma segura para acceder a mis datos. |
| US-03 | Must      | Como usuario quiero que mi contraseña se guarde cifrada para proteger mi cuenta. |
| US-04 | Should    | Como usuario quiero cerrar sesión y renovar mi sesión (refresh token) para seguridad y comodidad. |
| US-05 | Could     | Como usuario quiero recuperar mi contraseña por email si la olvido. |

## Épica: Gestión de movimientos

| ID    | Prioridad | Historia |
| ----- | --------- | -------- |
| US-06 | Must      | Como usuario quiero añadir un movimiento manual (entrada o salida) para registrar mi actividad. |
| US-07 | Must      | Como usuario quiero ver el histórico de movimientos ordenado de más reciente a más antiguo para consultarlo. |
| US-08 | Must      | Como usuario quiero asignar una categoría a cada movimiento para clasificar mi gasto. |
| US-09 | Must      | Como usuario quiero editar o borrar un movimiento para corregir errores. |
| US-10 | Should    | Como usuario quiero filtrar movimientos por fecha y categoría para analizarlos. |

## Épica: Importación e inteligencia

| ID    | Prioridad | Historia |
| ----- | --------- | -------- |
| US-11 | Must      | Como usuario quiero importar movimientos desde un CSV para no teclearlos a mano. |
| US-12 | Must      | Como usuario quiero previsualizar y confirmar lo importado antes de guardarlo para evitar errores. |
| US-13 | Should    | Como usuario quiero que los movimientos importados se clasifiquen automáticamente para ahorrar trabajo. |
| US-14 | Should    | Como usuario quiero corregir una clasificación y que el sistema lo recuerde para mejorar con el tiempo. |
| US-15 | Could     | Como usuario quiero importar también desde XLS para cubrir más bancos. |
| US-16 | Won't     | Como usuario quiero importar desde PDF de extracto bancario (alta complejidad, fuera de v1). |

## Épica: Presupuesto 50-30-20 y colchón

| ID    | Prioridad | Historia |
| ----- | --------- | -------- |
| US-17 | Must      | Como usuario quiero configurar mi ingreso mensual para calcular el reparto 50-30-20. |
| US-18 | Must      | Como usuario quiero ver cuánto he consumido de cada cubo (50/30/20) frente a su presupuesto. |
| US-19 | Should    | Como usuario quiero recibir una alerta cuando esté cerca de agotar un cubo para no pasarme. |
| US-20 | Should    | Como usuario quiero definir y seguir mi colchón de emergencia (3-6 meses) para tener liquidez. |

## Épica: Análisis y dashboard

| ID    | Prioridad | Historia |
| ----- | --------- | -------- |
| US-21 | Must      | Como usuario quiero ver mi ahorro o despilfarro del mes (ingresos vs. gastos) para tener control real. |
| US-22 | Must      | Como usuario quiero ver el gasto por categoría para entender en qué se va mi dinero. |
| US-23 | Should    | Como usuario quiero comparar meses para ver mi tendencia. |
| US-24 | Could     | Como usuario quiero exportar un resumen mensual. |

---

## Alcance de la v1 (resumen)

- **MVP (Must):** US-01,02,03,06,07,08,09,11,12,17,18,21,22.
- **Diferenciador (Should):** US-04,10,13,14,19,20,23.
- **Extra (Could):** US-05,15,24.
- **Fuera de v1 (Won't):** US-16 (PDF).

Criterio de decisión de alcance: *toda historia debe ayudar a demostrar alguna
de las seis áreas del temario (análisis, arquitectura, flujos con IA, calidad,
infraestructura, seguridad). Lo que no cumpla eso va al final del backlog.*
