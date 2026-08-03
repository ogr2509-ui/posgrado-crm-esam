# Sistema Empresarial de Registro de Posgrado & CRM de Ventas

Plataforma web profesional, modular, segura y altamente escalable diseñada para la gestión de inscripciones de posgrado, generación de enlaces rastreables por asesor comercial, analítica comercial en tiempo real y exportación de reportes institucionales.

---

## 🚀 Tecnologías Principales

* **Frontend**: Next.js 14+ (App Router), TypeScript, TailwindCSS, Shadcn UI / Radix UI, Lucide Icons, Recharts, Framer Motion.
* **Backend**: Next.js API Routes & Server Actions (Node.js runtime).
* **Base de Datos & ORM**: PostgreSQL (compatible con Supabase y Neon) con **Prisma ORM**.
* **Autenticación & Seguridad**: JWT (JSON Web Tokens) en HTTP-Only Cookies / Headers + bcryptjs (hashing de contraseñas) + RBAC (Roles `ADMIN` y `ASESOR`).
* **Exportación**: ExcelJS (`.xlsx`) y jsPDF / AutoTable (`.pdf`).
* **Validación**: Zod + React Hook Form.

---

## 🏛️ Modelo Entidad-Relación (ER)

```mermaid
erDiagram
    User ||--o{ Link : "genera"
    User ||--o{ Registration : "gestiona"
    Program ||--o{ Link : "pertenece"
    Program ||--o{ Registration : "inscribe"
    Link ||--o{ Registration : "captura"
    Registration ||--o{ StatusHistory : "audita"
```

### Entidades y Tablas

1. **User**: Cuenta de usuario del sistema (Roles: `ADMIN` o `ASESOR`).
2. **Role**: Roles del sistema con restricciones de seguridad a nivel de backend.
3. **Program**: Catálogo de ofertas de posgrado (Maestría, Doctorado, Especialidad, Diplomado).
4. **Link**: Enlace rastreable único generado por un asesor para un programa específico (ej. `https://dominio.com/f/4fd89af8b2`).
5. **Registration**: Postulación enviada por el estudiante a través del formulario público.
6. **StatusHistory**: Historial cronológico de cambios de estado del lead con fecha, usuario responsable y notas.
7. **AuditLog**: Registro de auditoría de eventos de seguridad y operaciones del sistema.

---

## 🔐 Roles y Permisos (RBAC)

### Administrador (`ADMIN`)
* Crear, editar y desactivar usuarios / asesores.
* Crear, editar y desactivar programas académicos.
* Visualizar **todas** las inscripciones y estadísticas globales de la empresa.
* Ranking de Top Asesores y embudo de conversión general.
* Exportar reportes en Excel (.xlsx) y PDF.
* Consultar logs de seguridad y auditoría.

### Asesor de Ventas (`ASESOR`)
* Iniciar sesión y gestionar su perfil.
* Visualizar **únicamente sus propios enlaces y registros** (aislamiento estricto de datos).
* Generar nuevos enlaces únicos rastreables para cualquier programa activo.
* Cambiar estado de sus leads asignados añadiendo notas de seguimiento.
* Visualizar sus métricas personales (Registros de Hoy, Semana, Mes y Total).

---

## 🛠️ Instalación y Configuración Local

### 1. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/posgrado_crm?schema=public"
JWT_SECRET="super-secret-enterprise-key-change-in-production-posgrado-crm-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Base de Datos y Seed Inicial
Ejecuta las migraciones de Prisma y el script de inicialización con datos demostrativos:

```bash
# Generar cliente de Prisma
npx prisma generate

# Sincronizar esquema con la base de datos PostgreSQL
npx prisma db push

# Poblar la base de datos con usuarios y datos demo
npx prisma db seed
```

### 3. Ejecución del Servidor de Desarrollo
```bash
npm run dev
```
Accede a `http://localhost:3000` en tu navegador.

---

## 🔑 Credenciales por Defecto (Entorno Demo)

| Rol | Correo Electrónico | Contraseña |
|---|---|---|
| **Administrador** | `admin@posgrado.com` | `Admin123!` |
| **Asesor (Juan Pérez)** | `juan.perez@posgrado.com` | `Asesor123!` |
| **Asesor (María López)** | `maria.lopez@posgrado.com` | `Asesor123!` |

---

## 🌐 Despliegue en Producción (Vercel + Supabase / Neon)

### 1. Base de Datos en Supabase o Neon
1. Crea un proyecto en [Supabase](https://supabase.com) o [Neon](https://neon.tech).
2. Copia la cadena de conexión en formato PostgreSQL (`DATABASE_URL`).
3. Ejecuta `npx prisma db push` para aplicar las tablas en la base de datos remota.

### 2. Despliegue en Vercel
1. Conecta tu repositorio de GitHub a **Vercel**.
2. Define las variables de entorno en el panel de Vercel:
   * `DATABASE_URL`
   * `JWT_SECRET`
   * `NEXT_PUBLIC_APP_URL`
3. En la sección **Build & Development Settings**, verifica el comando de build: `prisma generate && next build`.
4. Haz clic en **Deploy**. ¡Tu aplicación quedará en vivo con SSL y alta disponibilidad!
