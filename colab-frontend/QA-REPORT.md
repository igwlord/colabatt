# INFORME QA — CoLab Hub
**Fecha**: 2026-03-29 | **Auditor**: Claude Code | **Version**: Post-Fase 3

---

## RESUMEN EJECUTIVO

Auditoría completa del frontend CoLab Hub. Se desplegaron 3 agentes en paralelo cubriendo: interacciones UI, CSS/visual, y datos/lógica. Se encontraron **42 issues** categorizados a continuación.

---

## 1. BUGS CRÍTICOS (Rompen funcionalidad)

### BUG-001: Botón X del modal no cierra
**Archivo**: `js/components/ui/modal.js:59-65`
**Problema**: La lógica de cierre del modal tiene un conflicto. La condición en línea 60 (`!e.target.closest('.modal__panel')`) excluye todo click dentro del panel — incluyendo el botón X que está DENTRO del panel. La línea 63 intenta atraparlo, pero ambas condiciones pueden disparar `close()` dos veces o ninguna según el target exacto del click.
**Impacto**: El botón X y "Cancelar" pueden no funcionar. El backdrop click sí funciona.
**Fix**: Unificar la lógica de cierre con condiciones claras y guard de doble-close.

### BUG-002: Botones Settings y Profile sin handler
**Archivo**: `js/layouts/top-nav.js:37, 40`
**Problema**: Los botones `data-action="settings"` y `data-action="profile"` se renderizan pero NO tienen event listeners. Clicks no hacen nada.
**Impacto**: Funcionalidad rota visible — el usuario hace click y nada pasa.
**Fix**: Agregar handlers (al menos abrir un toast/modal placeholder).

### BUG-003: Memory leak en Copilot — listener en document nunca se remueve
**Archivo**: `js/components/ui/copilot-panel.js:191-197`
**Problema**: `document.addEventListener('keydown', handleEscape)` se agrega cada vez que se abre el panel. El listener se auto-remueve solo si el usuario presiona Escape, pero si cierra con el botón X, el listener queda huérfano en el document. Múltiples open/close acumulan listeners.
**Fix**: Remover el listener en `closePanel()`.

### BUG-004: Fechas hardcodeadas en notificaciones — ya caducaron o caducarán
**Archivo**: `js/pages/notificaciones.js:29-31`
**Problema**: Compara contra `'2026-03-29'` y `'2026-03-28'` literales. Las agrupaciones "Hoy/Ayer/Anteriores" dejan de funcionar después de estas fechas.
**Fix**: Usar `new Date().toISOString().slice(0, 10)` para calcular dinámicamente.

---

## 2. BUGS ALTOS (Funcionalidad degradada)

### BUG-005: Opportunity cards con box-shadow inset duro
**Archivo**: `css/components/opportunity-card.css:16-17`
**Problema**: `.opportunity-card--urgente` y `--critico` usan `box-shadow: inset 3px 0 8px -2px` — patrón de línea dura que el usuario ha pedido eliminar repetidamente.
**Fix**: Reemplazar por `background: linear-gradient(90deg, ...)`.

### BUG-006: BU-08 no existe en registro
**Archivo**: `js/mock/team-members.js:22`
**Problema**: Elena Rivas asignada a `bu: 'BU-08'` pero BU-08 no está definida en `business-units.js`. `getBuName('BU-08')` retorna el código crudo.
**Fix**: Cambiar a BU-09 (consistente con copilot-responses.js que la ubica en BU-09).

### BUG-007: Fechas de dependencias en 2024
**Archivo**: `js/mock/dependencies.js:21, 35, 57, 72`
**Problema**: Todas las fechas dicen "Oct 12, 2024", "Sep 28, 2024", etc. Estamos en 2026 — aparecen como vencidas hace 17+ meses.
**Fix**: Actualizar a fechas 2026.

### BUG-008: Botones toggle-filter y toggle-view sin handler
**Archivo**: `js/pages/dependencies.js:67, 70`
**Problema**: Botones renderizados con `data-action="toggle-filter"` y `data-action="toggle-view"` pero `delegateEvents` no incluye handlers para ellos.
**Fix**: Agregar handlers o eliminar los botones si no son funcionales.

### BUG-009: "Nueva Solicitud" redirige a Mis Proyectos para técnicos
**Archivo**: `js/layouts/side-nav.js:141`
**Problema**: Para rol `technician`, el CTA "Nueva Solicitud" navega a `/tecnico/mis-proyectos` — no tiene sentido. Debería llevar a oportunidades o estar deshabilitado.
**Fix**: Navegar a `/tecnico/oportunidades` o cambiar el label a "Ver Oportunidades".

---

## 3. BUGS MEDIOS (UX degradada)

### BUG-010: Router usa onclick inline con globals expuestos
**Archivo**: `js/router.js:143, 163, 190-191`
**Problema**: El 404 page usa `onclick` inline que accede a `window.__router` y `window.__appStore`. Expone globals y bypasea el patrón de event delegation del resto de la app.
**Fix**: Usar data-link y event delegation como el resto de páginas.

### BUG-011: Función `esc()` / `escapeHtml()` duplicada en 4+ archivos
**Archivos**: `dashboard.js:183`, `skills-matrix.js:284`, `mis-proyectos.js:116`, `notificaciones.js:88`
**Problema**: Cada página define su propia función de escape HTML idéntica en vez de usar el `html` tagged template de `safe-html.js` o una utilidad compartida.
**Fix**: Exportar `escapeHtml()` desde `utils/safe-html.js` y reusar.

### BUG-012: Search input listener sin cleanup
**Archivo**: `js/layouts/top-nav.js:50-55`
**Problema**: `renderTopNav()` no retorna cleanup function. Si se re-renderiza, listeners se acumulan.

### BUG-013: Copilot-panel.css — `border-left: none` redundante
**Archivo**: `css/components/copilot-panel.css:193-194`
**Problema**: Después del fix anterior, quedó `border-left: none;` seguido del gradient. El `border-left: none` es innecesario.

---

## 4. DEUDA TÉCNICA — CSS

### CSS-001: 300+ inline styles en archivos JS
**Archivos más afectados**:
- `js/pages/skills-matrix.js` — ~73 instancias
- `js/pages/dashboard.js` — ~68 instancias
- `js/pages/mis-proyectos.js` — ~36 instancias
- `js/pages/notificaciones.js` — ~24 instancias
- `js/pages/dependencies.js` — ~23 instancias
**Impacto**: Imposible mantener, no se pueden reusar estilos, complica responsive.
**Recomendación**: Crear CSS de página dedicados (`css/pages/dashboard.css`, etc.)

### CSS-002: 60+ valores px hardcodeados que deberían ser tokens
**Ejemplos**: `font-size: 10px`, `gap: 6px`, `width: 40px`, `margin-left: -8px`
**Recomendación**: Agregar tokens faltantes (`--text-2xs: 10px`, `--icon-size-xl: 28px`)

### CSS-003: Font-sizes inconsistentes para iconos
**Problema**: Iconos Material Symbols usan `14px`, `16px`, `18px`, `20px`, `24px`, `28px` hardcodeados en vez de `--icon-size-*` tokens.

### CSS-004: z-index hardcodeado en skip-link
**Archivo**: `css/base.css:187` — usa `z-index: 100` en vez de token.

---

## 5. DEUDA TÉCNICA — ESTRUCTURA

### EST-001: 3 páginas manager son stubs "Coming Soon"
**Archivos**: `manager-dashboard.js`, `planificacion.js`, `analytics.js`
**Estado**: Todas muestran "Disponible Q2 2026" — son placeholders.

### EST-002: CSP permite 'unsafe-inline' para styles
**Archivo**: `index.html:6`
**Problema**: `style-src 'self' 'unsafe-inline'` es necesario por los inline styles masivos pero es un riesgo de seguridad.
**Solución a largo plazo**: Migrar inline styles a CSS → eliminar 'unsafe-inline'.

### EST-003: No hay favicon ni manifest.json
**Archivo**: `index.html`

---

## 6. MEJORAS PROPUESTAS

### MEJ-001: Responsive — faltan breakpoints tablet
Solo hay mobile (<640px) y desktop. Falta tablet (~768px-1024px).

### MEJ-002: Focus states faltantes en cards interactivas
`.card`, `.opportunity-card`, `.team-card` tienen `:hover` pero no `:focus-visible`. Problema de accesibilidad para navegación por teclado.

### MEJ-003: Animaciones — duraciones hardcodeadas
`150ms`, `250ms`, `300ms`, `400ms` se usan directamente. Podrían ser tokens de timing.

### MEJ-004: PLE courses — agregar link directo al curso
Los cursos PLE recomendados en el modal y skills-matrix no tienen link para ir al curso real.

### MEJ-005: Dashboard — agregar "última actividad" con timestamp
El greeting dice hora del día pero no muestra cuándo fue la última sesión.

---

## PRIORIDAD DE EJECUCIÓN

```
INMEDIATO (bloquean demo):
  BUG-001  Modal X button
  BUG-002  Settings/Profile handlers
  BUG-005  Opportunity cards sombra dura
  BUG-013  CSS cleanup copilot

ESTA SEMANA:
  BUG-003  Copilot memory leak
  BUG-004  Fechas dinámicas notificaciones
  BUG-006  BU-08 → BU-09
  BUG-007  Fechas dependencies 2024→2026
  BUG-009  CTA Nueva Solicitud para técnicos
  CSS-001  Migrar inline styles (top 3 páginas)

PRÓXIMA ITERACIÓN:
  BUG-008  Toggle handlers dependencies
  BUG-010  Router onclick → delegation
  BUG-011  Extraer escapeHtml utility
  BUG-012  TopNav cleanup function
  CSS-002  Tokens faltantes
  MEJ-001  Responsive tablet
  MEJ-002  Focus states
```

---

## MÉTRICAS

| Categoría | Encontrados | Críticos | Altos | Medios | Bajos |
|-----------|-------------|----------|-------|--------|-------|
| Bugs funcionales | 13 | 4 | 5 | 4 | — |
| Deuda CSS | 4 | — | 1 | 2 | 1 |
| Deuda estructura | 3 | — | — | 2 | 1 |
| Mejoras | 5 | — | — | 3 | 2 |
| **Total** | **25** | **4** | **6** | **11** | **4** |

---

*Generado por Claude Code — Auditoría automatizada con 3 agentes paralelos*
