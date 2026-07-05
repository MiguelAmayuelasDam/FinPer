# Requisitos

## Requisitos funcionales (RF)

| ID    | Requisito |
| ----- | --------- |
| RF-01 | El sistema permite registro e inicio de sesión con email y contraseña. |
| RF-02 | El sistema protege los endpoints mediante JWT. |
| RF-03 | El usuario puede crear, leer, editar y eliminar movimientos (entrada/salida). |
| RF-04 | Cada movimiento tiene importe, fecha, concepto y categoría. |
| RF-05 | El sistema muestra el histórico ordenado de más reciente a más antiguo. |
| RF-06 | El usuario puede importar movimientos desde un fichero CSV. |
| RF-07 | El sistema previsualiza la importación antes de persistirla. |
| RF-08 | El sistema clasifica automáticamente los movimientos (reglas + IA). |
| RF-09 | El sistema aprende de las correcciones de clasificación del usuario. |
| RF-10 | El usuario configura su ingreso mensual y el sistema calcula el reparto 50-30-20. |
| RF-11 | El dashboard muestra consumo real vs. presupuesto por cubo (50/30/20). |
| RF-12 | El sistema genera alertas al acercarse al límite de un cubo. |
| RF-13 | El sistema calcula ahorro/despilfarro mensual (ingresos vs. gastos). |
| RF-14 | El usuario define y hace seguimiento de su colchón de emergencia. |

## Requisitos no funcionales (RNF)

| ID     | Categoría        | Requisito |
| ------ | ---------------- | --------- |
| RNF-01 | Seguridad        | Contraseñas hasheadas con bcrypt/argon2. |
| RNF-02 | Seguridad        | Rate limiting en endpoints de autenticación. |
| RNF-03 | Seguridad        | Validación de toda entrada con Pydantic. |
| RNF-04 | Seguridad        | Secretos gestionados por variables de entorno, nunca en el repo. |
| RNF-05 | Seguridad        | Mitigación documentada del OWASP Top 10 aplicable. |
| RNF-06 | Precisión        | Los importes se manejan con tipo decimal, nunca float. |
| RNF-07 | Calidad          | Cobertura de tests ≥ 70% en la lógica de negocio. |
| RNF-08 | Calidad          | Código sin code smells graves; principios KISS. |
| RNF-09 | Mantenibilidad   | TDD en autenticación y lógica financiera. |
| RNF-10 | Infraestructura  | `docker-compose up` levanta todo el entorno local. |
| RNF-11 | CI/CD            | Pipeline que ejecuta lint, tests y escaneo de seguridad. |
| RNF-12 | Usabilidad       | Reducir al mínimo la fricción de introducir movimientos. |
| RNF-13 | Rendimiento IA   | La clasificación por IA se hace en lote, no movimiento a movimiento. |

## Restricciones

- Proyecto individual, dedicación parcial.
- Despliegue en tiers gratuitos (Vercel + Render).
- Sin frameworks de orquestación de IA (LangChain) en la v1: llamadas directas.

## Criterios de aceptación globales

- Cada requisito Must tiene al menos un test que lo cubre.
- La demo funciona de principio a fin con datos realistas.
- La documentación permite levantar el proyecto desde cero.
