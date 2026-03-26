# 🤖 AI Context: Détaché

Este documento proporciona el contexto técnico, las reglas de codificación y los objetivos del proyecto para asistentes de IA que trabajen en esta base de código.

## 🎯 Visión General del Proyecto
Détaché es una SPA (Single Page Application) para la gestión de una academia de música.
- **Objetivo:** Facilitar la administración de clases, alumnos y reservas.
- **Idioma principal del código:** Inglés para variables/funciones, **Español** para contenido de usuario.
- **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Radix UI, Zustand, Zod.
- **API:** Django GraphQL (Apollo Client). Configurado para Server y Client Components.
- **Colores:** Centralizados en `src/lib/constants/colors.ts` y sincronizados con `globals.css`.
- **Tipografía:** Centralizada en `src/lib/constants/fonts.ts` (Montserrat).

---

## 🛠️ Reglas Técnicas y Estándares de Codificación

### 1. Next.js & React
- Usar **Server Components** por defecto. Usar `'use client'` solo cuando sea necesario para interacciones o hooks.
- Seguir el patrón de **App Router**.
- Utilizar `lucide-react` para todos los iconos.

### 2. Estilos (Tailwind CSS 4)
- No usar utilidades ad-hoc si existen tokens definidos en `globals.css` o `lib/utils`.
- Los colores de marca deben usarse mediante las variables de Tailwind (ej. `bg-primary`, `text-secondary`).
- Las fuentes deben usarse mediante `font-serif` (encabezados) y `font-sans` (cuerpo/UI).
- Mantener un diseño **Premium & Moderno**: gradientes suaves, bordes redondeados (`rounded-xl`), sombras sutiles y modo oscuro.
- Usar la utilidad `cn()` de `@/lib/utils` para la unión condicional de clases.

### 3. API & GraphQL (Apollo Client)
- **Endpoint:** Definido en `NEXT_PUBLIC_GRAPHQL_ENDPOINT` (en `.env.local`). **Importante:** Debe terminar en `/` (ej. `/graphql/`) para evitar errores de redirección en Django.
- **RSC (Server Components):** Usar `getClient()` de `@/lib/apollo-client` para consultas directas en servidores.
- **Client Components:** Usar hooks estándar de Apollo (ej. `useQuery`) dentro del `ApolloWrapper`.
- **Estructura:** Queries en `src/graphql/queries/`, Mutations en `src/graphql/mutations/`.
- **Tipado:** Usar TypeScript para los resultados de las consultas.

### 4. Gestión de Estado (Zustand)
- El estado global se encuentra en `src/store/`.
- Crear stores pequeños y específicos (ej. `useUserStore`, `useBookingStore`) en lugar de uno monolítico.

### 4. Validación y Formularios
- Usar `react-hook-form` con el resolver de `zod`.
- Definir los esquemas de Zod en `src/lib/validations/` si son reutilizables.

---

## 📊 Entidades de Datos

### Usuario (`User`)
- ID, Nombre, Email, Rol (`admin`, `teacher`, `student`).
- Horario de preferencia (solo para `student`).

### Reserva (`Booking`)
- ID, `studentId`, `teacherId`, `date`, `slot` (hora), `status` (`pending`, `confirmed`, `cancelled`).

### Clase (`Lesson`)
- Definición de horarios fijos o recurrentes.

---

## 📁 Estructura de Archivos Cruciales
- `src/app/layout.tsx`: Configuración global y providers.
- `src/app/globals.css`: Definiciones de temas y tokens de Tailwind 4.
- `src/components/ui/`: Componentes base reutilizables.
- `src/lib/utils.ts`: Utilidades comunes.

---

## 🎨 Guía de Diseño (Wow Factor)
- **Paleta:** Primario en tonos elegantes (ej. Indigo o Slate), fondos limpios.
- **Tipografía:** Inter (Sans-serif).
- **Animaciones:** Usar micro-interacciones en botones y transiciones suaves de página.

---

**IMPORTANTE:** Al generar nuevo código, prioriza la legibilidad y sigue estrictamente el sistema de tipos de TypeScript.
