# Sistema Integral de Administración de Riesgos y Cumplimiento (SIAR)
## Arquitectura General del Sistema

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Ámbito:** Empresa de Seguros Regulada en Venezuela

---

## 1. RESUMEN EJECUTIVO

El SIAR es un sistema web integral diseñado para gestionar el cumplimiento regulatorio y la administración de riesgos bajo un Enfoque Basado en Riesgo (EBR). El sistema proporciona alertas en tiempo real sin bloquear operaciones, manteniendo la decisión final en manos del Oficial de Cumplimiento.

### Características Clave
- ✅ 100% Web-based
- ✅ Arquitectura modular y escalable
- ✅ Parametrización sin código por usuarios funcionales
- ✅ Trazabilidad completa con auditoría
- ✅ Backend Java con intercambio JSON
- ✅ Preparado para inspección regulatoria

---

## 2. ARQUITECTURA POR CAPAS

### 2.1 Vista General de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                     │
│  (Frontend - React/Angular/Vue + TypeScript)                │
│  - Dashboard de Cumplimiento                                │
│  - Administrador de Parámetros                              │
│  - Visor de Expedientes                                     │
│  - Reportes y Alertas                                       │
└─────────────────────────────────────────────────────────────┘
                              ↕ JSON/REST
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE API GATEWAY                       │
│  (Spring Cloud Gateway / Kong)                              │
│  - Autenticación/Autorización (OAuth 2.0 + JWT)            │
│  - Rate Limiting                                            │
│  - Logging de Request/Response                              │
│  - Enrutamiento de Servicios                               │
└─────────────────────────────────────────────────────────────┘
                              ↕ JSON
┌─────────────────────────────────────────────────────────────┐
│                  CAPA DE SERVICIOS (Backend)                │
│              (Java 17+ / Spring Boot 3.x)                   │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │   Servicio   │   Servicio   │   Servicio   │            │
│  │   Gestión    │   Motor de   │   Gestión    │            │
│  │   Expedientes│   Riesgo     │   Parámetros │            │
│  └──────────────┴──────────────┴──────────────┘            │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │   Servicio   │   Servicio   │   Servicio   │            │
│  │   Auditoría  │   Alertas    │   Reportes   │            │
│  └──────────────┴──────────────┴──────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              ↕ JPA/JDBC
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PERSISTENCIA                     │
│  - PostgreSQL (Principal - Datos transaccionales)           │
│  - MongoDB (Opcional - Documentos y logs)                   │
│  - Redis (Caché de sesiones y parámetros)                   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE INFRAESTRUCTURA                   │
│  - Servidor de Aplicaciones (Tomcat Embebido)              │
│  - Servidor Web (Nginx - Proxy reverso)                     │
│  - Sistema de Logs (ELK Stack / Graylog)                    │
│  - Monitoreo (Prometheus + Grafana)                         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Descripción de Capas

#### 2.2.1 Capa de Presentación (Frontend)
- **Tecnología:** React 18+ con TypeScript
- **Framework UI:** Material-UI o Ant Design (para interfaces empresariales)
- **Estado:** Redux Toolkit o Zustand
- **Comunicación:** Axios con interceptores para manejo de tokens
- **Características:**
  - Interface responsiva para diversos dispositivos
  - Dashboard personalizable por rol
  - Formularios dinámicos basados en configuración
  - Visualizaciones de riesgo en tiempo real

#### 2.2.2 Capa de API Gateway
- **Tecnología:** Spring Cloud Gateway o Kong
- **Funciones:**
  - Punto único de entrada al sistema
  - Autenticación centralizada (OAuth 2.0 + JWT)
  - Registro de todas las peticiones para auditoría
  - Rate limiting por usuario/rol
  - CORS configurado para dominio aprobado

#### 2.2.3 Capa de Servicios (Backend Java)
- **Framework Base:** Spring Boot 3.x
- **Java Version:** Java 17 LTS o Java 21 LTS
- **Módulos Spring:**
  - Spring Web (REST Controllers)
  - Spring Security (Autenticación/Autorización)
  - Spring Data JPA (Persistencia)
  - Spring Validation (Validación de datos)
  - Spring AOP (Auditoría transversal)

#### 2.2.4 Capa de Persistencia
- **Base de Datos Principal:** PostgreSQL 15+
  - Datos transaccionales
  - Configuraciones de usuario
  - Expedientes y entidades
- **Caché:** Redis 7+
  - Sesiones de usuario
  - Parámetros de riesgo (alta frecuencia de lectura)
  - Resultados de evaluación temporal
- **Opcional - Documentos:** MongoDB
  - Documentos escaneados
  - Logs extensos de auditoría

---

## 3. MÓDULOS PRINCIPALES DEL SISTEMA

### 3.1 Módulo de Gestión de Expedientes

**Responsabilidad:** Administrar el ciclo de vida completo de expedientes de las entidades reguladas.

**Entidades Gestionadas:**
1. Clientes (Personas Naturales y Jurídicas)
2. Intermediarios (Corredores, Agentes)
3. Empleados
4. Proveedores
5. Reaseguradores
6. Retrocesionarios

**Funcionalidades Clave:**
- CRUD completo de expedientes
- Carga masiva de datos (Excel/CSV)
- Gestión documental (adjuntos)
- Historial de modificaciones
- Estados del expediente (Pendiente, En Revisión, Aprobado, Observado, etc.)

**Endpoints REST Ejemplo:**
```
POST   /api/v1/expedientes
GET    /api/v1/expedientes/{id}
PUT    /api/v1/expedientes/{id}
GET    /api/v1/expedientes/search
POST   /api/v1/expedientes/bulk-import
GET    /api/v1/expedientes/{id}/documentos
POST   /api/v1/expedientes/{id}/documentos
GET    /api/v1/expedientes/{id}/historial
```

### 3.2 Módulo Motor de Evaluación de Riesgo

**Responsabilidad:** Calcular el nivel de riesgo de cada expediente según criterios parametrizados.

**Componentes:**
1. **Motor de Reglas:** Evalúa condiciones configurables
2. **Calculadora de Scores:** Aplica ponderaciones y algoritmos
3. **Clasificador de Riesgo:** Asigna categorías (Bajo, Medio, Alto, Crítico)

**Proceso de Evaluación:**
```
1. Recibir solicitud de evaluación (expediente + contexto)
2. Obtener parámetros activos del caché/BD
3. Aplicar reglas de negocio configuradas
4. Calcular score ponderado
5. Clasificar nivel de riesgo
6. Generar alertas si aplica
7. Registrar resultado en auditoría
8. Retornar evaluación (JSON)
```

**Modelo de Datos de Evaluación:**
```json
{
  "evaluacionId": "uuid",
  "expedienteId": "uuid",
  "tipoEntidad": "CLIENTE",
  "fechaEvaluacion": "2024-12-14T10:30:00Z",
  "criteriosEvaluados": [
    {
      "criterioId": "CR001",
      "nombre": "País de Residencia",
      "valor": "Venezuela",
      "puntaje": 20,
      "ponderacion": 0.15,
      "puntajePonderado": 3.0
    }
  ],
  "scoreTotal": 67.5,
  "nivelRiesgo": "ALTO",
  "alertasGeneradas": ["ALT001", "ALT005"],
  "requiereRevision": true,
  "evaluadoPor": "SISTEMA",
  "revisadoPor": null
}
```

### 3.3 Módulo de Gestión de Parámetros

**Responsabilidad:** Permitir al Oficial de Cumplimiento configurar el comportamiento del motor de riesgo sin programación.

**Tipos de Parámetros:**

#### 3.3.1 Catálogos Maestros
- Países (con clasificación de riesgo)
- Actividades Económicas (con clasificación de riesgo)
- Tipos de Producto
- Motivos de Alerta
- Estados de Expediente

#### 3.3.2 Criterios de Evaluación
```json
{
  "criterioId": "CR001",
  "nombre": "País de Residencia",
  "descripcion": "Evaluación basada en riesgo del país",
  "tipoEntidad": ["CLIENTE", "PROVEEDOR"],
  "activo": true,
  "tipoDato": "CATALOGO",
  "catalogo": "PAISES",
  "ponderacion": 0.15,
  "formulaCalculo": "MAP_VALOR",
  "creadoPor": "usuario@empresa.com",
  "fechaCreacion": "2024-01-15",
  "version": 2
}
```

#### 3.3.3 Ponderaciones de Riesgo
- Tabla configurable: Criterio → Peso (%)
- Validación: Suma de pesos = 100%
- Versionado de cambios

#### 3.3.4 Umbrales de Riesgo
```json
{
  "tipoEntidad": "CLIENTE",
  "umbrales": [
    {"nivelRiesgo": "BAJO", "scoreMin": 0, "scoreMax": 30},
    {"nivelRiesgo": "MEDIO", "scoreMin": 31, "scoreMax": 60},
    {"nivelRiesgo": "ALTO", "scoreMin": 61, "scoreMax": 85},
    {"nivelRiesgo": "CRITICO", "scoreMin": 86, "scoreMax": 100}
  ],
  "vigenciaDesde": "2024-01-01",
  "aprobadoPor": "oficial.cumplimiento@empresa.com"
}
```

**Interfaz de Usuario:**
- Editor visual de criterios (drag & drop)
- Simulador de evaluaciones ("¿Qué pasa si...?")
- Validador de configuración
- Versionado con posibilidad de rollback

### 3.4 Módulo de Alertas y Notificaciones

**Responsabilidad:** Detectar, generar y notificar situaciones que requieren atención.

**Tipos de Alertas:**
1. **Alertas de Riesgo:** Expediente clasificado Alto/Crítico
2. **Alertas de Vencimiento:** Documentos próximos a vencer
3. **Alertas de Actualización:** Expedientes requieren actualización periódica
4. **Alertas Regulatorias:** Cambios en normativas
5. **Alertas de Sistema:** Fallos, excepciones técnicas

**Flujo de Alertas:**
```
Evento → Evaluación → Generación Alerta → Notificación → Registro → Seguimiento
```

**Canales de Notificación:**
- Dashboard del sistema (tiempo real vía WebSockets)
- Correo electrónico
- Panel de Notificaciones en app

**Estados de Alerta:**
- Pendiente
- En Revisión
- Resuelta
- Falso Positivo
- Escalada

### 3.5 Módulo de Auditoría y Trazabilidad

**Responsabilidad:** Registrar TODAS las acciones en el sistema para cumplimiento regulatorio.

**Eventos Auditados:**
1. **Accesos al Sistema:**
   - Login/Logout exitosos y fallidos
   - Cambios de contraseña
   - Bloqueos de cuenta

2. **Operaciones sobre Datos:**
   - Creación, modificación, eliminación de expedientes
   - Consultas realizadas (quién, cuándo, qué buscó)
   - Exportaciones de datos

3. **Cambios en Configuración:**
   - Modificación de parámetros
   - Cambio de ponderaciones
   - Activación/desactivación de criterios
   - Cambio de permisos

4. **Decisiones de Cumplimiento:**
   - Aprobación/rechazo de expedientes
   - Justificación de excepciones
   - Comentarios del Oficial de Cumplimiento

**Estructura del Log de Auditoría:**
```json
{
  "auditId": "uuid",
  "timestamp": "2024-12-14T10:30:45.123Z",
  "usuario": "oficial.cumplimiento@empresa.com",
  "rol": "OFICIAL_CUMPLIMIENTO",
  "accion": "MODIFICAR_EXPEDIENTE",
  "entidad": "Expediente",
  "entidadId": "EXP-2024-00123",
  "datosAnteriores": {"estado": "EN_REVISION", "nivelRiesgo": "MEDIO"},
  "datosNuevos": {"estado": "APROBADO", "nivelRiesgo": "MEDIO"},
  "justificacion": "Documentación completa verificada",
  "ipAddress": "192.168.1.45",
  "userAgent": "Mozilla/5.0...",
  "resultado": "EXITOSO"
}
```

**Características:**
- Logs inmutables (append-only)
- Indexación por usuario, fecha, entidad
- Retención configurable (mínimo 5 años regulatorio)
- Exportación para auditorías externas

### 3.6 Módulo de Reportes y Análisis

**Responsabilidad:** Generar reportes regulatorios y análisis de gestión.

**Tipos de Reportes:**

#### 3.6.1 Reportes Regulatorios
- Reporte de operaciones inusuales
- Reporte de clientes de alto riesgo
- Estadísticas de cumplimiento
- Reporte de debida diligencia

#### 3.6.2 Reportes Gerenciales
- Dashboard ejecutivo
- Distribución de riesgo por cartera
- Tendencias de alertas
- Eficiencia de proceso de cumplimiento

**Formatos de Exportación:**
- PDF (con firma digital para regulador)
- Excel (análisis detallado)
- CSV (integración con otros sistemas)
- JSON (APIs)

**Motor de Reportes:**
- JasperReports o Apache POI
- Generación asíncrona para reportes pesados
- Cola de trabajos (Spring Batch)
- Notificación cuando reporte esté listo

### 3.7 Módulo de Seguridad y Control de Acceso

**Responsabilidad:** Garantizar acceso seguro y segregación de funciones.

**Roles del Sistema:**

1. **Super Administrador:**
   - Gestión de usuarios
   - Configuración del sistema
   - Acceso a todos los módulos

2. **Oficial de Cumplimiento:**
   - Parametrización de criterios
   - Aprobación final de expedientes
   - Generación de reportes regulatorios
   - Gestión de alertas críticas

3. **Analista de Cumplimiento:**
   - Evaluación de expedientes
   - Consulta de alertas
   - Actualización de documentación
   - Reportes operativos

4. **Usuario Operativo:**
   - Creación de expedientes
   - Carga de documentos
   - Consulta de estado
   - Sin acceso a parametrización

5. **Auditor (Solo Lectura):**
   - Consulta de logs
   - Consulta de expedientes
   - Generación de reportes
   - Sin capacidad de modificación

**Matriz de Permisos:**
```
Módulo/Función              | Super | Oficial | Analista | Operativo | Auditor
----------------------------|-------|---------|----------|-----------|--------
Crear Expediente            |   ✓   |    ✓    |    ✓     |     ✓     |    ✗
Aprobar Expediente          |   ✓   |    ✓    |    ✗     |     ✗     |    ✗
Modificar Parámetros        |   ✓   |    ✓    |    ✗     |     ✗     |    ✗
Ver Logs de Auditoría       |   ✓   |    ✓    |    ✓     |     ✗     |    ✓
Gestión de Usuarios         |   ✓   |    ✗    |    ✗     |     ✗     |    ✗
Generar Reporte Regulatorio |   ✓   |    ✓    |    ✗     |     ✗     |    ✗
```

**Implementación Técnica:**
- Spring Security con RBAC (Role-Based Access Control)
- JWT para autenticación stateless
- Refresh tokens para sesiones largas
- 2FA opcional para Oficial de Cumplimiento
- Políticas de contraseña configurables

---

## 4. ESCALABILIDAD

### 4.1 Estrategias de Escalabilidad

#### 4.1.1 Escalabilidad Horizontal
```
                    Load Balancer (Nginx)
                            |
        ┌───────────────────┼───────────────────┐
        |                   |                   |
    Instancia 1        Instancia 2        Instancia 3
    (Spring Boot)      (Spring Boot)      (Spring Boot)
        |                   |                   |
        └───────────────────┼───────────────────┘
                            |
                    Base de Datos PostgreSQL
                    (Con réplicas de lectura)
```

**Características:**
- Aplicaciones stateless (estado en Redis/DB)
- Sesiones compartidas en Redis Cluster
- Balanceo de carga round-robin o least-connections
- Auto-scaling basado en CPU/memoria

#### 4.1.2 Escalabilidad Vertical (Fase Inicial)
- Servidor robusto: 16-32 GB RAM, 8+ cores
- Base de datos: 32-64 GB RAM, SSDs
- Suficiente para 100-500 usuarios concurrentes

#### 4.1.3 Optimización de Base de Datos
- **Índices:** Sobre columnas frecuentemente consultadas
- **Particionamiento:** Tablas de auditoría por año/trimestre
- **Vistas Materializadas:** Para reportes complejos
- **Réplicas de Lectura:** Separar lecturas de escrituras

#### 4.1.4 Caché Multi-Nivel
```
Cliente → Cache Browser → Redis (Cache App) → PostgreSQL
```

- **Browser Cache:** Recursos estáticos (JS, CSS, imágenes)
- **Redis Cache:** 
  - Parámetros de riesgo (TTL: 1 hora)
  - Catálogos maestros (TTL: 24 horas)
  - Sesiones de usuario
- **Query Cache:** Consultas frecuentes

#### 4.1.5 Procesamiento Asíncrono
- **Colas de Mensajería:** RabbitMQ o Apache Kafka
- **Tareas Asíncronas:**
  - Evaluación masiva de expedientes
  - Generación de reportes pesados
  - Envío de notificaciones
  - Importación de datos masivos

```java
// Ejemplo de procesamiento asíncrono
@Service
public class EvaluacionService {
    
    @Async
    public CompletableFuture<EvaluacionResult> evaluarExpedienteAsync(String expedienteId) {
        // Evaluación en background
        EvaluacionResult resultado = motorRiesgo.evaluar(expedienteId);
        notificacionService.enviarSiNecesario(resultado);
        return CompletableFuture.completedFuture(resultado);
    }
}
```

### 4.2 Métricas de Escalabilidad

**KPIs de Monitoreo:**
- Tiempo de respuesta API (objetivo: <500ms p95)
- Throughput (transacciones por segundo)
- Utilización de CPU/memoria
- Conexiones de BD activas
- Tamaño de cola de mensajes
- Tasa de aciertos de caché

---

## 5. PARAMETRIZACIÓN POR USUARIO FUNCIONAL

### 5.1 Filosofía de Diseño

**Principio:** "Configuración sobre Programación"

El sistema debe permitir que el Oficial de Cumplimiento ajuste el comportamiento del motor de riesgo sin escribir código ni depender de un programador.

### 5.2 Mecanismos de Parametrización

#### 5.2.1 Motor de Reglas Basado en Configuración

**Estructura de Regla:**
```json
{
  "reglaId": "REG-001",
  "nombre": "Cliente de País de Alto Riesgo",
  "descripcion": "Genera alerta si cliente reside en país de alto riesgo",
  "tipoEntidad": "CLIENTE",
  "activa": true,
  "condiciones": [
    {
      "campo": "paisResidencia",
      "operador": "EN_LISTA",
      "valores": ["PAÍS-001", "PAÍS-045", "PAÍS-078"],
      "etiqueta": "Países de Alto Riesgo GAFI"
    }
  ],
  "operadorLogico": "Y",
  "accion": {
    "tipo": "GENERAR_ALERTA",
    "severidad": "ALTA",
    "mensaje": "Cliente reside en país de alto riesgo según GAFI"
  },
  "puntajeAsignado": 25,
  "requiereRevisionManual": true
}
```

**Operadores Disponibles:**
- Comparación: IGUAL, DIFERENTE, MAYOR_QUE, MENOR_QUE
- Pertenencia: EN_LISTA, NO_EN_LISTA
- Texto: CONTIENE, INICIA_CON, TERMINA_CON
- Lógicos: Y, O, NO
- Temporales: MAYOR_A_DIAS, MENOR_A_DIAS

#### 5.2.2 Editor Visual de Reglas

**Interfaz de Usuario (Concepto):**
```
┌────────────────────────────────────────────────────────┐
│  Crear/Editar Regla de Evaluación                      │
├────────────────────────────────────────────────────────┤
│  Nombre: [Cliente de País de Alto Riesgo           ]  │
│  Aplica a: [☑ Cliente  ☐ Intermediario  ☐ Empleado ]  │
│                                                        │
│  Condiciones:                                          │
│  ┌──────────────────────────────────────────────┐    │
│  │ Si [País Residencia ▼] [está en lista ▼]    │    │
│  │    [País 1, País 2, País 3... ▼]            │    │
│  │ [+ Agregar Condición]                        │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  Entonces:                                             │
│  ┌──────────────────────────────────────────────┐    │
│  │ Acción: [Generar Alerta ▼]                  │    │
│  │ Severidad: [Alta ▼]                          │    │
│  │ Puntaje: [25]                                │    │
│  │ ☑ Requiere revisión manual                  │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  [Probar Regla]  [Guardar]  [Cancelar]                │
└────────────────────────────────────────────────────────┘
```

#### 5.2.3 Gestión de Catálogos

**CRUD Completo de Catálogos:**
- Países con nivel de riesgo (Bajo/Medio/Alto)
- Actividades económicas con nivel de riesgo
- Tipos de documento de identidad
- Motivos de alerta
- Estados de expediente

**Ejemplo: Catálogo de Países**
```
┌────────────────────────────────────────────────────────┐
│  Gestión de Catálogo: Países                          │
├────────────────────────────────────────────────────────┤
│  [+ Agregar País]  [⬇ Importar]  [⬆ Exportar]        │
│                                                        │
│  Buscar: [________________] 🔍                        │
│                                                        │
│  País           | Código | Nivel Riesgo | Acciones    │
│  ─────────────────────────────────────────────────    │
│  Venezuela      | VE     | Medio        | ✏️ 🗑️      │
│  Estados Unidos | US     | Bajo         | ✏️ 🗑️      │
│  Irán           | IR     | Alto         | ✏️ 🗑️      │
│  ...                                                   │
└────────────────────────────────────────────────────────┘
```

#### 5.2.4 Configuración de Ponderaciones

**Interface de Ponderación:**
```
┌────────────────────────────────────────────────────────┐
│  Ponderaciones de Criterios - Evaluación de Cliente   │
├────────────────────────────────────────────────────────┤
│  Criterio                    | Peso %  | [═══════]    │
│  ──────────────────────────────────────────────────    │
│  País de Residencia          | 15%     | [███░░░░]    │
│  Actividad Económica         | 20%     | [████░░░]    │
│  Monto de Prima Anual        | 10%     | [██░░░░░]    │
│  Historial de Reclamos       | 15%     | [███░░░░]    │
│  Origen de Fondos            | 25%     | [█████░░]    │
│  Persona Políticamente Exp.  | 15%     | [███░░░░]    │
│  ──────────────────────────────────────────────────    │
│  TOTAL:                      | 100% ✓                 │
│                                                        │
│  [Restablecer]  [Simular]  [Guardar Cambios]         │
└────────────────────────────────────────────────────────┘
```

**Validaciones Automáticas:**
- La suma de ponderaciones debe ser 100%
- No se permite guardar con validación fallida
- Advertencia si algún criterio tiene 0%

#### 5.2.5 Simulador de Evaluaciones

**Herramienta "¿Qué pasa si...?":**
```
┌────────────────────────────────────────────────────────┐
│  Simulador de Evaluación de Riesgo                    │
├────────────────────────────────────────────────────────┤
│  Tipo Entidad: [Cliente ▼]                            │
│                                                        │
│  Valores de Prueba:                                    │
│  País: [Venezuela ▼]                                   │
│  Actividad: [Construcción ▼]                           │
│  Prima Anual: [100,000 USD]                            │
│  PEP: [☑ Sí]                                          │
│  ...                                                   │
│                                                        │
│  [▶ Ejecutar Simulación]                              │
│                                                        │
│  Resultado:                                            │
│  ┌──────────────────────────────────────────────┐    │
│  │ Score Total: 72.5                            │    │
│  │ Nivel de Riesgo: ALTO 🔴                     │    │
│  │                                              │    │
│  │ Desglose:                                    │    │
│  │ • País: 15 pts (peso 15%)                    │    │
│  │ • Actividad: 18 pts (peso 20%)               │    │
│  │ • PEP: 15 pts (peso 15%)                     │    │
│  │ ...                                          │    │
│  │                                              │    │
│  │ Alertas generadas: 2                         │    │
│  │ • Cliente es PEP                             │    │
│  │ • Actividad de riesgo medio-alto             │    │
│  └──────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

### 5.3 Versionado de Configuración

**Sistema de Versiones:**
- Cada cambio en parámetros crea una nueva versión
- Historial completo de cambios con usuario y fecha
- Capacidad de rollback a versión anterior
- Comparación visual entre versiones

```json
{
  "versionId": "v2024.12.001",
  "descripcion": "Ajuste de ponderación para PEP",
  "fechaCreacion": "2024-12-14T15:30:00Z",
  "creadoPor": "oficial.cumplimiento@empresa.com",
  "aprobadoPor": "gerente.cumplimiento@empresa.com",
  "vigenciaDesde": "2025-01-01",
  "cambios": [
    {
      "tipo": "MODIFICACION",
      "entidad": "Ponderación",
      "campo": "peso_pep",
      "valorAnterior": "10%",
      "valorNuevo": "15%",
      "justificacion": "Nueva directriz regulatoria"
    }
  ]
}
```

---

## 6. TRAZABILIDAD Y AUDITORÍA

### 6.1 Principios de Auditoría

1. **Completitud:** Registrar TODAS las operaciones relevantes
2. **Inmutabilidad:** Los logs no pueden ser modificados ni eliminados
3. **Integridad:** Hash criptográfico para detectar alteraciones
4. **Disponibilidad:** Acceso rápido para auditorías regulatorias
5. **Retención:** Mínimo 5 años (configurable por regulación)

### 6.2 Niveles de Auditoría

#### 6.2.1 Auditoría de Acceso
```sql
CREATE TABLE auditoria_acceso (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    accion VARCHAR(50) NOT NULL, -- LOGIN, LOGOUT, LOGIN_FALLIDO
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    resultado VARCHAR(20) NOT NULL, -- EXITOSO, FALLIDO
    motivo_fallo VARCHAR(200),
    sesion_id UUID
);
```

#### 6.2.2 Auditoría de Datos
```sql
CREATE TABLE auditoria_datos (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    accion VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE, SELECT
    tabla VARCHAR(100) NOT NULL,
    registro_id VARCHAR(100),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    justificacion TEXT,
    ip_address VARCHAR(45)
);
```

#### 6.2.3 Auditoría de Decisiones
```sql
CREATE TABLE auditoria_decisiones (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    oficial_cumplimiento VARCHAR(100) NOT NULL,
    tipo_decision VARCHAR(50) NOT NULL,
    expediente_id UUID NOT NULL,
    decision VARCHAR(50) NOT NULL, -- APROBADO, RECHAZADO, REQUIERE_INFO
    justificacion TEXT NOT NULL,
    nivel_riesgo_calculado VARCHAR(20),
    excepciones_aplicadas JSONB,
    documentos_adjuntos JSONB
);
```

### 6.3 Implementación Técnica de Auditoría

#### 6.3.1 Auditoría Automática con Spring AOP

```java
@Aspect
@Component
public class AuditAspect {
    
    @Autowired
    private AuditoriaService auditoriaService;
    
    @Autowired
    private HttpServletRequest request;
    
    @Around("@annotation(auditable)")
    public Object auditarMetodo(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String usuario = SecurityContextHolder.getContext().getAuthentication().getName();
        String accion = auditable.accion();
        
        // Capturar datos antes
        Object[] args = joinPoint.getArgs();
        
        Object resultado = null;
        try {
            resultado = joinPoint.proceed();
            
            // Registrar auditoría exitosa
            auditoriaService.registrar(
                usuario,
                accion,
                args,
                resultado,
                "EXITOSO",
                request.getRemoteAddr()
            );
            
            return resultado;
        } catch (Exception e) {
            // Registrar auditoría de error
            auditoriaService.registrar(
                usuario,
                accion,
                args,
                null,
                "ERROR: " + e.getMessage(),
                request.getRemoteAddr()
            );
            throw e;
        }
    }
}

// Uso en servicios:
@Service
public class ExpedienteService {
    
    @Auditable(accion = "APROBAR_EXPEDIENTE")
    public void aprobarExpediente(String expedienteId, String justificacion) {
        // Lógica de aprobación
    }
}
```

#### 6.3.2 Trigger de Base de Datos para Auditoría

```sql
-- Función de auditoría genérica
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_datos (
            timestamp, usuario, accion, tabla, registro_id, 
            datos_anteriores, datos_nuevos
        ) VALUES (
            NOW(),
            current_setting('app.current_user'),
            'UPDATE',
            TG_TABLE_NAME,
            OLD.id::TEXT,
            row_to_json(OLD),
            row_to_json(NEW)
        );
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_datos (
            timestamp, usuario, accion, tabla, registro_id, 
            datos_anteriores
        ) VALUES (
            NOW(),
            current_setting('app.current_user'),
            'DELETE',
            TG_TABLE_NAME,
            OLD.id::TEXT,
            row_to_json(OLD)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas críticas
CREATE TRIGGER expediente_audit
AFTER UPDATE OR DELETE ON expedientes
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### 6.4 Reportes de Auditoría

**Consultas Frecuentes:**
1. ¿Quién modificó este expediente?
2. ¿Qué cambios se hicieron en los últimos 30 días?
3. ¿Qué usuarios accedieron a expedientes de alto riesgo?
4. ¿Cuántas aprobaciones realizó cada Oficial de Cumplimiento?
5. ¿Hay accesos fuera del horario laboral?

**Herramienta de Búsqueda de Auditoría:**
```
┌────────────────────────────────────────────────────────┐
│  Consultar Logs de Auditoría                          │
├────────────────────────────────────────────────────────┤
│  Filtros:                                              │
│  Usuario: [________________]                           │
│  Acción: [Todas ▼]                                     │
│  Fecha Desde: [01/12/2024] Hasta: [14/12/2024]       │
│  Entidad: [Expediente ▼]                              │
│  ID Registro: [________________]                       │
│                                                        │
│  [🔍 Buscar]  [⬇ Exportar]  [🔄 Limpiar]            │
│                                                        │
│  Resultados (237 registros):                          │
│  ┌──────────────────────────────────────────────┐    │
│  │ Fecha/Hora         | Usuario    | Acción    │    │
│  │ ─────────────────────────────────────────────│    │
│  │ 14/12 10:30:45    | jperez     | MODIFICAR │    │
│  │ 14/12 09:15:22    | mgarcia    | CONSULTAR │    │
│  │ 13/12 16:45:10    | oficial.c  | APROBAR   │    │
│  └──────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

---

## 7. ESTRUCTURA DEL PROYECTO

### 7.1 Organización del Backend (Java)

```
siar-backend/
│
├── src/main/java/com/empresa/siar/
│   ├── SiarApplication.java                    # Clase principal Spring Boot
│   │
│   ├── config/                                 # Configuraciones
│   │   ├── SecurityConfig.java                # Configuración de seguridad
│   │   ├── CorsConfig.java                    # Configuración CORS
│   │   ├── JacksonConfig.java                 # Serialización JSON
│   │   ├── CacheConfig.java                   # Configuración Redis
│   │   └── AsyncConfig.java                   # Procesamiento asíncrono
│   │
│   ├── domain/                                # Entidades de dominio
│   │   ├── expediente/
│   │   │   ├── Expediente.java
│   │   │   ├── Cliente.java
│   │   │   ├── Intermediario.java
│   │   │   └── TipoExpediente.java (enum)
│   │   ├── evaluacion/
│   │   │   ├── Evaluacion.java
│   │   │   ├── CriterioEvaluacion.java
│   │   │   ├── NivelRiesgo.java (enum)
│   │   │   └── ResultadoEvaluacion.java
│   │   ├── parametro/
│   │   │   ├── Regla.java
│   │   │   ├── Ponderacion.java
│   │   │   ├── Catalogo.java
│   │   │   └── Umbral.java
│   │   ├── alerta/
│   │   │   ├── Alerta.java
│   │   │   ├── TipoAlerta.java (enum)
│   │   │   └── EstadoAlerta.java (enum)
│   │   ├── auditoria/
│   │   │   ├── AuditoriaAcceso.java
│   │   │   ├── AuditoriaDatos.java
│   │   │   └── AuditoriaDecision.java
│   │   └── usuario/
│   │       ├── Usuario.java
│   │       ├── Rol.java (enum)
│   │       └── Permiso.java
│   │
│   ├── repository/                            # Acceso a datos (JPA)
│   │   ├── ExpedienteRepository.java
│   │   ├── EvaluacionRepository.java
│   │   ├── ParametroRepository.java
│   │   ├── AlertaRepository.java
│   │   ├── AuditoriaRepository.java
│   │   └── UsuarioRepository.java
│   │
│   ├── service/                               # Lógica de negocio
│   │   ├── expediente/
│   │   │   ├── ExpedienteService.java
│   │   │   ├── ExpedienteServiceImpl.java
│   │   │   └── DocumentoService.java
│   │   ├── evaluacion/
│   │   │   ├── MotorRiesgoService.java       # CORE del sistema
│   │   │   ├── CalculadoraScoreService.java
│   │   │   └── ClasificadorRiesgoService.java
│   │   ├── parametro/
│   │   │   ├── ParametroService.java
│   │   │   ├── ReglaService.java
│   │   │   ├── CatalogoService.java
│   │   │   └── SimuladorService.java         # Simulación "Qué pasa si"
│   │   ├── alerta/
│   │   │   ├── AlertaService.java
│   │   │   ├── NotificacionService.java
│   │   │   └── EscalamientoService.java
│   │   ├── auditoria/
│   │   │   ├── AuditoriaService.java
│   │   │   └── TrazabilidadService.java
│   │   ├── reporte/
│   │   │   ├── ReporteService.java
│   │   │   ├── GeneradorPDFService.java
│   │   │   └── GeneradorExcelService.java
│   │   └── seguridad/
│   │       ├── AutenticacionService.java
│   │       ├── AutorizacionService.java
│   │       └── TokenService.java
│   │
│   ├── controller/                            # REST Controllers
│   │   ├── ExpedienteController.java          # /api/v1/expedientes
│   │   ├── EvaluacionController.java          # /api/v1/evaluaciones
│   │   ├── ParametroController.java           # /api/v1/parametros
│   │   ├── AlertaController.java              # /api/v1/alertas
│   │   ├── AuditoriaController.java           # /api/v1/auditoria
│   │   ├── ReporteController.java             # /api/v1/reportes
│   │   └── UsuarioController.java             # /api/v1/usuarios
│   │
│   ├── dto/                                   # Data Transfer Objects
│   │   ├── request/
│   │   │   ├── CrearExpedienteRequest.java
│   │   │   ├── EvaluarExpedienteRequest.java
│   │   │   └── CrearReglaRequest.java
│   │   └── response/
│   │       ├── ExpedienteResponse.java
│   │       ├── EvaluacionResponse.java
│   │       └── AlertaResponse.java
│   │
│   ├── exception/                             # Manejo de excepciones
│   │   ├── GlobalExceptionHandler.java
│   │   ├── RecursoNoEncontradoException.java
│   │   ├── ValidacionException.java
│   │   └── AutorizacionException.java
│   │
│   ├── security/                              # Seguridad
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── JwtTokenProvider.java
│   │   ├── UserDetailsServiceImpl.java
│   │   └── AuditAspect.java                  # Auditoría con AOP
│   │
│   ├── validation/                            # Validadores personalizados
│   │   ├── ValidadorExpediente.java
│   │   ├── ValidadorRegla.java
│   │   └── ValidadorPonderacion.java
│   │
│   └── util/                                  # Utilidades
│       ├── JsonUtil.java
│       ├── DateUtil.java
│       ├── EncriptacionUtil.java
│       └── CalculadoraUtil.java
│
├── src/main/resources/
│   ├── application.yml                        # Configuración principal
│   ├── application-dev.yml                    # Configuración desarrollo
│   ├── application-prod.yml                   # Configuración producción
│   ├── db/migration/                          # Scripts Flyway/Liquibase
│   │   ├── V1__crear_tablas_base.sql
│   │   ├── V2__crear_tablas_auditoria.sql
│   │   └── V3__datos_iniciales.sql
│   └── templates/                             # Plantillas de reportes
│       ├── reporte_regulatorio.jrxml
│       └── reporte_expediente.jrxml
│
├── src/test/java/                             # Tests
│   ├── integration/                           # Tests de integración
│   ├── unit/                                  # Tests unitarios
│   └── e2e/                                   # Tests end-to-end
│
├── pom.xml                                    # Dependencias Maven
└── README.md
```

### 7.2 Organización del Frontend

```
siar-frontend/
│
├── public/
│   ├── index.html
│   └── assets/
│       ├── images/
│       └── icons/
│
├── src/
│   ├── App.tsx                                # Componente raíz
│   ├── index.tsx                              # Punto de entrada
│   │
│   ├── components/                            # Componentes reutilizables
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   └── Alert/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── expediente/
│   │   │   ├── ExpedienteCard.tsx
│   │   │   ├── ExpedienteForm.tsx
│   │   │   ├── ExpedienteList.tsx
│   │   │   └── DocumentoUpload.tsx
│   │   ├── evaluacion/
│   │   │   ├── RiesgoMeter.tsx              # Medidor de riesgo
│   │   │   ├── EvaluacionDetalle.tsx
│   │   │   └── HistorialEvaluacion.tsx
│   │   ├── parametro/
│   │   │   ├── EditorReglas.tsx             # Editor visual de reglas
│   │   │   ├── GestorPonderaciones.tsx
│   │   │   ├── GestorCatalogos.tsx
│   │   │   └── Simulador.tsx
│   │   ├── alerta/
│   │   │   ├── AlertaCard.tsx
│   │   │   ├── ListaAlertas.tsx
│   │   │   └── NotificacionBadge.tsx
│   │   └── reporte/
│   │       ├── GeneradorReporte.tsx
│   │       └── VisualizadorReporte.tsx
│   │
│   ├── pages/                                 # Páginas principales
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── Expedientes/
│   │   │   ├── ListaExpedientesPage.tsx
│   │   │   ├── DetalleExpedientePage.tsx
│   │   │   └── CrearExpedientePage.tsx
│   │   ├── Evaluacion/
│   │   │   └── EvaluacionPage.tsx
│   │   ├── Parametros/
│   │   │   ├── ParametrosPage.tsx
│   │   │   └── SimuladorPage.tsx
│   │   ├── Alertas/
│   │   │   └── AlertasPage.tsx
│   │   ├── Reportes/
│   │   │   └── ReportesPage.tsx
│   │   ├── Auditoria/
│   │   │   └── AuditoriaPage.tsx
│   │   ├── Usuarios/
│   │   │   └── UsuariosPage.tsx
│   │   └── Auth/
│   │       ├── LoginPage.tsx
│   │       └── RecuperarPasswordPage.tsx
│   │
│   ├── services/                              # Servicios API
│   │   ├── api.ts                            # Cliente Axios configurado
│   │   ├── expedienteService.ts
│   │   ├── evaluacionService.ts
│   │   ├── parametroService.ts
│   │   ├── alertaService.ts
│   │   ├── auditoriaService.ts
│   │   ├── reporteService.ts
│   │   └── authService.ts
│   │
│   ├── store/                                 # Estado global (Redux)
│   │   ├── store.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── expedienteSlice.ts
│   │   │   ├── alertaSlice.ts
│   │   │   └── parametroSlice.ts
│   │   └── hooks.ts                          # Hooks tipados de Redux
│   │
│   ├── hooks/                                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useExpediente.ts
│   │   ├── useAlerta.ts
│   │   └── useDebounce.ts
│   │
│   ├── types/                                 # TypeScript types
│   │   ├── expediente.types.ts
│   │   ├── evaluacion.types.ts
│   │   ├── parametro.types.ts
│   │   ├── alerta.types.ts
│   │   └── usuario.types.ts
│   │
│   ├── utils/                                 # Utilidades
│   │   ├── formatters.ts                     # Formateo de fechas, números
│   │   ├── validators.ts                     # Validadores
│   │   ├── constants.ts                      # Constantes
│   │   └── helpers.ts                        # Funciones auxiliares
│   │
│   ├── styles/                                # Estilos globales
│   │   ├── globals.css
│   │   ├── theme.ts                          # Tema Material-UI
│   │   └── variables.css
│   │
│   └── routes/                                # Configuración de rutas
│       ├── AppRoutes.tsx
│       ├── PrivateRoute.tsx
│       └── RoleRoute.tsx
│
├── package.json
├── tsconfig.json
├── .env.development
├── .env.production
└── README.md
```

### 7.3 Scripts SQL de Inicialización

```
database/
│
├── migrations/
│   ├── V1__crear_esquema_base.sql
│   ├── V2__crear_tablas_dominio.sql
│   ├── V3__crear_tablas_auditoria.sql
│   ├── V4__crear_indices.sql
│   ├── V5__crear_funciones_triggers.sql
│   └── V6__datos_iniciales.sql
│
├── seeds/
│   ├── 01_usuarios_roles.sql
│   ├── 02_catalogos_paises.sql
│   ├── 03_catalogos_actividades.sql
│   ├── 04_parametros_iniciales.sql
│   └── 05_reglas_base.sql
│
└── queries/
    ├── consultas_frecuentes.sql
    ├── reportes_regulatorios.sql
    └── mantenimiento.sql
```

---

## 8. MODELO DE DATOS PRINCIPAL

### 8.1 Diagrama Entidad-Relación (Simplificado)

```
┌─────────────────┐
│    USUARIO      │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password_hash   │
│ rol             │
│ activo          │
└────────┬────────┘
         │
         │ crea/modifica
         │
┌────────▼────────┐         ┌──────────────────┐
│   EXPEDIENTE    │────────>│  TIPO_ENTIDAD    │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ CLIENTE          │
│ tipo_entidad    │         │ INTERMEDIARIO    │
│ numero          │         │ EMPLEADO         │
│ nombre          │         │ PROVEEDOR        │
│ estado          │         │ REASEGURADOR     │
│ nivel_riesgo    │         └──────────────────┘
│ fecha_creacion  │
│ creado_por (FK) │
└────────┬────────┘
         │
         │ genera
         │
┌────────▼────────┐         ┌──────────────────┐
│   EVALUACION    │────────>│   CRITERIO       │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ expediente (FK) │         │ nombre           │
│ fecha           │         │ descripcion      │
│ score_total     │         │ ponderacion      │
│ nivel_riesgo    │         │ activo           │
│ evaluado_por    │         │ version          │
└────────┬────────┘         └──────────────────┘
         │
         │ puede generar
         │
┌────────▼────────┐
│     ALERTA      │
├─────────────────┤
│ id (PK)         │
│ expediente (FK) │
│ tipo            │
│ severidad       │
│ estado          │
│ mensaje         │
│ fecha_generacion│
│ atendida_por    │
└─────────────────┘

┌──────────────────┐
│  AUDITORIA_DATOS │
├──────────────────┤
│ id (PK)          │
│ timestamp        │
│ usuario          │
│ accion           │
│ tabla            │
│ registro_id      │
│ datos_anteriores │
│ datos_nuevos     │
│ justificacion    │
└──────────────────┘
```

### 8.2 Tablas Principales

#### Tabla: expedientes
```sql
CREATE TABLE expedientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_entidad VARCHAR(50) NOT NULL,
    numero VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    documento_identidad VARCHAR(50),
    tipo_documento VARCHAR(20),
    pais_residencia VARCHAR(3),
    actividad_economica VARCHAR(100),
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    nivel_riesgo VARCHAR(20),
    fecha_ultima_evaluacion TIMESTAMP,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificacion TIMESTAMP,
    creado_por VARCHAR(100) NOT NULL,
    modificado_por VARCHAR(100),
    datos_adicionales JSONB,
    activo BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_tipo_entidad CHECK (tipo_entidad IN ('CLIENTE', 'INTERMEDIARIO', 'EMPLEADO', 'PROVEEDOR', 'REASEGURADOR', 'RETROCESIONARIO')),
    CONSTRAINT chk_nivel_riesgo CHECK (nivel_riesgo IN ('BAJO', 'MEDIO', 'ALTO', 'CRITICO'))
);

CREATE INDEX idx_expedientes_tipo ON expedientes(tipo_entidad);
CREATE INDEX idx_expedientes_estado ON expedientes(estado);
CREATE INDEX idx_expedientes_riesgo ON expedientes(nivel_riesgo);
CREATE INDEX idx_expedientes_numero ON expedientes(numero);
```

#### Tabla: evaluaciones
```sql
CREATE TABLE evaluaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id),
    fecha_evaluacion TIMESTAMP NOT NULL DEFAULT NOW(),
    score_total NUMERIC(5,2) NOT NULL,
    nivel_riesgo VARCHAR(20) NOT NULL,
    detalles_evaluacion JSONB NOT NULL,
    alertas_generadas JSONB,
    requiere_revision BOOLEAN DEFAULT FALSE,
    evaluado_por VARCHAR(100),
    revisado_por VARCHAR(100),
    fecha_revision TIMESTAMP,
    comentarios TEXT,
    version_parametros VARCHAR(50),
    
    CONSTRAINT chk_score_range CHECK (score_total >= 0 AND score_total <= 100)
);

CREATE INDEX idx_evaluaciones_expediente ON evaluaciones(expediente_id);
CREATE INDEX idx_evaluaciones_fecha ON evaluaciones(fecha_evaluacion);
CREATE INDEX idx_evaluaciones_riesgo ON evaluaciones(nivel_riesgo);
```

#### Tabla: reglas_evaluacion
```sql
CREATE TABLE reglas_evaluacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_entidad VARCHAR(50)[] NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    condiciones JSONB NOT NULL,
    accion JSONB NOT NULL,
    puntaje_asignado INTEGER,
    requiere_revision_manual BOOLEAN DEFAULT FALSE,
    prioridad INTEGER DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    creado_por VARCHAR(100) NOT NULL,
    fecha_modificacion TIMESTAMP,
    modificado_por VARCHAR(100),
    version INTEGER DEFAULT 1
);

CREATE INDEX idx_reglas_tipo_entidad ON reglas_evaluacion USING GIN(tipo_entidad);
CREATE INDEX idx_reglas_activas ON reglas_evaluacion(activa) WHERE activa = TRUE;
```

#### Tabla: alertas
```sql
CREATE TABLE alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes(id),
    evaluacion_id UUID REFERENCES evaluaciones(id),
    tipo VARCHAR(50) NOT NULL,
    severidad VARCHAR(20) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_generacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_atencion TIMESTAMP,
    atendida_por VARCHAR(100),
    comentarios_resolucion TEXT,
    metadata JSONB,
    
    CONSTRAINT chk_severidad CHECK (severidad IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')),
    CONSTRAINT chk_estado_alerta CHECK (estado IN ('PENDIENTE', 'EN_REVISION', 'RESUELTA', 'FALSO_POSITIVO', 'ESCALADA'))
);

CREATE INDEX idx_alertas_estado ON alertas(estado);
CREATE INDEX idx_alertas_severidad ON alertas(severidad);
CREATE INDEX idx_alertas_expediente ON alertas(expediente_id);
CREATE INDEX idx_alertas_fecha ON alertas(fecha_generacion);
```

---

## 9. SEGURIDAD

### 9.1 Capas de Seguridad

#### 9.1.1 Seguridad de Red
- Firewall configurado
- HTTPS obligatorio (TLS 1.3)
- Certificados SSL válidos
- VPN para acceso administrativo (opcional)

#### 9.1.2 Seguridad de Aplicación
- Autenticación multi-factor (2FA) para roles críticos
- Tokens JWT con expiración corta (15 min)
- Refresh tokens (7 días)
- Rate limiting (100 req/min por usuario)
- CORS restrictivo (solo dominios aprobados)
- Protección CSRF
- Headers de seguridad (HSTS, X-Frame-Options, etc.)

#### 9.1.3 Seguridad de Datos
- Encriptación en tránsito (TLS)
- Encriptación en reposo (BD nivel columna para datos sensibles)
- Hashing de contraseñas (BCrypt, cost factor 12)
- Tokens firmados (HMAC-SHA256)
- Sanitización de inputs (prevenir SQL injection, XSS)

### 9.2 Gestión de Sesiones

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()  // Usamos JWT, no cookies de sesión
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests()
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("SUPER_ADMIN")
                .requestMatchers("/api/v1/parametros/**").hasAnyRole("SUPER_ADMIN", "OFICIAL_CUMPLIMIENTO")
                .requestMatchers("/api/v1/expedientes/**").authenticated()
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 9.3 Políticas de Contraseña

- Longitud mínima: 12 caracteres
- Complejidad: mayúsculas, minúsculas, números, símbolos
- No permitir contraseñas comunes
- Expiración: 90 días (configurable)
- Historial: No repetir últimas 5 contraseñas
- Bloqueo: 5 intentos fallidos → bloqueo 15 minutos

---

## 10. DESPLIEGUE Y ENTORNO

### 10.1 Ambientes

#### Desarrollo
- Base de datos local (PostgreSQL en Docker)
- Datos de prueba
- Logs detallados
- Sin restricciones de CORS

#### QA/Testing
- Réplica de producción
- Datos anonimizados de producción
- Acceso restringido a equipo QA

#### Producción
- Alta disponibilidad
- Backups automáticos diarios
- Monitoreo 24/7
- Logs centralizados

### 10.2 Infraestructura Recomendada

**Opción 1: On-Premise**
```
- Servidor Aplicación: 32 GB RAM, 8 cores, 500 GB SSD
- Servidor BD: 64 GB RAM, 16 cores, 1 TB SSD (RAID 10)
- Servidor Backup: 2 TB almacenamiento
- Red: 1 Gbps
```

**Opción 2: Cloud (AWS/Azure/Google Cloud)**
```
- Frontend: S3 + CloudFront (AWS) o Azure CDN
- Backend: EC2 t3.xlarge (4 vCPU, 16 GB) o App Service (Azure)
- BD: RDS PostgreSQL db.r6g.2xlarge o Azure Database for PostgreSQL
- Cache: ElastiCache Redis
- Load Balancer: Application Load Balancer
```

### 10.3 Backups

- **Frecuencia:** Diaria (incremental), Semanal (completa)
- **Retención:** 7 días online, 30 días archivo, 5 años regulatorio
- **Pruebas de Restauración:** Mensual
- **Ubicación:** Offsite o región diferente en cloud

### 10.4 Monitoreo

**Métricas de Aplicación:**
- Uptime (objetivo: 99.9%)
- Tiempo de respuesta (p50, p95, p99)
- Throughput (requests/segundo)
- Tasa de errores

**Métricas de Infraestructura:**
- CPU, Memoria, Disco
- Conexiones de BD
- Latencia de red

**Alertas:**
- Downtime > 1 minuto
- Tiempo de respuesta > 2 segundos (p95)
- Errores 500 > 1%
- Uso de disco > 80%
- Backups fallidos

**Herramientas:**
- Prometheus + Grafana
- ELK Stack (logs)
- Sentry (errores de aplicación)
- UptimeRobot (monitoreo externo)

---

## 11. PLAN DE IMPLEMENTACIÓN PROGRESIVA

### Fase 1: Fundación (Meses 1-2)
✅ Configuración de infraestructura  
✅ Setup de BD y migrations  
✅ Autenticación y autorización  
✅ CRUD básico de expedientes  
✅ Sistema de auditoría básico  

### Fase 2: Motor de Riesgo (Meses 3-4)
✅ Gestión de parámetros (catálogos, criterios)  
✅ Motor de evaluación de riesgo (MVP)  
✅ Cálculo de scores y clasificación  
✅ Generación de alertas básicas  

### Fase 3: Parametrización (Mes 5)
✅ Editor visual de reglas  
✅ Gestor de ponderaciones  
✅ Simulador "¿Qué pasa si?"  
✅ Versionado de configuración  

### Fase 4: Reportes y Análisis (Mes 6)
✅ Dashboard de cumplimiento  
✅ Reportes regulatorios  
✅ Exportación de datos  
✅ Análisis de tendencias  

### Fase 5: Optimización (Meses 7-8)
✅ Mejoras de performance (caché, índices)  
✅ Procesamiento asíncrono  
✅ Notificaciones en tiempo real  
✅ Integración con otros sistemas  

### Fase 6: Producción (Mes 9)
✅ Pruebas de carga  
✅ Pruebas de seguridad (penetration testing)  
✅ Capacitación de usuarios  
✅ Despliegue en producción  
✅ Soporte post-lanzamiento  

---

## 12. CONSIDERACIONES REGULATORIAS

### 12.1 Cumplimiento Normativo Venezuela

El sistema debe estar alineado con:
- Ley Orgánica contra la Delincuencia Organizada y Financiamiento al Terrorismo
- Normas de la Superintendencia de Seguros (SUDEASEG)
- Recomendaciones del GAFI (Grupo de Acción Financiera Internacional)
- Normas de debida diligencia del cliente

### 12.2 Evidencias para Inspección Regulatoria

El sistema debe poder demostrar:
✅ Registro completo de todas las transacciones  
✅ Historial de decisiones de cumplimiento con justificaciones  
✅ Trazabilidad de cambios en configuraciones  
✅ Reportes de operaciones inusuales generados oportunamente  
✅ Capacitación del personal (logs de acceso y uso)  
✅ Pruebas periódicas del sistema  

### 12.3 Documentación Requerida

- Manual de Usuario
- Manual Técnico
- Políticas y Procedimientos de Cumplimiento
- Plan de Contingencia
- Matriz de Riesgos del Sistema
- Certificaciones de Seguridad

---

## 13. CONCLUSIONES Y RECOMENDACIONES

### 13.1 Puntos Clave de la Arquitectura

✅ **Modularidad:** Servicios independientes que se pueden desarrollar y desplegar por separado  
✅ **Escalabilidad:** Diseñado para crecer desde 50 a 5000 usuarios sin rediseño  
✅ **Parametrización:** Usuario funcional puede ajustar comportamiento sin código  
✅ **Auditoría:** Registro completo e inmutable de todas las operaciones  
✅ **Separación de Responsabilidades:** Clara división entre capas y módulos  

### 13.2 Tecnologías Recomendadas

**Backend:**
- Java 17 LTS
- Spring Boot 3.2+
- PostgreSQL 15+
- Redis 7+
- Maven

**Frontend:**
- React 18+
- TypeScript
- Material-UI o Ant Design
- Redux Toolkit
- Axios

**Infraestructura:**
- Docker para contenedores
- Nginx para proxy reverso
- GitLab/GitHub para versionado
- Jenkins/GitLab CI para CI/CD

### 13.3 Próximos Pasos

1. **Validación con Stakeholders:** Revisar esta arquitectura con áreas de Cumplimiento, IT y Regulación
2. **Prototipo MVP:** Desarrollar expediente + evaluación básica (4-6 semanas)
3. **Piloto:** Probar con 5-10 usuarios reales antes de despliegue completo
4. **Capacitación:** Entrenar a usuarios finales en parametrización
5. **Documentación:** Completar manuales y procedimientos antes del lanzamiento

### 13.4 Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Cambios regulatorios frecuentes | Alto | Arquitectura flexible y parametrizable |
| Resistencia al cambio de usuarios | Medio | Capacitación intensiva y soporte post-lanzamiento |
| Problemas de performance | Alto | Pruebas de carga y optimización temprana |
| Fallas de seguridad | Crítico | Penetration testing, auditorías de código |
| Pérdida de datos | Crítico | Backups automáticos, réplicas, disaster recovery |

---

## 14. GLOSARIO

- **EBR:** Enfoque Basado en Riesgo
- **PEP:** Persona Políticamente Expuesta
- **GAFI:** Grupo de Acción Financiera Internacional
- **SUDEASEG:** Superintendencia de Seguros (Venezuela)
- **RLS:** Row Level Security
- **JWT:** JSON Web Token
- **AOP:** Aspect-Oriented Programming
- **CRUD:** Create, Read, Update, Delete
- **API:** Application Programming Interface
- **REST:** Representational State Transfer
- **JSON:** JavaScript Object Notation
- **SLA:** Service Level Agreement

---

**Documento preparado para:**  
Sistema Integral de Administración de Riesgos y Cumplimiento (SIAR)  
Empresa de Seguros - Venezuela

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Estado:** Propuesta de Arquitectura para Aprobación

---
