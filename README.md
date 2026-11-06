# 🧼 CleanOps — Task & Hygiene Management System

Sistema integral de gestión operativa, auditoría higiénica y control de tareas para locales gastronómicos y retail. Diseñado para garantizar la rendición de cuentas, supervisar vencimientos en tiempo real mediante un sistema de semáforos, equilibrar la carga laboral del equipo y registrar auditorías inmutables.

## 📋 Tabla de Contenidos

1. [Propósito del Proyecto](#-propósito-del-proyecto)
2. [Características Principales](#-características-principales)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Guía de Componentes](#-guía-de-componentes)
6. [Guía de Servicios, Hooks y Funciones](#-guía-de-servicios-hooks-y-funciones)
7. [Modelo de Datos en Firestore](#-modelo-de-datos-en-firestore)
8. [Instalación y Configuración](#-instalación-y-configuración)

---

## 🎯 Propósito del Proyecto

En entornos de gastronomía y retail, las tareas operativas profundas (desengrasado de campanas, limpieza de trampas de grasa, sanitización de cámaras de frío) suelen postergarse o recaer recurrentemente sobre las mismas personas.

**CleanOps** resuelve este problema ofreciendo:

* **Seguimiento Preventivo:** Control visual de vencimientos antes de que ocurran fallas higiénicas o de inspección.
* **Detección Automática de Incidencias:** Alertas prioritarias cuando una tarea acumula 7 o más días sin registrarse.
* **Equidad y Rotación de Personal:** Trazabilidad completa con firma digital para auditar quién realiza cada tarea y evitar sobrecargas de trabajo.
* **Aprovechamiento Operativo ("Caza de Huecos"):** Filtro rápido de tareas secundarias aptas para momentos de baja afluencia o tiempos muertos.

---

## ✨ Características Principales

* **Control de Acceso Basado en Roles (RBAC):**
  * **Operador:** Visualización de tareas, filtrado por sector/tiempos muertos y confirmación de check.
  * **Administrador:** CRUD completo de tareas, gestión de empleados con contraseñas visibles/ocultables, creación de sectores y auditorías.
* **Semáforo Visual y Contadores Dinámicos:**
  * 🟢 **Al día / Realizada hoy:** Cumplimiento registrado en fecha.
  * ⏳ **Vence hoy / Pronto:** Tareas en límite de vencimiento.
  * 🚨 **Vencida / Incidencia:** Alerta pulsante cuando se superan los límites de frecuencia o los 7 días SLA.
* **Tres Vistas Integradas:**
  1. **Tarjetas Kanban:** Panel operativo con tarjetas individuales e indicadores de estado.
  2. **Cronograma Semanal (Matriz Lun-Dom):** Vista de matriz con navegación semanal (`<`, `>`, `Hoy`) para auditar qué días exactos se ejecutó cada tarea.
  3. **Auditoría & Rotación (Histórico):** Bitácora cronológica con desglose por Semana, Mes o Año, acompañada de tarjetas de balance de carga para supervisar la rotación del personal.
* **Feedback Asíncrono en Tiempo Real:** Spinners (*loaders*) en cada interacción de red (login, creación de tarea, confirmación de check y baja de usuarios).

---

## 🛠️ Stack Tecnológico

* **Frontend Core:** [React 18](https://react.dev/), [Vite](https://vitejs.dev/)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Iconografía:** [Lucide React](https://lucide.dev/)
* **Base de Datos & Backend:** [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore) (Sincronización en tiempo real vía WebSockets)

---

## 📁 Estructura del Proyecto

```text
src/
├── components/
│   ├── Header.jsx              # Barra superior con turnos (AM/PM) y perfil
│   ├── TaskCard.jsx            # Tarjeta de tarea con semáforo y loader de check
│   ├── WeeklyScheduleView.jsx  # Matriz de cronograma Lunes a Domingo
│   ├── AuditLogView.jsx        # Bitácora histórica y tarjetas de balance de carga
│   ├── StatusSummaryBar.jsx    # KPIs numéricos superiores y filtros por estado
│   ├── LoginModal.jsx          # Modal de acceso con toggle de contraseña y loader
│   └── AdminModal.jsx          # Panel modal de administración (Tareas, Usuarios, Sectores)
├── context/
│   └── AuthContext.jsx         # Contexto de autenticación, sesión y roles
├── hooks/
│   └── useTasks.js             # Hook reactivo para suscripciones y mutaciones
├── services/
│   ├── firebase.js             # Inicialización y singleton de Firestore
│   ├── tasksService.js         # Capa DAL para la colección 'tasks'
│   ├── executionsService.js    # Capa DAL para la colección 'executions'
│   └── seedService.js          # Poblado de datos iniciales con fechas relativas
├── utils/
│   ├── taskStatus.js           # Cálculo matemático de días restantes y estados
│   └── dateSchedule.js         # Utilidad para rangos de días de lunes a domingo
└── App.jsx                     # Componente contenedor y gestor de vistas
```

---

## 🧩 Guía de Componentes

### `src/App.jsx`
Orquestador central. Controla el cambio de vistas (`kanban`, `schedule`, `audit`), almacena filtros de sector y tiempos muertos, gestiona el desplazamiento de semanas (`weekOffset`) y conecta los hooks principales con la interfaz.

### `src/components/Header.jsx`
Encabezado superior persistente. Muestra el selector de turnos (**AM / PM**), la identidad del usuario logueado con su rol correspondiente y el botón de acceso al panel de administración para cuentas `admin`.

### `src/components/LoginModal.jsx`
Formulario de inicio de sesión obligatorio. Incluye alternancia de visibilidad de contraseña (íconos `Eye` / `EyeOff`), indicador de carga giratorio (`Loader2`) y notificación de errores de credenciales.

### `src/components/StatusSummaryBar.jsx`
Barra de métricas clave (KPIs). Presenta tres tarjetas con contadores dinámicos (**🚨 Vencidas**, **⏳ Por Vencer**, **✅ Realizadas**) que actúan simultáneamente como botones de filtrado rápido sobre el tablero.

### `src/components/TaskCard.jsx`
Componente atómico para cada tarea en el tablero Kanban. Aplica estilos de borde según la urgencia, expone controles de edición y borrado para administradores, y contiene el botón de check con feedback de carga individual.

### `src/components/WeeklyScheduleView.jsx`
Tabla interactiva de cronograma de Lunes a Domingo. Cruza la lista de tareas activas contra el historial de ejecuciones de la semana seleccionada, marcando checks verdes en los días completados y resaltando la columna del día en curso.

### `src/components/AuditLogView.jsx`
Módulo de auditoría y análisis de carga de trabajo. Cuenta con:
1. Selector de períodos (**Esta Semana**, **Este Mes**, **Este Año**).
2. Tarjetas de balance laboral que alertan con advertencia de alta carga si un empleado concentra el 45% o más de las tareas pesadas.
3. Tabla cronológica descendente con fecha, hora, sector, turno y firma del operario.

### `src/components/AdminModal.jsx`
Centro de configuración global dividido en tres pestañas:
1. **Gestión de Tareas:** Alta y modificación de tareas (sector, frecuencia, turno, responsable sugerido y aptitud para tiempos muertos).
2. **Gestión de Personal:** Registro de operarios y administradores con asignación de contraseña y baja de cuentas.
3. **Nuevos Sectores:** Creación dinámica de áreas de trabajo (ej. *Cava*, *Exterior*, *Depósito*).

---

## ⚙️ Guía de Servicios, Hooks y Funciones

### `src/services/tasksService.js`
* `subscribeToTasks(callback)`: Escucha la colección `tasks` en tiempo real mediante `onSnapshot`.
* `createTaskInFirestore(payload)`: Inserta un documento de tarea con estado activo y fecha de creación.
* `updateTaskInFirestore(taskId, payload)`: Modifica los atributos de una tarea existente.
* `deleteTaskInFirestore(taskId)`: Elimina de forma definitiva una tarea de la base de datos.
* `completeTaskInFirestore(taskId, operatorName, shift)`: Actualiza `lastCompletedAt` al día actual y guarda la firma en el objeto `auditLog`.

### `src/services/executionsService.js`
* `recordExecutionInFirestore(data)`: Registra cada check completado en la colección `executions`, calculando identificadores de semana ISO (`weekString`), mes y año.
* `subscribeToExecutions(callback, limit)`: Obtiene los eventos de auditoría ordenados descendentemente por fecha.

### `src/hooks/useTasks.js`
Hook de integración para componentes de React. Sincroniza simultáneamente `tasks` y `executions`, expone el indicador global `loading` y centraliza las llamadas a las mutaciones asíncronas.

### `src/utils/taskStatus.js`
* `getTaskStatusInfo(lastCompletedAt, frequencyDays)`: Normaliza fechas a medianoche y computa la cuenta regresiva matemática, categorizando la tarea en:
  * `COMPLETED_TODAY`: Completada durante el día de hoy.
  * `OVERDUE`: Plazo expirado o incidencia crítica ($\ge 7$ días sin check).
  * `DUE_TODAY`: Vence en la jornada actual.
  * `ON_TRACK`: En término, indicando días restantes.

### `src/utils/dateSchedule.js`
* `getDaysOfWeekRange(weekOffset)`: Genera un arreglo de 7 objetos de fecha representativos de la semana (Lunes a Domingo) para la semana actual (`offset = 0`) o semanas adyacentes.

---

## 🗄️ Modelo de Datos en Firestore

### Colección: `tasks`
```json
{
  "title": "Campanas y ductos de extracción (desengrasado)",
  "sector": "Cocina",
  "frequencyDays": 7,
  "assignedRole": "Carlos Gómez",
  "assignedShift": "AM",
  "isDowntimeTask": true,
  "isActive": true,
  "lastCompletedAt": "2026-10-24",
  "createdAt": "2026-10-01T12:00:00.000Z",
  "auditLog": {
    "completedBy": "Carlos Gómez",
    "shift": "AM",
    "timestamp": "2026-10-24T10:15:00.000Z"
  }
}
```

### Colección: `executions` (Historial Inmutable)
```json
{
  "taskId": "task-cocina-01",
  "taskTitle": "Campanas y ductos de extracción (desengrasado)",
  "sector": "Cocina",
  "completedBy": "Carlos Gómez",
  "completedByUserId": "usr-2",
  "shift": "AM",
  "completedAt": "2026-10-30T10:15:00.000Z",
  "dateString": "2026-10-30",
  "weekString": "2026-W44",
  "monthString": "2026-10",
  "year": 2026
}
```

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/clean-ops.git
cd clean-ops
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con las credenciales de tu proyecto de Firebase:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 4. Ejecutar en modo desarrollo
```bash
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.