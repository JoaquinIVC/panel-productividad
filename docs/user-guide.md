# Guía de Usuario — Command Center de Productividad

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Navegación

La barra lateral izquierda da acceso a las 4 secciones principales:
- **Dashboard**: Resumen general con KPIs y actividad reciente
- **Proyectos**: Gestión de proyectos y tareas
- **Pomodoro**: Timer de productividad con sesiones
- **Notas**: Notas tipo sticky notes con filtros

## Dashboard

Al ingresar, verás:
- **Saludo dinámico** basado en la hora del día
- **4 tarjetas KPI**: Proyectos activos, Tareas completadas, Horas de foco semanales y Notas totales
- **Gráfico de actividad**: Muestra las acciones de los últimos 7 días
- **Feed de actividad**: Las últimas 10 acciones realizadas
- **Mini Pomodoro**: Un timer compacto para iniciar sesiones rápidamente

## Proyectos

1. Click en **"Nuevo proyecto"** para crear un proyecto con nombre, descripción y color
2. Click en una tarjeta de proyecto para abrir el detalle
3. En el detalle puedes: agregar tareas, marcarlas como completadas, eliminarlas o reordenarlas arrastrando el ícono ⠿
4. La barra de progreso se actualiza automáticamente

## Pomodoro

1. Selecciona un proyecto asociado (opcional)
2. Presiona ▶️ para iniciar un ciclo de trabajo (25 min por defecto)
3. Al completar un ciclo, se reproduce un sonido de alerta y la sesión se registra
4. Automáticamente, se inicia el modo descanso (5 min)
5. El historial de sesiones aparece a la derecha

## Notas

1. Click en **"Nueva nota"** para crear una nota con color, etiquetas y vinculación a proyecto
2. Usa el **buscador** para filtrar por título o contenido en tiempo real
3. Filtra por **color** haciendo click en los círculos
4. Filtra por **etiqueta** haciendo click en las pills
5. Click en una nota para editarla

## Funciones adicionales

- **Modo oscuro / claro**: Toggle en la barra lateral inferior
- **Exportar datos**: Botón "Exportar datos" en la barra lateral, descarga un archivo `.json` con todo tu estado
- **Persistencia**: Todos tus datos se guardan en el navegador (localStorage) automáticamente
