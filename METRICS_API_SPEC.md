# API Endpoints Specification - Metrics Module

Este documento especifica todos los endpoints REST que el backend debe implementar para el módulo de métricas y reportes.

## Base URL
```
/api/metrics
```

---

## 1. Obtener Métricas por Técnico

**Endpoint:** `GET /api/metrics/technicians`

**Descripción:** Retorna métricas agrupadas por técnico, con soporte para filtros de fecha, tipo de servicio y zonas.

**Método:** `GET`

**Parámetros Query (opcionales):**
- `startDate` (string, formato: YYYY-MM-DD) - Fecha inicial del período
- `endDate` (string, formato: YYYY-MM-DD) - Fecha final del período
- `serviceType` (string) - Tipo de servicio a filtrar
- `zones` (string) - Zonas separadas por comas (ej: "Norte,Sur,Este")

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Response Success (200):**
```json
[
  {
    "technicianId": "TECH-001",
    "technicianName": "Juan Pérez",
    "zone": "Norte",
    "totalOrders": 25,
    "completedOrders": 20,
    "avgResolutionTime": 5.5,
    "pendingOrders": 5,
    "specialty": "Instalación"
  },
  {
    "technicianId": "TECH-002",
    "technicianName": "María García",
    "zone": "Sur",
    "totalOrders": 30,
    "completedOrders": 28,
    "avgResolutionTime": 4.2,
    "pendingOrders": 2,
    "specialty": "Reparación"
  }
]
```

**Response Error (400):**
```json
{
  "error": "Invalid date format",
  "message": "startDate debe estar en formato YYYY-MM-DD"
}
```

**Response Error (401):**
```json
{
  "error": "Unauthorized",
  "message": "Token inválido o expirado"
}
```

**Ejemplo de Request:**
```bash
GET /api/metrics/technicians?startDate=2024-01-01&endDate=2024-01-31&zones=Norte,Sur
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Guardar Reporte

**Endpoint:** `POST /api/metrics/reports`

**Descripción:** Guarda un reporte generado con métricas y filtros aplicados.

**Método:** `POST`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "name": "Reporte_2024-01-31",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "serviceType": "Instalación",
    "zones": ["Norte", "Sur"]
  },
  "metrics": [
    {
      "technicianId": "TECH-001",
      "technicianName": "Juan Pérez",
      "zone": "Norte",
      "totalOrders": 25,
      "completedOrders": 20,
      "avgResolutionTime": 5.5,
      "pendingOrders": 5,
      "specialty": "Instalación"
    }
  ],
  "generatedAt": "2024-01-31T10:30:00Z"
}
```

**Response Success (201):**
```json
{
  "message": "Reporte guardado exitosamente",
  "reportId": "REPORT-1706701800000"
}
```

**Response Error (400):**
```json
{
  "error": "Invalid request",
  "message": "El campo 'name' es requerido"
}
```

**Response Error (401):**
```json
{
  "error": "Unauthorized",
  "message": "Token inválido o expirado"
}
```

---

## 3. Obtener Lista de Reportes Guardados

**Endpoint:** `GET /api/metrics/reports`

**Descripción:** Retorna la lista de todos los reportes guardados por el usuario.

**Método:** `GET`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Response Success (200):**
```json
[
  {
    "id": "REPORT-1706701800000",
    "name": "Reporte_2024-01-31",
    "filters": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "serviceType": "Instalación",
      "zones": ["Norte", "Sur"]
    },
    "metrics": [
      {
        "technicianId": "TECH-001",
        "technicianName": "Juan Pérez",
        "zone": "Norte",
        "totalOrders": 25,
        "completedOrders": 20,
        "avgResolutionTime": 5.5,
        "pendingOrders": 5,
        "specialty": "Instalación"
      }
    ],
    "generatedAt": "2024-01-31T10:30:00Z"
  }
]
```

**Response Error (401):**
```json
{
  "error": "Unauthorized",
  "message": "Token inválido o expirado"
}
```

---

## 4. Obtener Reporte por ID

**Endpoint:** `GET /api/metrics/reports/{reportId}`

**Descripción:** Retorna el detalle completo de un reporte específico.

**Método:** `GET`

**Path Parameters:**
- `reportId` (string, requerido) - ID del reporte

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Response Success (200):**
```json
{
  "id": "REPORT-1706701800000",
  "name": "Reporte_2024-01-31",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "serviceType": "Instalación",
    "zones": ["Norte", "Sur"]
  },
  "metrics": [
    {
      "technicianId": "TECH-001",
      "technicianName": "Juan Pérez",
      "zone": "Norte",
      "totalOrders": 25,
      "completedOrders": 20,
      "avgResolutionTime": 5.5,
      "pendingOrders": 5,
      "specialty": "Instalación"
    }
  ],
  "generatedAt": "2024-01-31T10:30:00Z"
}
```

**Response Error (404):**
```json
{
  "error": "Not found",
  "message": "Reporte no encontrado"
}
```

**Response Error (401):**
```json
{
  "error": "Unauthorized",
  "message": "Token inválido o expirado"
}
```

**Ejemplo de Request:**
```bash
GET /api/metrics/reports/REPORT-1706701800000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Eliminar Reporte

**Endpoint:** `DELETE /api/metrics/reports/{reportId}`

**Descripción:** Elimina permanentemente un reporte guardado.

**Método:** `DELETE`

**Path Parameters:**
- `reportId` (string, requerido) - ID del reporte a eliminar

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Response Success (200):**
```json
{
  "message": "Reporte eliminado exitosamente"
}
```

**Response Error (404):**
```json
{
  "error": "Not found",
  "message": "Reporte no encontrado"
}
```

**Response Error (401):**
```json
{
  "error": "Unauthorized",
  "message": "Token inválido o expirado"
}
```

**Ejemplo de Request:**
```bash
DELETE /api/metrics/reports/REPORT-1706701800000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Notas de Implementación

### Cálculo de Métricas

El backend debe calcular las siguientes métricas por técnico:

1. **totalOrders**: Total de órdenes asignadas al técnico en el período
2. **completedOrders**: Órdenes con estado "completed"
3. **pendingOrders**: Órdenes con estado "pending" o "assigned"
4. **avgResolutionTime**: Promedio de tiempo (en horas) entre `assignedAt` y `completedAt` para órdenes completadas

### Filtros

Los filtros deben aplicarse sobre las órdenes de trabajo antes de calcular las métricas:

- **startDate/endDate**: Filtrar por `createdAt` de las órdenes
- **serviceType**: Filtrar por `specialty` de las órdenes
- **zones**: Filtrar por `zone` de las órdenes

### Autenticación

Todos los endpoints requieren autenticación mediante token Bearer JWT. El token debe ser validado en cada request.

### Almacenamiento de Reportes

Los reportes deben almacenarse en base de datos con:
- Información de usuario que lo creó
- Timestamp de creación
- Filtros aplicados (para permitir regeneración)
- Snapshot de las métricas en ese momento

### Códigos de Estado HTTP

- `200 OK`: Request exitoso
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Request inválido o datos incorrectos
- `401 Unauthorized`: Token inválido o ausente
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

### Formato de Fechas

Todas las fechas deben seguir el formato ISO 8601:
- Para parámetros de fecha: `YYYY-MM-DD`
- Para timestamps: `YYYY-MM-DDTHH:mm:ssZ`

### Paginación (Recomendado para futuro)

Para endpoints que retornan listas, se recomienda implementar paginación:

```
GET /api/metrics/reports?page=1&limit=20
```

Response con metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
