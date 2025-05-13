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
npm run dev
```

Abre el navegador en [http://localhost:3000](http://localhost:3000) para ver la app.

## 🗂️ Estructura

```
src/
├── app/              # App Router de Next.js
├── components/       # Componentes reutilizables
├── lib/              # Funciones auxiliares
└── utils/            # Helpers y constantes
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

## ✅ Tareas pendientes

- [ ] Página de inicio
- [ ] Registro/Login de usuarios
- [ ] Panel del paciente
- [ ] Reserva y cancelación de turnos
- [ ] Chat interno (próximamente)
- [ ] Encuestas y métricas

## 👥 Equipo

- Desarrolladores: Amarfil Carolina, Ibarrola Tiago, Ozuna Maria, Pereyra Maximiliano y Skidelski Dario.
