# 🎻 Détaché

**Détaché** es una plataforma web moderna diseñada para la gestión integral de una academia de música. La aplicación permite administrar usuarios, coordinar horarios y gestionar reservas de clases, además de ofrecer una interfaz atractiva e informativa para captar a nuevos estudiantes.

---

## 🚀 Características Principales

### 👥 Gestión de Usuarios
- Registro y autenticación segura para alumnos y profesores.
- Perfiles personalizados con historial de progreso y próximas clases.
- Panel de administración para la gestión de roles y permisos.

### 📅 Sistema de Reservas y Horarios
- Visualización de disponibilidad en tiempo real mediante un calendario interactivo.
- Sistema de reserva de horas sencillo y rápido.
- Gestión de cancelaciones y reprogramaciones con notificaciones automáticas.

### ℹ️ Portal Informativo
- Landing page moderna con información sobre los cursos y metodologías.
- Sección de profesores y sus especialidades.
- Blog o sección de noticias para mantener informada a la comunidad.

---

## 🛠️ Stack Tecnológico

La aplicación está construida con las tecnologías más modernas para ofrecer un rendimiento óptimo y una experiencia de usuario excepcional:

- **Framework:** [Next.js 16](https://nextjs.org/) (React 19)
- **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Componentes UI:** [Radix UI](https://www.radix-ui.com/)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Gestión de Estado:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Formularios:** React Hook Form + Zod (Validación)
- **Lenguaje:** TypeScript

---

## 📂 Estructura del Proyecto

```text
src/
├── app/              # Rutas y páginas de Next.js (App Router)
├── components/       # Componentes reutilizables de UI y Layout
│   ├── layout/       # Header, Footer, etc.
│   └── ui/           # Componentes base (Botones, Inputs, etc.)
├── hooks/            # Hooks personalizados de React
├── lib/              # Utilidades y configuraciones (Utils, API)
└── store/            # Gestión de estado global con Zustand
```

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1. **Clona el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd detache
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

4. **Construye para producción:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🎨 Diseño y UX

Détaché utiliza una estética premium con soporte para modo claro y oscuro, tipografía moderna (Inter) y micro-animaciones para asegurar que los usuarios tengan una experiencia fluida y profesional desde el primer contacto.

---

Desarrollado con ❤️ para la educación musical.
