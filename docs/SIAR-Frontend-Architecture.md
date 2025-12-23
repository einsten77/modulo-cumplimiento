# Arquitectura Frontend SIAR - Sistema Integral de Administración de Riesgos

## 1. Visión General

La arquitectura frontend del SIAR está diseñada para cumplir con los más altos estándares de regulación venezolana (SUDEASEG) y las mejores prácticas de desarrollo moderno con React y Next.js.

### Principios Arquitectónicos

1. **Segregación de Funciones**: Cada rol tiene vistas específicas y permisos claramente definidos
2. **Trazabilidad Total**: Toda acción es registrada y auditable
3. **Escalabilidad**: Arquitectura modular que facilita crecimiento
4. **Mantenibilidad**: Código organizado, documentado y reutilizable
5. **Seguridad**: Control de acceso en múltiples capas (frontend + backend)

## 2. Estructura de Carpetas

```
siar-frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo de rutas públicas
│   │   └── login/
│   │       └── page.tsx
│   ├── (protected)/              # Grupo de rutas protegidas
│   │   ├── layout.tsx            # Layout con Sidebar + Header
│   │   ├── dashboard/
│   │   ├── expedientes/
│   │   ├── screening/
│   │   ├── pep/
│   │   ├── documentos/
│   │   ├── casos/
│   │   └── auditoria/
│   ├── api/                      # API Routes (Next.js)
│   │   └── auth/
│   ├── globals.css
│   └── layout.tsx
│
├── components/                   # Componentes reutilizables
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   ├── common/
│   │   ├── data-table.tsx
│   │   ├── status-badge.tsx
│   │   ├── alert-banner.tsx
│   │   └── loading-spinner.tsx
│   ├── forms/
│   │   ├── expediente-form.tsx
│   │   ├── document-upload.tsx
│   │   └── screening-form.tsx
│   ├── auth/
│   │   ├── protected-route.tsx
│   │   └── role-guard.tsx
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
│
├── lib/                          # Utilidades y configuraciones
│   ├── api/
│   │   ├── client.ts             # Axios/Fetch configurado
│   │   ├── endpoints.ts          # Definición de endpoints
│   │   └── interceptors.ts      # Manejo de tokens
│   ├── auth/
│   │   ├── auth-context.tsx      # Context de autenticación
│   │   └── permissions.ts        # Lógica de permisos
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── dates.ts
│   └── constants/
│       ├── roles.ts
│       ├── permissions.ts
│       └── routes.ts
│
├── hooks/                        # Custom React Hooks
│   ├── use-auth.ts
│   ├── use-permissions.ts
│   ├── use-api.ts
│   └── use-toast.ts
│
├── types/                        # TypeScript Types
│   ├── auth.ts
│   ├── expediente.ts
│   ├── screening.ts
│   ├── pep.ts
│   └── api.ts
│
└── public/                       # Archivos estáticos
    ├── images/
    └── icons/

```

## 3. Stack Tecnológico

- **Framework**: Next.js 15+ (App Router)
- **Lenguaje**: TypeScript
- **UI Library**: React 19+
- **Estilos**: Tailwind CSS v4 + shadcn/ui
- **Gestión de Estado**: React Context API + SWR
- **HTTP Client**: Fetch API (nativo Next.js)
- **Validación**: Zod
- **Tipografía**: Poppins (Google Fonts)

## 4. Gestión de Autenticación

### Context de Autenticación

El sistema utiliza React Context para gestionar el estado global de autenticación:

```typescript
interface AuthContextType {
  user: User | null
  role: RoleType | null
  permissions: Permission[]
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  checkPermission: (permission: string) => boolean
}
```

### Flujo de Autenticación

1. Usuario ingresa credenciales en `/login`
2. Frontend envía POST a `${BACKEND_URL}/api/auth/login`
3. Backend valida y retorna JWT + datos de usuario
4. Frontend almacena token en `httpOnly cookie` o `localStorage`
5. Token se incluye en todas las peticiones subsiguientes
6. Frontend renderiza rutas según permisos del rol

## 5. Control de Acceso (RBAC)

### Roles del Sistema

```typescript
enum RoleType {
  OFICIAL_CUMPLIMIENTO = 'OFICIAL_CUMPLIMIENTO',
  USUARIO_RRHH = 'USUARIO_RRHH',
  USUARIO_COMERCIAL = 'USUARIO_COMERCIAL',
  CONSULTOR = 'CONSULTOR',
  AUDITOR_INTERNO = 'AUDITOR_INTERNO',
  REGULADOR_SUDEASEG = 'REGULADOR_SUDEASEG'
}
```

### Protección de Rutas

#### Componente `ProtectedRoute`

```typescript
// Protege rutas completas
<ProtectedRoute allowedRoles={['OFICIAL_CUMPLIMIENTO']}>
  <ScreeningPage />
</ProtectedRoute>
```

#### Componente `RoleGuard`

```typescript
// Protege secciones específicas
<RoleGuard allowedRoles={['OFICIAL_CUMPLIMIENTO', 'AUDITOR_INTERNO']}>
  <ApprovalButton />
</RoleGuard>
```

### Matriz de Permisos por Módulo

| Módulo | Oficial Cumplimiento | RRHH | Comercial | Auditor | Regulador |
|--------|---------------------|------|-----------|---------|-----------|
| Expedientes | CRUD | Create/Read | Read | Read | Read |
| Screening | Execute/Decide | - | - | Read | Read |
| PEP | CRUD | Read | - | Read | Read |
| Documentos | Approve | Upload | Upload | Read | Read |
| Casos/Alertas | Manage/Close | View | View | Read | Read |
| Auditoría | Read | - | - | Read | Full |

## 6. Comunicación con Backend

### Configuración de Cliente API

```typescript
// lib/api/client.ts
const apiClient = {
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  interceptors: {
    request: (config) => {
      const token = getAuthToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    response: (response) => response,
    error: (error) => handleApiError(error)
  }
}
```

### Endpoints Centralizados

```typescript
// lib/api/endpoints.ts
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh'
  },
  dossiers: {
    list: '/api/dossiers',
    create: '/api/dossiers',
    detail: (id) => `/api/dossiers/${id}`,
    approve: (id) => `/api/dossiers/${id}/approve`
  },
  screening: {
    execute: '/api/screening/execute',
    results: '/api/screening/results',
    decide: (id) => `/api/screening/${id}/decision`
  },
  // ... otros endpoints
}
```

### Manejo de Errores

```typescript
// Respuesta estandarizada del backend
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: ValidationError[]
}

// Manejo en frontend
try {
  const response = await fetch(endpoint)
  const data: ApiResponse<DossierDTO> = await response.json()
  
  if (!data.success) {
    toast.error(data.message || 'Error desconocido')
  }
} catch (error) {
  toast.error('Error de conexión con el servidor')
}
```

## 7. Layout Base del Sistema

### Estructura del Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header (fijo)                                                │
│ [Logo] SIAR | Usuario: Juan Pérez | Rol: Oficial | [Salir] │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ Sidebar  │  Contenido Principal (dinámico)                  │
│ (dinám.) │                                                   │
│          │  - Dashboard                                      │
│ ├ Inicio │  - Tablas de datos                               │
│ ├ Exp.   │  - Formularios                                   │
│ ├ Screen │  - Detalles                                      │
│ ├ PEP    │  - etc.                                          │
│ ├ Docs   │                                                   │
│ ├ Casos  │                                                   │
│ └ Audit. │                                                   │
│          │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

### Header

- Logo institucional (La Occidental)
- Nombre del sistema (SIAR)
- Usuario autenticado con avatar
- Rol activo visible
- Botón de cerrar sesión

### Sidebar

- Navegación generada dinámicamente según rol
- Iconos SVG claros y profesionales
- Resaltado de ruta activa
- Colapsable en dispositivos pequeños

## 8. Gestión de Estado

### State Management Strategy

```
┌─────────────────────────────────────────────────────────┐
│ Nivel                │ Herramienta    │ Uso              │
├─────────────────────────────────────────────────────────┤
│ Global (Auth)        │ Context API    │ Usuario, roles   │
│ Server State         │ SWR            │ Datos del API    │
│ Form State           │ React Hook Form│ Formularios      │
│ UI State             │ useState       │ Modales, tabs    │
└─────────────────────────────────────────────────────────┘
```

### Uso de SWR para Datos del Servidor

```typescript
// hooks/use-dossiers.ts
export function useDossiers() {
  const { data, error, isLoading, mutate } = useSWR(
    API_ENDPOINTS.dossiers.list,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 // 1 minuto
    }
  )
  
  return {
    dossiers: data?.data || [],
    isLoading,
    isError: error,
    refresh: mutate
  }
}
```

## 9. Lineamientos Visuales

### Paleta de Colores La Occidental

```css
/* Colores Primarios */
--primary: #00bf63    /* Verde corporativo */
--secondary: #37ce48  /* Verde claro */
--accent: #fce809     /* Amarillo */

/* Colores Neutrales */
--neutral-dark: #7f8083
--neutral-light: #a6a6a6

/* Colores de Estado */
--success: #00bf63    /* Verde */
--warning: #fce809    /* Amarillo */
--danger: #dc2626     /* Rojo */
--info: #37ce48       /* Verde claro */
```

### Tipografía

- **Familia Principal**: Poppins
- **Pesos**: 300, 400, 500, 600, 700
- **Jerarquía**:
  - H1: 32px / font-semibold
  - H2: 24px / font-semibold
  - H3: 20px / font-medium
  - Body: 16px / font-normal
  - Small: 14px / font-normal

### Componentes Clave

1. **Status Badges**: Colores según estado (aprobado/pendiente/rechazado)
2. **Alert Banners**: Info/Warning/Error claramente diferenciados
3. **Data Tables**: Filas alternas, hover states, acciones inline
4. **Cards**: Sombra sutil, bordes redondeados (8px)
5. **Buttons**: Primario (verde), Secundario (gris), Destructivo (rojo)

## 10. Seguridad Frontend

### Mejores Prácticas Implementadas

1. **Sanitización de Inputs**: Todos los inputs validados y sanitizados
2. **CSRF Protection**: Tokens CSRF en formularios sensibles
3. **XSS Prevention**: No uso de `dangerouslySetInnerHTML` sin sanitizar
4. **Secure Storage**: Tokens en httpOnly cookies (no localStorage)
5. **HTTPS Only**: Todas las comunicaciones cifradas
6. **Content Security Policy**: Headers CSP configurados
7. **Timeout de Sesión**: Cierre automático después de inactividad

### Validación de Datos

```typescript
// Uso de Zod para validación
import { z } from 'zod'

const dossierSchema = z.object({
  fullName: z.string().min(3).max(100),
  nationalId: z.string().regex(/^[VEJ]-\d{7,9}$/),
  email: z.string().email(),
  birthDate: z.date().max(new Date())
})

// En el componente
const form = useForm({
  resolver: zodResolver(dossierSchema)
})
```

## 11. Rendimiento y Optimización

### Estrategias Implementadas

1. **Code Splitting**: Carga lazy de módulos pesados
2. **Image Optimization**: Next.js Image component
3. **Memoization**: useMemo y useCallback en listas grandes
4. **Debouncing**: En búsquedas y filtros
5. **Virtual Scrolling**: Para tablas con +1000 registros
6. **Caching**: SWR para caché inteligente de datos

## 12. Testing Strategy

```
┌────────────────────────────────────────────────────┐
│ Tipo              │ Herramienta │ Cobertura       │
├────────────────────────────────────────────────────┤
│ Unit Tests        │ Jest        │ Utils, Hooks    │
│ Component Tests   │ RTL         │ UI Components   │
│ Integration Tests │ Playwright  │ Flujos críticos │
│ E2E Tests         │ Playwright  │ User journeys   │
└────────────────────────────────────────────────────┘
```

## 13. Deployment

### Variables de Entorno

```bash
# .env.production
NEXT_PUBLIC_BACKEND_URL=https://api.siar.occidental.ve
NEXT_PUBLIC_ENV=production
```

### Build Process

```bash
npm run build
npm run start
```

### Checklist Pre-Deploy

- [ ] Variables de entorno configuradas
- [ ] Tests pasando
- [ ] Auditoría de seguridad
- [ ] Performance audit (Lighthouse)
- [ ] Revisión de accesibilidad
- [ ] Documentación actualizada

## 14. Mantenibilidad

### Estándares de Código

- **Linting**: ESLint con reglas estrictas
- **Formatting**: Prettier
- **TypeScript**: Modo strict activado
- **Comments**: JSDoc para funciones públicas
- **Naming**: camelCase (variables), PascalCase (componentes)

### Documentación

Cada módulo debe incluir:
1. README.md explicando propósito
2. Ejemplos de uso
3. Props/Types documentados
4. Casos edge documentados

---

**Versión**: 1.0
**Fecha**: Diciembre 2024
**Autor**: Equipo SIAR - C.A. de Seguros La Occidental
**Estado**: Aprobado para implementación
