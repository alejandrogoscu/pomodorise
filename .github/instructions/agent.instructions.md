---
applyTo: '**'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or
reviewing changes.

# 🤖 AGENT.MD — Guía didáctica y operativa completa para **PomodoRise**

> **Propósito:** guía exhaustiva, pedagógica y paso-a-paso para desarrollar **PomodoRise** — una aplicación Full‑Stack
> en **TypeScript** con enfoque didáctico (backend, frontend, shared, infra, testing).  
> **Nota de estilo:** este documento está pensado para enseñar _toda_ la pila (no sólo JavaScript): TypeScript,
> Node/Express, MongoDB, React, testing, Docker, CI, etc. Cada fase está dividida en subfases pequeñas
> (3–4 archivos máximo) para facilitar el trabajo práctico y los commits frecuentes.

---

## 🎯 Propósito del proyecto

**PomodoRise** es una aplicación **Full Stack en TypeScript** que combina un **Pomodoro Timer** con **gestión de
tareas y gamificación**.  
Su doble objetivo es:

1. **Aprender y practicar el stack completo moderno** (frontend + backend + infra + testing).
2. **Entender los fundamentos** de la programación Full Stack con explicaciones, analogías y ejemplos.
3. Expansión pedagógica para **toda la pila** (DB, API, frontend, infra, CI).
4. Énfasis en **configuración inicial** y checklists para evitar problemas posteriores.
5. Recordatorios para principiantes: `.gitignore`, `public/images`, `README`, `LICENSE`, `env.example`.
6. Fases divididas en **subfases pequeñas** (cada una crea/modifica máximo 3–4 archivos).
7. Después de cada subfase se propone **un commit** y **comandos de verificación** (lint, dev, tests).
8. Instrucciones para **documentar el código con comentarios** y ejemplos de JSDoc/TSdoc.
9. Recomendaciones concretas de comandos (`pnpm`) y scripts para comprobar que todo funciona.

---

## 🧭 Índice general

1. Prerrequisitos con explicaciones
2. Glosario técnico esencial
3. Del HTML/CSS/JS al Full Stack — puente conceptual
4. Tecnologías y herramientas del proyecto
5. Estructura del monorepo
6. Buenas prácticas, Clean Code y organización
7. Fases de desarrollo divididas en subfases (con commits y tests)
8. Errores comunes y consejos pedagógicos
9. Recursos de aprendizaje recomendados
10. Troubleshooting (solución de problemas)
11. Flujo completo de trabajo
12. Conclusión

---

## 🧰 1. Prerrequisitos con explicaciones

| Herramienta    | Qué es                                                | Por qué la usamos                     |
| -------------- | ----------------------------------------------------- | ------------------------------------- |
| **Node.js**    | Entorno para ejecutar JavaScript fuera del navegador. | Permite construir el backend.         |
| **pnpm**       | Gestor de dependencias rápido y eficiente.            | Ideal para monorepositorios.          |
| **Git**        | Control de versiones.                                 | Permite guardar cambios y colaborar.  |
| **VSCode**     | Editor de código con soporte para TypeScript.         | Mejora la productividad.              |
| **MongoDB**    | Base de datos NoSQL.                                  | Almacena usuarios, tareas y sesiones. |
| **TypeScript** | Superconjunto de JS con tipado estático.              | Reduce errores y mejora comprensión.  |

> 💡 Consejo: Antes de comenzar, verifique que puede ejecutar `node -v`, `pnpm -v` y `git --version` sin errores.

---

## 📘 2. Glosario técnico esencial

| Término        | Definición simple                                                                    |
| -------------- | ------------------------------------------------------------------------------------ |
| **Monorepo**   | Un único repositorio con varios proyectos (backend, frontend, shared).               |
| **Middleware** | Función que intercepta peticiones antes del controlador (autenticación, validación). |
| **CI/CD**      | Integración y despliegue continuos automatizados.                                    |
| **CRUD**       | Create, Read, Update, Delete — operaciones básicas de datos.                         |
| **Endpoint**   | Ruta de una API (ej. `/api/tasks`).                                                  |
| **Hook**       | Función especial de React para manejar estado o lógica.                              |
| **Commit**     | Registro de un cambio en el historial de Git.                                        |

---

## 🌉 3. Del HTML/CSS/JS al Full Stack — puente conceptual

Si viene del desarrollo frontend básico (HTML, CSS y JS), el salto a Full Stack es natural:

- **Frontend:** sigue siendo JS, pero con React y componentes reutilizables.
- **Backend:** es el cerebro que procesa los datos y responde al cliente.
- **Base de datos:** almacena información de manera persistente.

🧠 **Analogía:**

- El **frontend** es el camarero.
- El **backend** es la cocina.
- La **base de datos** es la despensa.

---

## ⚙️ 4. Tecnologías y herramientas del proyecto

### 🧠 Backend

- **Node.js + Express** → servidor API.
- **MongoDB + Mongoose** → base de datos y modelos.
- **JWT + bcrypt** → autenticación y seguridad.
- **Zod** → validación de datos.
- **Jest** → testing unitario.
- **Swagger UI** → documentación interactiva.

### 🎨 Frontend

- **React + TypeScript + Vite** → interfaz moderna.
- **Axios** → comunicación HTTP.
- **React Router DOM** → rutas internas.
- **React Hook Form** → formularios.
- **Recharts** → visualización de estadísticas.
- **Jest + React Testing Library** → pruebas de componentes.

### 🧩 Shared

- Tipos, enums e interfaces compartidas (`User`, `Task`, `Session`).
- Utilidades y DTOs para comunicación segura frontend-backend.

---

## 🧱 5. Estructura del monorepo

```
pomodorise/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   ├── package.json
│   │   └── public/images
│   ├── frontend/
│   │   ├── src/
│   │   └── package.json
│   └── shared/
│       ├── src/
│       └── package.json
├── pnpm-workspace.yaml
├── package.json        # scripts de conveniencia (pnpm -w)
├── tsconfig.base.json
├── .gitignore
└── README.md
```

> 🔰 Consejo: Cree la carpeta `public/images` tanto en frontend como en backend si planea manejar imágenes.

---

## 🧩 6. Buenas prácticas, Clean Code y organización

**Principios clave:**

1. Sencillez antes que complejidad.
2. Funciones pequeñas, puras y con nombres descriptivos.
3. Evitar duplicación (DRY).
4. Separación de responsabilidades (SoC).
5. Código autoexplicativo y comentado.
6. Testing y documentación desde el inicio.
7. Comentarios pedagógicos en código que expliquen por qué y no sólo qué.
8. Ramas: `main` (producción), `develop` (integración), features por ticket.
9. Commits: convención `type(scope): short description` (ej. `feat(timer): add start/pause`).
10. Documentación inline: JSDoc / TSDoc en funciones y módulos.
11. Tests desde el primer día (unit + integration + e2e opcional).

**Estructura backend recomendada:**

```
src/
├── config/
├── controllers/
├── models/
├── routes/
├── services/
├── middlewares/
└── tests/
```

**Estructura frontend recomendada:**

```
src/
├── components/
├── hooks/
├── pages/
├── context/
├── services/
└── tests/
```

---

## 🚀 7. Fases de desarrollo (divididas en subfases)

Cada fase se divide en **subfases de máximo 2–3 archivos**.  
Al final de cada subfase:

1. Hacer commit.
2. Ejecutar `pnpm run lint`, `pnpm run dev`, `pnpm run test`.
3. Verificar que todo funcione antes de seguir.

---

## Configuración inicial — checklist imprescindible (antes de escribir código)

1. Clonar repositorio y moverse a la raíz:
   ```bash
   git clone <repo-url>
   cd pomodorise
   ```
2. Crear `.gitignore` en la raíz (ejemplo profesional):
   ```text
   node_modules/
   .env
   .env.local
   dist/
   .DS_Store
   coverage/
   .idea/
   .vscode/
   etc..
   ```
3. Crear `pnpm-workspace.yaml` en la raíz:
   ```yaml
   packages:
     - 'packages/*'
   ```
4. Crear `tsconfig.base.json` o `tsconfig.json` base en la raíz para heredar en paquetes.
5. Crear `env.example` con variables necesarias (DB_URI, JWT_SECRET, PORT, etc.). **No** subir `.env`.
6. Crear carpetas comunes:
   - `packages/backend/public/images` (si aplica).
   - `packages/frontend/public/images` (para assets inciales).
7. Inicializar git si hace falta y primer commit:
   ```bash
   git init
   git add -A
   git commit -m "chore: initialize repo, add gitignore, pnpm-workspace and env.example"
   ```

> **Consejo pedagógico:** documente en `README.md` cada paso que realice; eso ayuda a los alumnos a
> entender la secuencia.

---

# Desarrollo por fases (cada fase → subfases pequeñas)

> **Regla:** cada _subfase_ implica máximo **3–4 archivos** a crear/modificar. Después de cada subfase: 1) verificación
> con comandos; 2) commit ; 3) pasar a la siguiente.

---

## Fase 0 — Preparación del entorno (2 subfases)

### Subfase 0.1 — Inicialización del monorepo (archivos: 3)

- Crear/editar:
  1. `pnpm-workspace.yaml`
  2. `package.json` (raíz con scripts convenientes)
  3. `tsconfig.base.json`
- Commit sugerido:
  ```
  git add pnpm-workspace.yaml package.json tsconfig.base.json
  git commit -m "chore(monorepo): setup pnpm workspace and base tsconfig"
  ```
- Cómo verificar:
  ```bash
  pnpm -w install
  pnpm -w -v   # verifica que pnpm funciona
  ```
- Notas pedagógicas:
  - Explique `workspaces` y por qué centralizar dependencias acelera iteraciones.
  - Documentar en README la estructura de workspaces.

### Subfase 0.2 — Archivos de configuración y reglas (archivos: 4)

- Crear/editar:
  1. `.gitignore`
  2. `.editorconfig` (opcional)
  3. `env.example`
  4. `README.md` (esqueleto)
- Commit sugerido:
  ```
  git add .gitignore env.example README.md .editorconfig
  git commit -m "chore: add gitignore, env.example and editorconfig"
  ```
- Verificación:
  - Asegurarse de que `.env` no está versionado: `git status` no debe listar `.env`.
  - Abrir README en el editor; revisar que está claro.

---

## Fase 1 — Backend básico (3 subfases)

### Subfase 1.1 — Inicializar paquete backend y dependencias mínimas (archivos: 3)

- Crear/editar:
  1. `packages/backend/package.json` (scripts: `dev`, `build`, `lint`, `test`)
  2. `packages/backend/tsconfig.json` (extendiendo tsconfig.base.json)
  3. `packages/backend/src/index.ts` (servidor Express mínimo)
- Commit sugerido:
  ```
  git add packages/backend
  git commit -m "feat(backend): initialize backend package with basic server"
  ```
- Verificación:
  ```bash
  pnpm -w -F backend install
  pnpm -w -F backend run dev   # debería iniciar server con nodemon/ts-node
  ```
- Puntos docentes:
  - Explique la diferencia entre `ts-node` y `tsc` + `node` en producción.
  - Muestre cómo leer variables de `process.env` de forma tipada (crear `config/index.ts` más adelante).

### Subfase 1.2 — Conexión a la base de datos y modelo User (archivos: 3)

- Crear/editar:
  1. `packages/backend/src/config/db.ts` (conexión a MongoDB)
  2. `packages/backend/src/models/User.ts` (Mongoose schema / TypeScript interface)
  3. `packages/backend/src/controllers/authController.ts` (registro/login simple)
- Commit sugerido:
  ```
  git add packages/backend/src/config packages/backend/src/models packages/backend/src/controllers
  git commit -m "feat(backend): add mongo connection and User model + auth controller"
  ```
- Verificación:
  ```bash
  # Asegúrese de que DB_URI en .env/local apunta a su Mongo local o Atlas.
  pnpm -w -F backend run dev
  # Probar endpoints con curl / httpie / Postman:
  curl -X POST http://localhost:4000/api/auth/register -d '{"email":"test@t.com","password":"pass123"}' -H "Content-Type: application/json"
  ```
- Puntos docentes:
  - Explicar validaciones con Zod vs Joi.
  - Mostrar hashing con bcrypt y por qué no almacenar contraseñas en claro.

### Subfase 1.3 — Middleware de autenticación y tests básicos (archivos: 4)

- Crear/editar:
  1. `packages/backend/src/middlewares/auth.ts`
  2. `packages/backend/src/routes/auth.ts`
  3. `packages/backend/src/tests/auth.test.ts` (Jest + supertest)
  4. `packages/backend/jest.config.ts`
- Commit sugerido:
  ```
  git add packages/backend/src/middlewares packages/backend/src/routes packages/backend/src/tests
  git commit -m "test(backend): add auth middleware and basic auth tests"
  ```
- Verificación:
  ```bash
  pnpm -w -F backend run lint    # si lint está configurado
  pnpm -w -F backend run test
  pnpm -w -F backend run dev
  ```
- Puntos docentes:
  - Explicar mocked DB vs test DB real y el uso de `mongodb-memory-server` para tests de integración.

---

## Fase 2 — Shared (tipos y utilidades) (1 subfase)

### Subfase 2.1 — Tipos compartidos y utilidades (archivos: 3)

- Crear/editar:
  1. `packages/shared/src/types.ts` (`User`, `Task`, `Session`)
  2. `packages/shared/src/utils/score.ts` (cálculo de puntos)
  3. `packages/shared/package.json`
- Commit sugerido:
  ```
  git add packages/shared
  git commit -m "feat(shared): add shared types and scoring util"
  ```
- Verificación:
  - Desde backend y frontend, importar tipos con paths TypeScript (asegúrese de `paths` en tsconfig).
  - Compilar TypeScript a nivel monorepo: `pnpm -w -r run build` (si se configura build).

---

## Fase 3 — Frontend básico (3 subfases)

### Subfase 3.1 — Inicializar app Vite + React + TS (archivos: 3)

- Crear/editar:
  1. `packages/frontend/package.json`
  2. `packages/frontend/tsconfig.json`
  3. `packages/frontend/src/main.tsx` (punto de entrada)
- Commit sugerido:
  ```
  git add packages/frontend
  git commit -m "feat(frontend): initialize vite react ts app"
  ```
- Verificación:
  ```bash
  pnpm -w -F frontend install
  pnpm -w -F frontend run dev   # debería lanzar Vite en localhost:5173
  ```
- Puntos docentes:
  - Explicar el flujo de peticiones desde React a backend (CORS, proxies en desarrollo).

### Subfase 3.2 — Estructura de componentes y rutas (archivos: 4)

- Crear/editar:
  1. `packages/frontend/src/pages/Login.tsx`
  2. `packages/frontend/src/pages/Dashboard.tsx`
  3. `packages/frontend/src/components/Timer.tsx`
  4. `packages/frontend/src/services/api.ts` (axios instance + interceptors)
- Commit sugerido:
  ```
  git add packages/frontend/src/pages packages/frontend/src/components packages/frontend/src/services
  git commit -m "feat(frontend): add basic pages, Timer component and axios service"
  ```
- Verificación:
  ```bash
  pnpm -w -F frontend run dev
  # Probar login UI y ver en consola requests hacia backend
  ```
- Puntos docentes:
  - Explicar hooks: separación de lógica (useTimer, useTasks).
  - Mostrar ejemplo de formularios con React Hook Form y validación.

### Subfase 3.3 — Integración con backend y tests (archivos: 3)

- Crear/editar:
  1. `packages/frontend/src/context/AuthContext.tsx`
  2. `packages/frontend/src/pages/Settings.tsx`
  3. `packages/frontend/src/tests/Timer.test.tsx` (React Testing Library)
- Commit sugerido:
  ```
  git add packages/frontend/src/context packages/frontend/src/pages packages/frontend/src/tests
  git commit -m "test(frontend): add auth context, settings page and Timer tests"
  ```
- Verificación:
  ```bash
  pnpm -w -F frontend run test
  pnpm -w -F frontend run lint
  pnpm -w -F frontend run dev
  ```
- Puntos docentes:
  - Explicar mocking de fetch/axios en tests (msw, jest mocks).
  - Cómo persistir token en localStorage con seguridad (no almacenar refresh tokens sin protección).

---

## Fase 4 — Lógica de negocio y gamificación (2 subfases)

### Subfase 4.1 — Sesiones y puntos (archivos: 3)

- Crear/editar:
  1. `packages/backend/src/models/Session.ts`
  2. `packages/backend/src/services/sessionService.ts`
  3. `packages/shared/src/utils/score.ts` (o refactor si ya existe)
- Commit sugerido:
  ```
  git add packages/backend/src/models packages/backend/src/services packages/shared/src/utils
  git commit -m "feat(biz): add Session model and session service for scoring"
  ```
- Verificación:
  - Tests unitarios para `sessionService` y llamadas desde API: `pnpm -w -F backend run test`.

### Subfase 4.2 — Dashboard con estadísticas (archivos: 3)

- Crear/editar:
  1. `packages/frontend/src/pages/Dashboard.tsx` (con Recharts)
  2. `packages/frontend/src/services/stats.ts` (llamadas a API)
  3. `packages/backend/src/controllers/statsController.ts`
- Commit sugerido:
  ```
  git add packages/frontend/src/pages packages/frontend/src/services packages/backend/src/controllers
  git commit -m "feat(dashboard): add stats endpoints and charts in frontend"
  ```
- Verificación:
  ```bash
  pnpm -w -F backend run dev
  pnpm -w -F frontend run dev
  # Probar dashboard y verificar gráficos cargan datos correctos
  ```

---

## Fase 5 — Infraestructura mínima y despliegue local (2 subfases)

### Subfase 5.1 — Dockerización backend (archivos: 3)

- Crear/editar:
  1. `packages/backend/Dockerfile`
  2. `docker-compose.yml` (en la raíz, para DB + backend)
  3. `.dockerignore`
- Commit sugerido:
  ```
  git add docker-compose.yml packages/backend/Dockerfile .dockerignore
  git commit -m "chore(docker): add docker-compose and backend Dockerfile"
  ```
- Verificación:
  ```bash
  docker compose up --build
  # verificar que backend conecta a Mongo y responde a /health
  ```

### Subfase 5.2 — CI básico (archivos: 3)

- Crear/editar:
  1. `.github/workflows/ci.yml` (instalar deps, lint, test)
  2. `packages/backend/.github/workflows/test-backend.yml` (opcional)
  3. `packages/frontend/.github/workflows/test-frontend.yml` (opcional)
- Commit sugerido:
  ```
  git add .github
  git commit -m "ci: add CI workflow to run lint and tests"
  ```
- Verificación:
  - Push a rama remota y verificar ejecución de workflow en GitHub Actions.

---

## Documentar y comentar código (ejemplos y buenas prácticas)

### Comentarios pedagógicos en TypeScript / Node

- Preferir TSDoc/JSDoc para funciones exportadas:

```ts
/**
 * Crea un token JWT para un usuario.
 *
 * @param userId - id del usuario en la base de datos
 * @returns token JWT firmado
 */
export function createJwt(userId: string): string {
  // Explicación: usamos jwt.sign con una SECRET para que el token sea verificable.
}
```

### Comentario en componentes React

```tsx
// Timer.tsx
// Este componente se encarga únicamente de la UI y controla el display del tiempo.
// La lógica de decremento se extrae a un hook `useTimer` para facilitar testing.
```

### Documentar respuestas del asistente/agente

- Cada endpoint o función puede llevar un bloque "Teacher note" en el archivo o en el README:
  ```md
  <!-- Teacher note:
    Explicación del porqué de la decisión (p. ej. por qué no usar sesiones de servidor para auth en este proyecto)
  -->
  ```

---

## Reglas sobre commits y verificación automática

- Después de cada subfase:
  1. Ejecutar `pnpm -w -r run lint` (si aplica)
  2. Ejecutar `pnpm -w -r test` o `pnpm -w -F <package> run test`
  3. Ejecutar `pnpm -w -F <package> run dev` para verificar manualmente en navegador/console
  4. `git add -A`
  5. `git commit -m "<tipo>(<scope>): descripción corta"`
- Si algún paso falla: **no** avanzar — documentar el error en el commit (ej. `fix: ...`) y arreglarlo.

---

## Tests y lint — comandos recomendados

- Instalar deps: `pnpm -w install`
- Lint monorepo: `pnpm -w -r run lint` (requiere script lint en cada package)
- Tests monorepo: `pnpm -w -r test`
- Levantar backend: `pnpm -w -F backend run dev`
- Levantar frontend: `pnpm -w -F frontend run dev`

---

## Ejemplo de flujo de trabajo para un feature (resumen práctico)

1. Crear rama: `git checkout -b feat/timer-hook`
2. Subfase: crear hook `useTimer.ts` y componente `Timer.tsx` (2 archivos)
3. Commit: `feat(timer): add useTimer hook and Timer component`
4. Test: `pnpm -w -F frontend run test` (escribir test mínimo)
5. Push y PR con descripción pedagógica (qué se aprendió, por qué, trade-offs).

---

## 🧩 8. Errores comunes de principiante (resumen)

| Área     | Error                                | Solución                                    |
| -------- | ------------------------------------ | ------------------------------------------- |
| Git      | Subir `node_modules`                 | Añadir a `.gitignore`                       |
| Backend  | No usar `await`                      | Envolver lógica en funciones `async`        |
| Frontend | Llamar hooks dentro de condicionales | Llamarlos siempre en la raíz del componente |
| TS       | Usar `any`                           | Declarar interfaces o tipos                 |
| Env      | Variables `.env` incorrectas         | Usar `env.example` como guía                |

## Checklist de "cosas de principiante" (no olvidar)

- `.gitignore` correctamente configurado.
- `public/images` creado y con archivo dummy (`.keep` o `README.md` dentro para que git trackee la carpeta).
- `env.example` con todas las variables necesarias.
- `README.md` en cada paquete (incluir scripts, variables env).
- `LICENSE` si piensa publicar el repo.
- Husky + lint-staged para hooks pre-commit (recomendado): `pnpm dlx husky-init && pnpm dlx lint-staged-init`.

---

## 📚 9. Recursos de aprendizaje

| Tema       | Recurso                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Node.js    | [Node.js Crash Course – Traversy Media](https://www.youtube.com/watch?v=fBNz5xF-Kx4)           |
| Express    | [MDN Express Guide](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs) |
| React      | [React Docs (Learn)](https://react.dev/learn)                                                  |
| TypeScript | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)                 |
| MongoDB    | [MongoDB University](https://learn.mongodb.com/)                                               |
| Git        | [Git & GitHub Crash Course](https://www.youtube.com/watch?v=RGOj5yH7evk)                       |

---

## 🧩 10. Troubleshooting

| Problema                  | Causa probable       | Solución                      |
| ------------------------- | -------------------- | ----------------------------- |
| `pnpm: command not found` | pnpm no instalado    | `npm i -g pnpm`               |
| Error MongoDB             | URI incorrecta       | Revisar `.env` y conexión     |
| `Cannot find module`      | Paths incorrectos    | Revisar `tsconfig.json`       |
| Error CORS                | Backend sin `cors()` | Instalar y aplicar middleware |

---

## ⚡ 11. Flujo de trabajo completo

```bash
git checkout -b feat/login-page
# Crear Login.tsx, api.ts, AuthContext.tsx
git add -A
git commit -m "feat(auth): add login page and context"
pnpm -F frontend run dev
pnpm -F backend run test
git push origin feat/login-page
```

---

## 🎓 12. Conclusión

**PomodoRise** debe servir como ejemplo de **cómo construir una app Full Stack moderna, escalable y educativa**.

- Fase 0: Entorno y configuración.
- Fase 1: Backend y API.
- Fase 2: Frontend y UI.
- Fase 3: Integración y lógica.
- Fase 4: Despliegue y CI/CD.

> 🧠 _Recuerde: entender cada parte del stack es más importante que terminar rápido._

## Consejos pedagógicos finales para el asistente (cómo debe explicar)

- Siempre **empezar** con el objetivo de la tarea antes de tocar código.
- **Mostrar** un snippet mínimo y luego explicar línea a línea (si el alumno lo desea).
- Usar analogías sencillas para explicar conceptos complejos (por ejemplo: tokens JWT ~ pasaporte).
- Promover commits pequeños y frecuentes.
- Hacer preguntas abiertas al alumno sólo cuando sea necesario (p. ej. "¿Quiere que añadamos refresh tokens?"),
  pero **no** frenar el flujo si el alumno pide una guía completa: proveer la solución completa y luego opciones.

---

## Fin — Resultado esperado

Un monorepo **funcional y didáctico** con:

- Pasos cortos y verificables.
- Commits y tests tras cada subfase.
- Código documentado con ejemplos.
- Buenas prácticas operativas (Docker, CI, lint, tests).
