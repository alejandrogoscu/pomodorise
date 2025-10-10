# 🕒 PomodoRise – Productivity Level Up

**PomodoRise** es una aplicación **Full Stack** desarrollada íntegramente en **TypeScript**, diseñada para ayudarle a mejorar su productividad mediante la técnica **Pomodoro**, la **gestión de tareas** y la **gamificación del progreso personal**.

Este proyecto está orientado al aprendizaje práctico de TypeScript en frontend y backend, siguiendo **principios de Clean Code, arquitectura escalable y buenas prácticas profesionales**.

---

## 📚 Índice

1. [Descripción](#-descripción)
2. [Tecnologías](#-tecnologías)
3. [Estructura del monorepo](#-estructura-del-monorepo)
4. [Características principales](#-características-principales)
5. [Instalación y ejecución](#-instalación-y-ejecución)
6. [Testing](#-testing)
7. [Documentación](#-documentación)
8. [Guía de aprendizaje TypeScript](#-guía-de-aprendizaje-typescript)
9. [Buenas prácticas](#-buenas-prácticas)
10. [Licencia](#-licencia)

---

## 🧠 Descripción

**PomodoRise** le permite:

- Crear una cuenta de usuario.
- Configurar su duración de trabajo y descansos.
- Añadir tareas o rutinas a completar durante las sesiones.
- Escuchar música (Spotify o pistas locales).
- Completar sesiones Pomodoro y ganar puntos.
- Subir de nivel según la constancia.
- Visualizar su progreso con gráficos e indicadores de productividad.

Todo ello en un **entorno profesional, educativo y moderno**, creado para comprender y dominar TypeScript en un proyecto real.

---

## ⚙️ Tecnologías

### 🔹 Backend

- Node.js + Express
- TypeScript moderno
- MongoDB + Mongoose
- JWT + bcrypt
- Zod para validaciones
- Jest para tests
- Swagger UI para documentación API

### 🔹 Frontend

- React + TypeScript + Vite
- CSS moderno (Grid + Flexbox, sin Tailwind)
- React Router DOM
- React Hook Form
- Axios
- Recharts para estadísticas
- Jest + React Testing Library

### 🔹 Shared

- Tipos e interfaces comunes (`User`, `Task`, `Session`, etc.)
- Enums, DTOs y helpers reutilizables

---

## 🧱 Estructura del monorepo

```
pomodorise/
├── packages/
│   ├── backend/      → API REST con Express + TypeScript + MongoDB
│   ├── frontend/     → React + TypeScript + CSS
│   ├── shared/       → Tipos y utilidades compartidas
├── pnpm-workspace.yaml
├── package.json      → Configuración raíz de workspaces
├── tsconfig.base.json     → Config base de TypeScript
└── README.md         → Este archivo
```

### 📦 Gestor de paquetes recomendado:

**pnpm** (por rendimiento y gestión eficiente de workspaces)

---

## 🚀 Características principales

| Categoría                   | Descripción                                       |
| --------------------------- | ------------------------------------------------- |
| 🎯 **Pomodoro Timer**       | Inicia, pausa y reinicia sesiones configurables   |
| 🧾 **Gestión de tareas**    | Añade, marca y elimina tareas por sesión          |
| 🕹️ **Gamificación**         | Gana puntos y sube de nivel según tu constancia   |
| 🎧 **Música integrada**     | Selecciona playlist de Spotify o usa música local |
| 📊 **Dashboard**            | Visualiza tu progreso y estadísticas              |
| 👤 **Autenticación segura** | Registro y login con JWT                          |
| ⚡ **API documentada**      | Swagger UI disponible en `/api-docs`              |
| 🧪 **Testing completo**     | Pruebas unitarias e integradas con Jest           |
| 🧩 **Código educativo**     | Comentarios explicativos y tipado estricto        |

---

## 🛠️ Instalación y ejecución

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/<usuario>/pomodorise.git
cd pomodorise
```

### 2️⃣ Instalar dependencias

```bash
pnpm install
```

### 3️⃣ Variables de entorno

Crear un archivo `.env` en `/packages/backend` con las siguientes claves:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pomodorise
JWT_SECRET=supersecret
SPOTIFY_CLIENT_ID=tu_id
SPOTIFY_CLIENT_SECRET=tu_secreto
```

### 4️⃣ Ejecutar en modo desarrollo

```bash
pnpm dev
```

Esto lanzará tanto el backend como el frontend simultáneamente.

---

## 🧪 Testing

Ejecutar los tests unitarios y de integración:

```bash
pnpm test
```

Cada paquete (`backend`, `frontend`) contiene su propia configuración de Jest.
El objetivo es alcanzar **≥ 80% de cobertura** en controladores, servicios y componentes.

---

## 📘 Documentación

- **API REST:** Documentada con **Swagger UI** en `/api-docs`.
- **Código:** Comentarios JSDoc para cada módulo, clase y función.
- **Estructura educativa:** Cada bloque de código importante explica su propósito y relación con los principios de TypeScript.

---

## 📖 Guía de aprendizaje TypeScript

El proyecto sirve como guía para:

- Comprender el tipado estricto en TypeScript.
- Diferenciar interfaces, types y clases.
- Aplicar genéricos, enums y DTOs.
- Separar responsabilidades y definir arquitecturas limpias.
- Escribir código mantenible y seguro.

> Cada módulo está diseñado para enseñar un concepto clave de TypeScript aplicado en contexto real.

---

## 🧹 Buenas prácticas aplicadas

- ✅ **Clean Architecture** (Controllers / Services / Repositories).
- ✅ **Principios SOLID**.
- ✅ **Nombres semánticos y consistentes**.
- ✅ **Sin duplicaciones** (DRY).
- ✅ **Funciones pequeñas y puras**.
- ✅ **Error handling centralizado**.
- ✅ **Documentación JSDoc + Swagger**.
- ✅ **Tests desde el inicio (TDD opcional)**.
- ✅ **Linter + Formateo automático (ESLint + Prettier)**.

---

## 🗺️ Roadmap

| Fase                        | Descripción                            |
| --------------------------- | -------------------------------------- |
| **1️⃣ Setup monorepo**       | Estructura base, dependencias, configs |
| **2️⃣ Backend MVP**          | Modelos, controladores, autenticación  |
| **3️⃣ Frontend MVP**         | Páginas principales y componentes      |
| **4️⃣ Integración API**      | Flujo completo usuario–tareas–sesiones |
| **5️⃣ Gamificación**         | Puntos, niveles y progreso             |
| **6️⃣ Dashboard**            | Estadísticas con gráficos              |
| **7️⃣ Tests y refinamiento** | Cobertura y documentación final        |

---

## 📜 Licencia

MIT © 2025 — Desarrollado por **Alejandro Goscu**
Creado como proyecto formativo de **Full Stack TypeScript**, con el objetivo de **aprender, enseñar y demostrar buenas prácticas profesionales**.
