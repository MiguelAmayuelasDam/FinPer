# ADR-0001: Elección del stack tecnológico

- **Estado:** Aceptado
- **Fecha:** 2026-07
- **Contexto:** Proyecto final de máster, individual, dedicación parcial, que
  debe demostrar análisis, arquitectura, flujos con IA, calidad, infraestructura
  y seguridad.

## Decisión

| Área          | Elección                                | Justificación breve |
| ------------- | --------------------------------------- | ------------------- |
| Frontend      | React + TypeScript + Vite               | Estándar de mercado, tipado, arranque rápido. |
| Estilos/UI    | Tailwind CSS + shadcn/ui                | No invertir tiempo en diseño desde cero; componentes accesibles listos. |
| Backend       | FastAPI (Python)                        | Swagger automático, tipado, rápido, sencillo; Python conecta con el ecosistema IA. |
| ORM           | SQLAlchemy 2.0                          | Estándar de facto en Python. |
| Migraciones   | Alembic                                 | Integración natural con SQLAlchemy. |
| Base de datos | PostgreSQL                              | Robusta, soporte nativo de `NUMERIC` y `uuid`. |
| Auth          | JWT (access + refresh)                  | Sin estado, encaja con SPA + API. |
| IA            | Llamada directa al modelo (OpenAI/Gemini)| Sin sobre-ingeniería; LangChain se descarta en v1. |
| Testing       | pytest · Vitest · Playwright            | Unitario back, unitario front, E2E. |
| Contenedores  | Docker + Docker Compose                 | Entorno reproducible con un comando. |
| CI/CD         | GitHub Actions                          | Integrado en el repositorio, gratis. |
| Despliegue    | Vercel (front) · Render (back + DB)     | Tiers gratuitos, despliegue sencillo. |

## Consecuencias

**Positivas**
- Stack coherente y moderno, todo alineado con el temario.
- Python en backend + IA reduce la fricción de integración.
- Swagger automático facilita documentar y probar la API.

**A vigilar**
- El tier gratuito de Render duerme el backend tras inactividad (arranque frío
  ~30–60 s). Mitigación: "despertar" el backend antes de la demo.
- Los importes deben manejarse con `Decimal` de extremo a extremo para no perder
  precisión (JSON como string decimal).
- La clasificación por IA debe hacerse en lote y con motor de reglas previo para
  controlar coste y latencia.

## Alternativas consideradas

- **Node/Express en backend:** descartado; Python integra mejor con la parte IA.
- **LangChain para la IA:** descartado en v1 por sobre-ingeniería; una llamada
  directa con salida JSON estructurada cubre la necesidad.
- **Importación de PDF:** pospuesta (Won't v1) por complejidad y fragilidad.
