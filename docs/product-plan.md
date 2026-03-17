# Command Center de Productividad — Plan de Producto

## Visión

Construir un centro de mando de productividad que combine gestión de proyectos, seguimiento de tiempo Pomodoro y sistema de notas en una sola interfaz elegante y de alto rendimiento.

## Objetivos funcionales

| Módulo | Funcionalidad |
|---|---|
| **Dashboard** | Saludo dinámico, 4 KPIs con tendencia, gráfico de actividad 7 días, feed de actividad, mini Pomodoro |
| **Proyectos** | CRUD completo, barra de progreso reactiva, modal de detalle con gestión de tareas, Drag & Drop |
| **Pomodoro** | Timer circular SVG, selector de proyecto, sesiones registradas, sonido de alerta |
| **Notas** | Sticky notes con colores, etiquetas, búsqueda en tiempo real, vinculación a proyectos |

## Stack tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript estricto
- **Estilos**: Tailwind CSS + CSS custom properties para temas
- **Estado**: Zustand con middleware `persist` (localStorage)
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **Gráficos**: Recharts
- **DnD**: @dnd-kit
- **Tema**: next-themes

## Roadmap futuro (v2)

1. Sincronización con backend (Supabase/Firebase)
2. Reportes semanales con métricas de productividad
3. Calendario integrado
4. PWA con notificaciones push
5. Colaboración en tiempo real
