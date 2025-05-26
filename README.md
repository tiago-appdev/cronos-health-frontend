# Cronos Health — Frontend

Este es el frontend del sistema de gestión de turnos médicos **Cronos Health**, desarrollado con **Next.js**, **TypeScript**, **TailwindCSS** y **Shadcn UI**.

## 🚀 Tecnologías Utilizadas

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

## 📦 Instalación

```bash
# Entrar a la carpeta
cd frontend

# Instalar dependencias
npm install
```

> Si usás `pnpm`, también es compatible.

## 🧪 Desarrollo

```bash
# Iniciar el servidor de desarrollo
npm run dev

# Ejecutar tests E2E
npm run test:e2e

# Ejecutar tests E2E en modo UI
npm run test:e2e:ui
```

Abre el navegador en [http://localhost:3000](http://localhost:3000) para ver la app.

Los tests E2E utilizan Playwright y pueden ser ejecutados en modo headless o con interfaz gráfica.

## 🗂️ Estructura

```
src/
├── app/              # App Router de Next.js
│   ├── calendar/     # Página del calendario
│   ├── dashboard/    # Panel principal
│   ├── login/        # Página de inicio de sesión
│   └── register/     # Página de registro
├── components/       # Componentes reutilizables
│   ├── ui/          # Componentes de interfaz
│   └── protected-route.tsx  # Componente para rutas protegidas
├── contexts/        # Contextos de React
│   └── auth-context.tsx    # Contexto de autenticación
├── lib/             # Funciones auxiliares
└── tests/           # Tests E2E con Playwright
    └── e2e/         # Pruebas end-to-end
```

## 🧩 Shadcn UI

Este proyecto utiliza **Shadcn UI** para construir componentes accesibles y modernos. Podés agregar un nuevo componente, por ejemplo:

```bash
npx shadcn-ui@latest add button
```

## 🔌 Comunicación con Backend

Las llamadas a la API se realizarán mediante `Axios`. El endpoint base se puede configurar en una variable de entorno:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## ✅ Estado del Proyecto

- [x] Configuración inicial del proyecto
- [x] Implementación de autenticación
- [x] Página de inicio de sesión
- [x] Página de registro
- [x] Panel de usuario (Dashboard)
- [x] Calendario de turnos
- [x] Formulario de reserva de turnos
- [ ] Chat interno (próximamente)
- [ ] Encuestas y métricas de satisfacción
- [ ] Notificaciones en tiempo real

## 👥 Equipo

- Desarrolladores: Amarfil Carolina, Ibarrola Tiago, Ozuna Maria, Pereyra Maximiliano y Skidelski Dario.
