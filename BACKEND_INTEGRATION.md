# Integración con Backend

Este documento describe el estado de integración entre el frontend y el backend Spring Boot.

## Estado Actual

### ✅ Endpoints Integrados con Backend Real

#### Autenticación (`/api/auth`)
- **POST `/api/auth/login`**
  - Request: `{ email: string, password: string }`
  - Response: `"Login successful"` (texto plano)
  - Nota: El frontend genera un token mock ya que el backend no implementa JWT

- **POST `/api/auth/register`**
  - Request: `{ email: string, password: string, name: string, role: string }`
  - Response: `"User registered"` (texto plano)

#### Técnicos (`/api/technicians`)
- **POST `/api/technicians/create`**
  - Request: `{ name: string, zone: string, workload: string, specialty: string }`
  - Response: `"Technician created"` (texto plano)

- **GET `/api/technicians/all`**
  - Response: Array de técnicos con estructura:
    ```json
    [{
      "idTecnico": number,
      "nameTecnico": string,
      "zoneTecnico": string,
      "workloadTecnico": string,
      "specialtyTecnico": string
    }]
    ```
  - Nota: El frontend convierte automáticamente esta estructura al formato esperado

### ⚠️ Funcionalidades en Mock API

Las siguientes funcionalidades aún usan datos simulados (mock) ya que no están implementadas en el backend:

- **Órdenes de Trabajo (Work Orders)**
  - GET `/work-orders` - Listar órdenes
  - GET `/work-orders/:id` - Obtener una orden
  - Crear y actualizar órdenes

- **Asignaciones**
  - POST `/assignments/manual` - Asignación manual
  - POST `/assignments/automatic` - Asignación automática

- **Notificaciones**
  - POST `/notifications/send` - Enviar notificación

- **Filtros de Técnicos**
  - Los filtros por zona, especialidad y disponibilidad se aplican en el frontend

## Configuración

### Variables de Entorno

Edita el archivo `.env` para controlar qué backend usar:

```env
# URL del backend
VITE_API_URL=http://localhost:8080/api

# true = usar mock API, false = usar backend real
VITE_USE_MOCK_API=true
```

### Uso del Backend Real

Para usar el backend real:

1. Asegúrate de que el backend Spring Boot esté corriendo en `http://localhost:8080`
2. Cambia `VITE_USE_MOCK_API=false` en el archivo `.env`
3. Reinicia el servidor de desarrollo

**Nota:** Al usar el backend real, las funcionalidades de Work Orders, Asignaciones y Notificaciones no estarán disponibles.

## Mapeo de Campos

### Backend → Frontend

El frontend convierte automáticamente los campos del backend al formato esperado:

| Backend (DB)          | Frontend                    |
|-----------------------|-----------------------------|
| `idTecnico`          | `id`                        |
| `nameTecnico`        | `name`                      |
| `zoneTecnico`        | `zone`                      |
| `specialtyTecnico`   | `specialty`                 |
| `workloadTecnico`    | `availability` + `currentLoad` |

### Conversión de Workload

| Backend Workload | Frontend Availability | Current Load |
|------------------|-----------------------|--------------|
| `"low"`         | `"available"`         | 2            |
| `"medium"`      | `"offline"`           | 5            |
| `"high"`        | `"busy"`              | 8            |

## Próximos Pasos para Backend

Para completar la integración, el backend necesita implementar:

1. **Sistema de JWT**
   - Generar y validar tokens JWT en login
   - Incluir rol del usuario en el token
   - Middleware de autenticación para rutas protegidas

2. **Endpoints de Work Orders**
   - CRUD completo de órdenes de trabajo
   - Filtros y búsqueda
   - Estados y prioridades

3. **Endpoints de Asignaciones**
   - Asignación manual de técnicos
   - Algoritmo de asignación automática
   - Historial de asignaciones

4. **Sistema de Notificaciones**
   - Envío de notificaciones por email/SMS
   - Integración con servicios de terceros

5. **Filtros en Técnicos**
   - Parámetros de query para filtrar por zona, especialidad y disponibilidad
   - Paginación

## Testing

### Con Mock API
```bash
# .env
VITE_USE_MOCK_API=true
```
- ✅ Todas las funcionalidades disponibles
- ✅ Usuarios de prueba predefinidos
- ✅ Datos de ejemplo precargados

### Con Backend Real
```bash
# .env
VITE_USE_MOCK_API=false
```
- ✅ Login y registro de usuarios
- ✅ Creación y listado de técnicos
- ⚠️ Sin work orders, asignaciones ni notificaciones
