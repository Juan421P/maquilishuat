# Maquilishuat S.A. de C.V. — Tienda en línea de agua purificada

Proyecto de tienda en línea completo: venta de agua purificada (garrafones, botellas, packs) con panel administrativo, catálogo público y una app móvil dedicada a clientes.

## Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Funcionalidades principales](#funcionalidades-principales)
- [Roles y autenticación](#roles-y-autenticación)

## Arquitectura

El proyecto está dividido en **3 aplicaciones independientes**, cada una con su propio `package.json`:

| App | Descripción | Puerto (dev) |
|---|---|---|
| `backend/` | API REST (Express + MongoDB/Mongoose) | `4000` |
| `frontend/` | Sitio público (catálogo, carrito) + panel administrativo (React + Vite) | `5173` |
| `mobile-app/` | App exclusiva para clientes, simulada dentro de un frame de teléfono (React + Vite) | `5174`* |

*El puerto exacto lo asigna Vite; revisa la terminal al levantar el proyecto.

`frontend` y `mobile-app` consumen la misma API de `backend` a través de `/api` (proxy de Vite en desarrollo).

## Tecnologías

**Backend**
- Express 5 + Mongoose (MongoDB)
- JWT (`jsonwebtoken`) + cookies httpOnly para sesiones
- `bcryptjs` para hash de contraseñas
- `multer` + `multer-storage-cloudinary` para subir imágenes de productos
- `nodemailer` para envío de correos (verificación de cuenta y recuperación de contraseña)
- `helmet`, `cors`, `express-rate-limit` para endurecer la API

**Frontend (web)**
- React 19 + React Router 7
- Vite
- `react-toastify` para notificaciones
- `lucide-react` / `@iconify/react` para iconografía

**Mobile-app**
- React 18 + Vite (sin librería de UI externa, componentes propios)
- `react-toastify`

## Estructura de carpetas

```
maquilishuat/
├── backend/
│   ├── index.js            # entry point (arranca el servidor)
│   ├── app.js               # configuración de Express (middlewares globales)
│   ├── database.js          # conexión a MongoDB
│   ├── config.js            # lectura de variables de entorno
│   └── src/
│       ├── controllers/     # lógica de negocio por entidad
│       ├── routers/         # definición de rutas + middlewares de cada entidad
│       ├── models/          # esquemas de Mongoose
│       ├── middleware/       # auth (JWT), manejo de errores
│       └── utils/           # configuración de Cloudinary, etc.
├── frontend/
│   └── src/
│       ├── Pages/            # páginas públicas, de auth y del panel admin
│       ├── components/       # componentes reutilizables (Modal, StatusBadge, PublicNav, etc.)
│       ├── context/          # AuthContext, ThemeContext, NotifContext
│       ├── hooks/            # hooks propios (useLocalStorage, useSearch)
│       ├── services/         # cliente HTTP hacia la API (api.js)
│       └── Layout/           # layout del panel admin
└── mobile-app/
    └── src/
        ├── pages/            # pantallas del flujo de cliente
        ├── components/       # Btn, Field, Alert, ProductCard, ProductReviews...
        ├── layout/           # PhoneShell (frame de teléfono), AppBar, BottomNav
        ├── context/          # AuthContext
        └── services/         # cliente HTTP hacia la API
```

## Instalación y ejecución

Requiere Node.js 18+ y una base de datos MongoDB (local o Atlas).

### 1. Backend

```bash
cd backend
npm install
# crear un archivo .env (ver sección de variables de entorno)
npm run dev
```

El servidor queda escuchando en `http://localhost:4000`.

### 2. Frontend (panel admin + tienda pública)

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Vite hace proxy de `/api` hacia el backend.

### 3. Mobile-app (cliente)

```bash
cd mobile-app
npm install
npm run dev
```

Se abre en el navegador dentro de un frame de teléfono decorativo (en pantallas de escritorio) o a pantalla completa (en un dispositivo móvil real).

## Variables de entorno

El backend lee estas variables desde `backend/.env` (no se versiona, cada quien crea el suyo):

| Variable | Descripción |
|---|---|
| `DB_URI` | Cadena de conexión a MongoDB |
| `JWT_SECRET_KEY` | Secreto usado para firmar los JSON Web Tokens de sesión |
| `USER_EMAIL` | Cuenta de correo (Gmail) usada para enviar los códigos de verificación/recuperación |
| `USER_PASSWORD` | Contraseña de aplicación de esa cuenta de correo |
| `FRONTEND_URL` | URL pública del frontend (usada en enlaces de correos) |
| `ADDRESS_API` | (opcional) API externa de direcciones/geocodificación |
| `CLOUDINARY_CLOUD_NAME` | Nombre de la cuenta de Cloudinary |
| `CLOUDINARY_API_KEY` | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary |

## Funcionalidades principales

- **Catálogo público** con búsqueda y filtro por categoría, sin necesidad de iniciar sesión.
- **Carrito de compras** persistente durante la sesión del navegador (agregar, quitar, actualizar cantidades).
- **Checkout protegido**: solo se puede confirmar un pedido con sesión iniciada; el backend valida stock disponible y asocia el pedido al cliente autenticado.
- **Registro con verificación por correo**: la cuenta no se crea hasta confirmar el código enviado al email.
- **Recuperación de contraseña** en 3 pasos (solicitar código → verificar código → nueva contraseña).
- **Reseñas y valoraciones de productos**: un cliente solo puede calificar (1-5 estrellas + comentario) productos que efectivamente haya comprado.
- **Historial de pedidos del cliente** ("Mis pedidos"), disponible tanto en el sitio web como en la app móvil.
- **Panel administrativo** (protegido, solo rol Admin): gestión de productos, clientes, pedidos, informes y configuración.
- **Notificaciones** con `react-toastify` para confirmar acciones (crear/editar/eliminar, login, checkout) en vez de `alert()` nativos.
- **Diseño responsive**: sidebar del panel admin colapsable en móvil, tablas con scroll horizontal, modales adaptados a pantallas pequeñas.

## Roles y autenticación

Existen dos roles, `Client` y `Admin`, resueltos por un único endpoint de login (`POST /api/login`): el backend busca las credenciales primero en la colección de clientes y luego en la de administradores, y firma el JWT con el rol correspondiente.

- El JWT se entrega como cookie httpOnly (`authCookie`) y también se informa el `userType` en la respuesta para que el frontend sepa a dónde redirigir.
- Las rutas del panel admin (`/dashboard`, `/productos`, `/clientes`, `/pedidos`, etc.) están protegidas en el frontend con un componente `ProtectedRoute` y, del lado del backend, con middlewares (`verifyToken`, `requireRole`) que devuelven `401`/`403` si la petición no trae una sesión válida con el rol correcto.
- Un cliente solo puede editar/eliminar su propio registro (o un admin, cualquiera); un admin puede administrar todo.
