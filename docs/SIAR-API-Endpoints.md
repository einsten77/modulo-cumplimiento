# SIAR - Documentación de API REST

## Convenciones Generales

**Base URL:** `https://api.empresa.com/siar/api/v1`

**Autenticación:** Bearer Token (JWT) en header Authorization
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Formato de Respuesta:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa",
  "timestamp": "2024-12-14T10:30:00Z"
}
```

**Formato de Error:**
```json
{
  "success": false,
  "error": {
    "code": "RECURSO_NO_ENCONTRADO",
    "message": "Expediente no encontrado",
    "details": { "expedienteId": "123" }
  },
  "timestamp": "2024-12-14T10:30:00Z"
}
```

---

## 1. Autenticación

### POST /auth/login
Iniciar sesión y obtener token JWT.

**Request:**
```json
{
  "email": "usuario@empresa.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "usuario": {
      "id": "uuid",
      "email": "usuario@empresa.com",
      "nombre": "Juan Pérez",
      "rol": "OFICIAL_CUMPLIMIENTO"
    }
  }
}
```

### POST /auth/refresh
Renovar token de acceso.

### POST /auth/logout
Cerrar sesión.

---

## 2. Expedientes

### POST /expedientes
Crear nuevo expediente.

**Request:**
```json
{
  "tipoEntidad": "CLIENTE",
  "nombre": "Empresa ABC C.A.",
  "documentoIdentidad": "J-12345678-9",
  "tipoDocumento": "RIF",
  "paisResidencia": "VE",
  "actividadEconomica": "CONSTRUCCION",
  "datosAdicionales": {
    "telefono": "+58 212 1234567",
    "email": "contacto@empresaabc.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": "EXP-2024-00123",
    "tipoEntidad": "CLIENTE",
    "nombre": "Empresa ABC C.A.",
    "estado": "PENDIENTE",
    "nivelRiesgo": null,
    "fechaCreacion": "2024-12-14T10:30:00Z",
    "creadoPor": "usuario@empresa.com"
  }
}
```

### GET /expedientes/{id}
Obtener detalle de expediente.

### PUT /expedientes/{id}
Actualizar expediente.

### GET /expedientes
Listar expedientes con filtros.

**Query Params:**
- `tipoEntidad` (opcional): CLIENTE, INTERMEDIARIO, etc.
- `estado` (opcional): PENDIENTE, APROBADO, etc.
- `nivelRiesgo` (opcional): BAJO, MEDIO, ALTO, CRITICO
- `page` (default: 0)
- `size` (default: 20)
- `sort` (opcional): campo,direccion (ej: fechaCreacion,desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [ ... array de expedientes ... ],
    "totalElements": 150,
    "totalPages": 8,
    "size": 20,
    "number": 0
  }
}
```

### POST /expedientes/buscar
Búsqueda avanzada de expedientes.

**Request:**
```json
{
  "criterios": {
    "nombre": "ABC",
    "tipoEntidad": ["CLIENTE", "PROVEEDOR"],
    "nivelRiesgo": ["ALTO", "CRITICO"],
    "fechaDesde": "2024-01-01",
    "fechaHasta": "2024-12-31"
  },
  "page": 0,
  "size": 20
}
```

---

## 3. Evaluaciones

### POST /evaluaciones
Evaluar expediente y calcular riesgo.

**Request:**
```json
{
  "expedienteId": "uuid",
  "forzarReevaluacion": false,
  "comentarios": "Evaluación solicitada por actualización de datos"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "expedienteId": "uuid",
    "fechaEvaluacion": "2024-12-14T10:30:00Z",
    "scoreTotal": 67.5,
    "nivelRiesgo": "ALTO",
    "detallesEvaluacion": [
      {
        "criterioId": "CR001",
        "nombre": "País de Residencia",
        "valor": "Venezuela",
        "puntaje": 20,
        "ponderacion": 0.15,
        "puntajePonderado": 3.0
      }
    ],
    "alertasGeneradas": [
      {
        "id": "uuid",
        "tipo": "RIESGO_ALTO",
        "severidad": "ALTA",
        "mensaje": "Expediente clasificado con riesgo alto"
      }
    ],
    "requiereRevision": true
  }
}
```

### GET /evaluaciones/expediente/{expedienteId}
Obtener historial de evaluaciones de un expediente.

### GET /evaluaciones/{id}
Obtener detalle de una evaluación específica.

### POST /evaluaciones/{id}/revisar
Revisar y aprobar/rechazar una evaluación.

**Request:**
```json
{
  "decision": "APROBADO",
  "comentarios": "Documentación verificada, aprobado para operar",
  "justificacion": "Cliente cumple con todos los requisitos"
}
```

---

## 4. Parámetros

### GET /parametros/catalogos
Listar todos los catálogos disponibles.

### GET /parametros/catalogos/{nombre}
Obtener items de un catálogo específico.

**Example:** `/parametros/catalogos/PAISES`

**Response:**
```json
{
  "success": true,
  "data": {
    "nombre": "PAISES",
    "items": [
      {
        "id": "VE",
        "codigo": "VE",
        "valor": "Venezuela",
        "nivelRiesgo": "MEDIO",
        "activo": true
      }
    ]
  }
}
```

### POST /parametros/catalogos/{nombre}/items
Agregar item a catálogo.

### PUT /parametros/catalogos/{nombre}/items/{id}
Actualizar item de catálogo.

### GET /parametros/criterios
Listar criterios de evaluación.

### POST /parametros/criterios
Crear nuevo criterio.

**Request:**
```json
{
  "codigo": "CR010",
  "nombre": "Monto de Prima Anual",
  "descripcion": "Evaluación basada en el monto de prima anual",
  "tipoEntidad": ["CLIENTE"],
  "tipoDato": "NUMERICO",
  "ponderacion": 0.10,
  "formulaCalculo": "RANGOS",
  "rangos": [
    {"min": 0, "max": 10000, "puntaje": 5},
    {"min": 10001, "max": 50000, "puntaje": 10},
    {"min": 50001, "max": 100000, "puntaje": 15}
  ]
}
```

### PUT /parametros/criterios/{id}
Actualizar criterio existente.

### GET /parametros/ponderaciones
Obtener configuración actual de ponderaciones.

### PUT /parametros/ponderaciones
Actualizar ponderaciones.

**Request:**
```json
{
  "tipoEntidad": "CLIENTE",
  "ponderaciones": [
    {"criterioId": "CR001", "peso": 0.15},
    {"criterioId": "CR002", "peso": 0.20},
    {"criterioId": "CR003", "peso": 0.10}
  ],
  "justificacion": "Ajuste según nueva directriz regulatoria"
}
```

### GET /parametros/reglas
Listar reglas de evaluación.

### POST /parametros/reglas
Crear nueva regla.

### PUT /parametros/reglas/{id}
Actualizar regla existente.

### POST /parametros/simular
Simular evaluación con parámetros de prueba.

**Request:**
```json
{
  "tipoEntidad": "CLIENTE",
  "valores": {
    "paisResidencia": "VE",
    "actividadEconomica": "CONSTRUCCION",
    "montoPrima": 75000,
    "esPEP": true
  }
}
```

---

## 5. Alertas

### GET /alertas
Listar alertas con filtros.

**Query Params:**
- `estado`: PENDIENTE, EN_REVISION, RESUELTA
- `severidad`: BAJA, MEDIA, ALTA, CRITICA
- `fechaDesde`, `fechaHasta`
- `page`, `size`

### GET /alertas/{id}
Obtener detalle de alerta.

### PUT /alertas/{id}/atender
Marcar alerta como atendida.

**Request:**
```json
{
  "estado": "RESUELTA",
  "comentarios": "Cliente proporcionó documentación adicional requerida"
}
```

### GET /alertas/estadisticas
Obtener estadísticas de alertas.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPendientes": 15,
    "totalEnRevision": 8,
    "totalResueltas": 142,
    "porSeveridad": {
      "BAJA": 5,
      "MEDIA": 7,
      "ALTA": 2,
      "CRITICA": 1
    },
    "promedioTiempoResolucion": 4.5
  }
}
```

---

## 6. Auditoría

### GET /auditoria/logs
Consultar logs de auditoría.

**Query Params:**
- `usuario` (opcional)
- `accion` (opcional)
- `entidad` (opcional)
- `fechaDesde`, `fechaHasta`
- `page`, `size`

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "timestamp": "2024-12-14T10:30:45Z",
        "usuario": "usuario@empresa.com",
        "rol": "OFICIAL_CUMPLIMIENTO",
        "accion": "MODIFICAR_EXPEDIENTE",
        "entidad": "Expediente",
        "entidadId": "EXP-2024-00123",
        "datosAnteriores": { ... },
        "datosNuevos": { ... },
        "ipAddress": "192.168.1.45"
      }
    ],
    "totalElements": 1250
  }
}
```

### GET /auditoria/logs/{id}
Obtener detalle de un log específico.

### POST /auditoria/exportar
Exportar logs para auditoría externa.

**Request:**
```json
{
  "formato": "PDF",
  "filtros": {
    "fechaDesde": "2024-01-01",
    "fechaHasta": "2024-12-31",
    "usuarios": ["usuario1@empresa.com"],
    "acciones": ["APROBAR_EXPEDIENTE", "MODIFICAR_PARAMETROS"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "archivoId": "uuid",
    "nombreArchivo": "auditoria_2024.pdf",
    "urlDescarga": "/api/v1/archivos/uuid",
    "fechaExpiracion": "2024-12-15T10:30:00Z"
  }
}
```

---

## 7. Reportes

### GET /reportes/tipos
Listar tipos de reportes disponibles.

### POST /reportes/generar
Generar reporte.

**Request:**
```json
{
  "tipoReporte": "REGULATORIO_MENSUAL",
  "formato": "PDF",
  "parametros": {
    "mes": 12,
    "anio": 2024
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reporteId": "uuid",
    "estado": "EN_PROCESO",
    "estimadoSegundos": 30
  }
}
```

### GET /reportes/{id}/estado
Consultar estado de generación de reporte.

### GET /reportes/{id}/descargar
Descargar reporte generado.

---

## 8. Usuarios y Roles

### GET /usuarios
Listar usuarios del sistema.

### POST /usuarios
Crear nuevo usuario.

**Request:**
```json
{
  "email": "nuevo.usuario@empresa.com",
  "nombre": "María García",
  "rol": "ANALISTA_CUMPLIMIENTO",
  "activo": true
}
```

### PUT /usuarios/{id}
Actualizar usuario.

### PUT /usuarios/{id}/cambiar-password
Cambiar contraseña de usuario.

### GET /roles
Listar roles y permisos.

---

## Códigos de Estado HTTP

- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado exitosamente
- `204 No Content` - Operación exitosa sin contenido de respuesta
- `400 Bad Request` - Error en los datos enviados
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - Sin permisos para la operación
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (ej: duplicado)
- `422 Unprocessable Entity` - Error de validación de negocio
- `500 Internal Server Error` - Error del servidor

---

## Rate Limiting

- **Límite por usuario:** 100 requests/minuto
- **Límite global:** 10,000 requests/minuto
- **Headers de respuesta:**
  - `X-RateLimit-Limit`: Límite total
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp de reset

---
