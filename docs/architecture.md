# Arquitectura del Estado y Decisiones Técnicas

## ¿Por qué Zustand sobre React Context?

1. **Rendimiento**: Zustand permite selectores granulares — los componentes solo se re-renderizan cuando cambia el slice exacto que consumen.
2. **Sin boilerplate**: No necesita Providers en el árbol. Cualquier componente puede leer el store directamente.
3. **Middleware nativo**: `persist` sincroniza automáticamente con `localStorage` sin código adicional.
4. **Compatibilidad SSR**: El middleware `persist` de Zustand maneja la hidratación de forma predecible con el callback `onRehydrateStorage`.

## Flujo de datos

```
[Componente] → useStore selector → [Zustand Store] → persist middleware → [localStorage]
                                          ↑
                                    [Custom Hooks]
                                  (useProjects, usePomodoro, useActivityLog)
```

- **No hay prop drilling.** Cada componente consume el store directamente vía hooks.
- **Custom hooks** encapsulan lógica derivada (ej: `getProjectProgress`, `getDailyActivityCounts`).

## Estrategia anti-errores SSR

Next.js 14 con App Router renderiza en el servidor por defecto. El store de Zustand con `persist` lee `localStorage` solo en el cliente, lo que causa un mismatch entre el HTML del servidor y el HTML hidratado en el cliente.

### Solución implementada

1. **Flag `_hasHydrated`**: El store incluye un flag que arranca en `false` y se marca `true` cuando `onRehydrateStorage` completa.
2. **Loading guard**: Cada página verifica `_hasHydrated` antes de renderizar. Mientras es `false`, muestra un spinner.
3. **`suppressHydrationWarning`**: En `<html>` para evitar warnings por el atributo `class` que `next-themes` inyecta.

## Estructura de directorios

```
/store     → Estado global (single source of truth)
/hooks     → Lógica derivada y selectores agrupados
/lib       → Utilidades puras sin side effects
/components/ui       → Átomos reutilizables
/components/shared   → Layout, Sidebar, ThemeProvider
/components/features → Componentes con lógica de negocio
/app       → Páginas (Server Components que renderizan Client Components)
```
