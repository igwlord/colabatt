# COLAB HUB — FRONTEND IMPLEMENTATION PLAN
## Vanilla HTML · CSS · JavaScript (Zero Dependencies)
### AT&T TSI · BU-14 · v1.0

---

## 1. DECISIÓN ARQUITECTÓNICA

### ¿Por qué Vanilla?

| Factor | React + Stack | Vanilla |
|---|---|---|
| Dependencias NPM | ~400-800 paquetes | **0** |
| Build pipeline | Vite + plugins + transpile | **Ninguno** (ES Modules nativos) |
| Supply chain risk | Alto (cada dep es vector) | **Nulo** |
| Aprobación seguridad AT&T | Requiere audit de cada dep | **N/A** |
| Onboarding devs TSI | Requiere conocer React | **Cualquier dev web** |
| Mantenimiento framework | Updates, breaking changes | **Cero** — el browser ES el framework |
| Tamaño bundle | ~150-300KB min (React+Router+Query) | **~15-25KB** total JS app |
| Deploy | Necesita build step | **Copiar archivos a servidor** |

### Enfoque: SPA Liviana

Una Single Page Application con router vanilla (~50 líneas).
Cada "página" es un módulo ES6 que exporta una función `render()`.
Un shell único (`index.html`) con TopNav + SideNav + content area.
No se recarga la página al navegar — UX idéntica a React.

---

## 2. ESTRUCTURA DEL PROYECTO

```
colab-frontend/
├── index.html                     # Shell único (TopNav + SideNav + <main>)
├── css/
│   ├── tokens.css                 # Design tokens como CSS custom properties
│   ├── base.css                   # Reset, tipografía, scrollbars
│   ├── layout.css                 # TopNav, SideNav, AppShell grid
│   ├── components.css             # Todos los componentes
│   └── utilities.css              # Helpers: .glass-panel, .gradient-cta, etc.
│
├── js/
│   ├── app.js                     # Entry point: init router, load shell
│   ├── router.js                  # SPA router (~60 líneas)
│   ├── store.js                   # State management minimal (~40 líneas)
│   ├── api.js                     # Fetch wrapper + interceptors
│   │
│   ├── components/                # Funciones que retornan HTML strings
│   │   ├── ui/
│   │   │   ├── button.js
│   │   │   ├── badge.js
│   │   │   ├── chip.js
│   │   │   ├── progress-bar.js
│   │   │   ├── avatar.js
│   │   │   ├── icon.js
│   │   │   ├── modal.js
│   │   │   ├── input.js
│   │   │   ├── textarea.js
│   │   │   ├── select.js
│   │   │   ├── toggle.js
│   │   │   └── radio-group.js
│   │   │
│   │   ├── cards/
│   │   │   ├── kpi-card.js
│   │   │   ├── opportunity-card.js
│   │   │   ├── team-member-card.js
│   │   │   ├── vacancy-card.js
│   │   │   ├── dependency-card.js
│   │   │   └── alert-banner.js
│   │   │
│   │   ├── filters/
│   │   │   └── filter-bar.js
│   │   │
│   │   └── forms/
│   │       ├── skill-input.js
│   │       ├── urgency-selector.js
│   │       └── postularme-modal.js
│   │
│   ├── pages/
│   │   ├── tech-dashboard.js      # /tecnico/oportunidades
│   │   ├── publish-need.js        # /manager/nueva-necesidad
│   │   ├── team-management.js     # /manager/equipo/:projectId
│   │   ├── team-display.js        # /equipo/:teamId
│   │   └── dependencies.js        # /proyecto/:projectId/dependencias
│   │
│   ├── layouts/
│   │   ├── top-nav.js
│   │   └── side-nav.js
│   │
│   └── mock/                      # Mock data para desarrollo sin backend
│       ├── opportunities.js
│       ├── team-members.js
│       ├── dependencies.js
│       └── kpis.js
│
├── assets/
│   ├── fonts/
│   │   ├── Inter-Variable.woff2
│   │   └── JetBrainsMono-Variable.woff2
│   ├── icons/                     # SVG icons inline (o Material Symbols font)
│   └── img/
│       └── att-logo.svg
│
└── docs/
    └── COMPONENTS.md              # Documentación de uso de cada componente
```

---

## 3. CORE ARCHITECTURE

### 3.1 Router (js/router.js)

```javascript
// ~60 líneas, cero dependencias
// Soporta: rutas estáticas, params dinámicos (:id), wildcard 404

const routes = [];
let currentCleanup = null;

export function route(path, handler) {
  routes.push({
    path,
    regex: new RegExp('^' + path.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'),
    handler
  });
}

export function navigate(path) {
  history.pushState(null, '', path);
  resolve();
}

export function resolve() {
  const path = location.pathname;
  const match = routes.find(r => r.regex.test(path));

  // Cleanup anterior (remover event listeners, intervals, etc.)
  if (currentCleanup) currentCleanup();

  if (match) {
    const params = path.match(match.regex).groups || {};
    const container = document.getElementById('page-content');
    currentCleanup = match.handler(container, params);
  }
}

// Interceptar clicks en <a> internos
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-link]');
  if (a) { e.preventDefault(); navigate(a.getAttribute('href')); }
});

window.addEventListener('popstate', resolve);
```

### 3.2 Store (js/store.js)

```javascript
// State management reactivo en ~40 líneas
// Patrón pub/sub simple — reemplaza Zustand

export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Map();

  return {
    get: (key) => key ? state[key] : { ...state },

    set: (updates) => {
      const prev = { ...state };
      state = { ...state, ...updates };
      // Notificar solo los keys que cambiaron
      for (const [key, value] of Object.entries(updates)) {
        if (prev[key] !== value && listeners.has(key)) {
          listeners.get(key).forEach(fn => fn(value, prev[key]));
        }
      }
    },

    on: (key, fn) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(fn);
      return () => listeners.get(key).delete(fn); // unsubscribe
    },

    reset: () => { state = { ...initialState }; }
  };
}

// Store global de la app
export const appStore = createStore({
  user: null,
  filters: { bu: 'all', skill: 'all', urgency: 'all' },
  sideNavCollapsed: false,
  notifications: [],
  unreadCount: 0,
});
```

### 3.3 API Client (js/api.js)

```javascript
// Fetch wrapper con interceptors, auth header, error handling

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // JWT token
  const token = sessionStorage.getItem('auth_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  if (res.status === 401) {
    // Redirect a SSO login
    window.location.href = '/api/auth/saml/login';
    return;
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(res.status, error);
  }

  return res.json();
}

export const api = {
  get:    (url) => request(url),
  post:   (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
  put:    (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
  patch:  (url, data) => request(url, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (url) => request(url, { method: 'DELETE' }),
};
```

### 3.4 Component Pattern

Cada componente es una función pura que recibe datos y retorna HTML string.
Los event listeners se adjuntan DESPUÉS de insertar el HTML en el DOM.

```javascript
// Patrón estándar de componente:

// js/components/cards/kpi-card.js
export function KpiCard({ title, value, trend, trendUp, icon, accentColor = 'primary' }) {
  return `
    <div class="kpi-card" style="--accent: var(--${accentColor})">
      <div class="kpi-card__header">
        <span class="kpi-card__title">${title}</span>
        <span class="material-symbols-rounded kpi-card__icon">${icon}</span>
      </div>
      <div class="kpi-card__value">${value}</div>
      ${trend ? `
        <div class="kpi-card__trend ${trendUp ? 'kpi-card__trend--up' : 'kpi-card__trend--down'}">
          <span class="material-symbols-rounded">${trendUp ? 'trending_up' : 'trending_down'}</span>
          ${trend}
        </div>
      ` : ''}
    </div>
  `;
}
```

```javascript
// Patrón de página con lifecycle:

// js/pages/tech-dashboard.js
import { KpiCard } from '../components/cards/kpi-card.js';
import { OpportunityCard } from '../components/cards/opportunity-card.js';
import { FilterBar } from '../components/filters/filter-bar.js';
import { appStore } from '../store.js';
import { api } from '../api.js';

export function TechDashboard(container) {
  let data = { kpis: [], opportunities: [] };

  // Render
  function render() {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Panel del Técnico</h1>
        <p class="page-subtitle">Oportunidades de colaboración</p>
      </div>

      <div class="kpi-grid kpi-grid--3col">
        ${data.kpis.map(kpi => KpiCard(kpi)).join('')}
      </div>

      ${FilterBar({
        filters: appStore.get('filters'),
        options: { bu: data.buOptions, skill: data.skillOptions }
      })}

      <div class="card-list" id="opportunity-list">
        ${data.opportunities.map(opp => OpportunityCard(opp)).join('')}
      </div>
    `;
    attachListeners();
  }

  // Event listeners (se llama después de cada render)
  function attachListeners() {
    // Filtros
    container.querySelectorAll('[data-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        const { filter, value } = chip.dataset;
        appStore.set({ filters: { ...appStore.get('filters'), [filter]: value } });
        applyFilters();
      });
    });

    // Botones postularme
    container.querySelectorAll('[data-action="postularme"]').forEach(btn => {
      btn.addEventListener('click', () => openPostularmeModal(btn.dataset.projectId));
    });
  }

  // Load data
  async function load() {
    try {
      container.innerHTML = SkeletonLoader('dashboard');
      data = await api.get('/technicians/me/dashboard');
      render();
    } catch (err) {
      container.innerHTML = ErrorState('No se pudo cargar el dashboard');
    }
  }

  // Init
  load();

  // Subscribe to store changes
  const unsub = appStore.on('filters', () => applyFilters());

  // Cleanup function (llamada por el router al salir de la página)
  return () => {
    unsub();
  };
}
```

---

## 4. DESIGN SYSTEM EN CSS PURO

### 4.1 Design Tokens (css/tokens.css)

```css
:root {
  /* ── Surfaces (dark theme) ── */
  --surface-lowest:      #0a0e17;
  --surface:             #0f131c;
  --surface-low:         #181b25;
  --surface-container:   #1c1f29;
  --surface-high:        #262a34;
  --surface-highest:     #31353f;
  --surface-bright:      #353943;

  /* ── Brand ── */
  --primary:             #4cd6fb;
  --primary-container:   #00b4d8;
  --on-primary:          #003642;

  /* ── Text ── */
  --on-surface:          #dfe2ef;
  --on-surface-variant:  #bcc9ce;

  /* ── Borders ── */
  --outline:             #869398;
  --outline-variant:     #3d494d;

  /* ── Semantic ── */
  --success:             #4ae176;
  --warning:             #ffb77d;
  --error:               #ffb4ab;
  --error-container:     #93000a;
  --info:                #4cd6fb;

  /* ── Status (projects/applications) ── */
  --status-active:       #4ae176;
  --status-pending:      #ffb77d;
  --status-critical:     #ff6b6b;
  --status-completed:    #4cd6fb;

  /* ── Spacing scale ── */
  --space-1:  0.25rem;   /* 4px  */
  --space-2:  0.5rem;    /* 8px  */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */

  /* ── Typography ── */
  --font-sans:  'Inter', system-ui, sans-serif;
  --font-mono:  'JetBrains Mono', monospace;

  --text-xs:    0.625rem;  /* 10px */
  --text-sm:    0.75rem;   /* 12px */
  --text-base:  0.8125rem; /* 13px */
  --text-md:    0.875rem;  /* 14px */
  --text-lg:    1rem;      /* 16px */
  --text-xl:    1.25rem;   /* 20px */
  --text-2xl:   1.5rem;    /* 24px */
  --text-3xl:   2rem;      /* 32px */

  /* ── Radius ── */
  --radius-sm:    0.375rem;  /* 6px  */
  --radius-md:    0.75rem;   /* 12px — default */
  --radius-lg:    1rem;      /* 16px */
  --radius-full:  9999px;    /* pills */

  /* ── Shadows ── */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.3);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:  0 8px 24px rgba(0,0,0,0.5);

  /* ── Transitions ── */
  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
}
```

### 4.2 Component Classes (css/components.css)

```css
/* ── Cards ── */
.card {
  background: var(--surface-container);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* ── KPI Card ── */
.kpi-card {
  background: var(--surface-container);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent, var(--primary));
  padding: var(--space-5);
}
.kpi-card__value {
  font-size: var(--text-2xl);
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--on-surface);
}
.kpi-card__trend--up   { color: var(--success); }
.kpi-card__trend--down { color: var(--error); }

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}
.btn:active { transform: scale(0.95); }

.btn--primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-container));
  color: var(--on-primary);
}
.btn--ghost {
  background: transparent;
  color: var(--on-surface-variant);
  border: 1px solid var(--outline-variant);
}
.btn--ghost:hover {
  background: var(--surface-high);
}

/* ── Chips / Filter Pills ── */
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  background: var(--surface-high);
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.chip--active {
  background: var(--primary);
  color: var(--on-primary);
}

/* ── Skill Tags ── */
.skill-tag {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  background: color-mix(in srgb, var(--primary) 15%, transparent);
  color: var(--primary);
}

/* ── Badge ── */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
}
.badge--success { background: color-mix(in srgb, var(--success) 15%, transparent); color: var(--success); }
.badge--warning { background: color-mix(in srgb, var(--warning) 15%, transparent); color: var(--warning); }
.badge--error   { background: color-mix(in srgb, var(--error) 15%, transparent);   color: var(--error); }
.badge--info    { background: color-mix(in srgb, var(--info) 15%, transparent);     color: var(--info); }

/* ── Progress Bar ── */
.progress {
  height: 6px;
  background: var(--surface-highest);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress__fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--primary), var(--primary-container));
  transition: width var(--transition-base);
}

/* ── Modal (Glassmorphism) ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 23, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-base);
}
.modal-overlay.active {
  opacity: 1;
  pointer-events: auto;
}
.modal-panel {
  background: var(--surface-container);
  border-radius: var(--radius-lg);
  border: 1px solid var(--outline-variant);
  padding: var(--space-6);
  max-width: 560px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  transform: translateY(10px);
  transition: transform var(--transition-base);
}
.modal-overlay.active .modal-panel {
  transform: translateY(0);
}

/* ── Form Inputs ── */
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--surface-low);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  color: var(--on-surface);
  font-family: var(--font-sans);
  font-size: var(--text-md);
  transition: border-color var(--transition-fast);
}
.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 25%, transparent);
}

/* ── Toggle Switch ── */
.toggle {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--surface-highest);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.toggle.active {
  background: var(--primary);
}
.toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-fast);
}
.toggle.active .toggle__thumb {
  transform: translateX(20px);
}
```

### 4.3 Utility Classes (css/utilities.css)

```css
/* ── Glass Panel ── */
.glass-panel {
  background: color-mix(in srgb, var(--surface-lowest) 80%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid color-mix(in srgb, var(--outline-variant) 20%, transparent);
}

/* ── Gradient CTA ── */
.gradient-cta {
  background: linear-gradient(135deg, var(--primary), var(--primary-container));
  color: var(--on-primary);
}

/* ── Grid layouts ── */
.grid-3  { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
.grid-4  { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-5); }
.grid-2  { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-5); }

/* ── Skeleton Loading ── */
.skeleton {
  background: linear-gradient(90deg,
    var(--surface-high) 25%,
    var(--surface-highest) 50%,
    var(--surface-high) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--surface-low); }
::-webkit-scrollbar-thumb {
  background: var(--surface-highest);
  border-radius: var(--radius-full);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
}
```

---

## 5. LAYOUT SHELL

### 5.1 index.html (Shell Único)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CoLab Hub — AT&T TSI</title>

  <!-- Fonts -->
  <link rel="preload" href="assets/fonts/Inter-Variable.woff2" as="font" crossorigin>
  <link rel="preload" href="assets/fonts/JetBrainsMono-Variable.woff2" as="font" crossorigin>

  <!-- Material Symbols -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL@20..48,100..700,0..1">

  <!-- Styles -->
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/utilities.css">
</head>
<body>
  <!-- Top Navigation Bar -->
  <header id="top-nav"></header>

  <!-- Side Navigation Bar -->
  <aside id="side-nav"></aside>

  <!-- Main Content Area -->
  <main id="page-content"></main>

  <!-- Modal Container -->
  <div id="modal-root"></div>

  <!-- App Entry -->
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

### 5.2 Layout CSS

```css
body {
  margin: 0;
  background: var(--surface);
  color: var(--on-surface);
  font-family: var(--font-sans);
  display: grid;
  grid-template-columns: 256px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "topnav  topnav"
    "sidenav content";
  height: 100vh;
  overflow: hidden;
}

#top-nav {
  grid-area: topnav;
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--surface-container);
  border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 15%, transparent);
}

#side-nav {
  grid-area: sidenav;
  background: var(--surface-container);
  overflow-y: auto;
  border-right: 1px solid color-mix(in srgb, var(--outline-variant) 15%, transparent);
}

#page-content {
  grid-area: content;
  overflow-y: auto;
  padding: var(--space-6);
}
```

---

## 6. PAGES (5 Vistas)

### Mapping de Rutas

| Ruta | Página | Source Mockup |
|---|---|---|
| `/tecnico/oportunidades` | Tech Dashboard | tech_dashboard_bordes_redondeados |
| `/manager/nueva-necesidad` | Publish Need | manager_publicar_necesidad |
| `/manager/equipo/:projectId` | Team Management | equipo_del_proyecto_gesti_n |
| `/equipo/:teamId` | Team Display | equipo_soporte_migraci_n_5g |
| `/proyecto/:projectId/dependencias` | Dependencies | dependencias_bordes_redondeados_12px |

### Componentes por Página

**Tech Dashboard:**
- KpiCard ×3 (grid-3)
- FilterBar (chips horizontales)
- OpportunityCard ×n (lista vertical)
- PostularmeModal (glassmorphism)

**Publish Need:**
- Form centrado (max-width: 640px)
- Input, Textarea, Select
- SkillInput (tag input con autocompletado)
- UrgencySelector (radio group visual)
- Toggle (remoto)
- Preview banner con matching count

**Team Management:**
- KpiCard ×4 (grid-4)
- FilterBar
- TeamMemberCard ×n (grid)
- VacancyCard ×n
- ProgressBar (availability)

**Team Display:**
- Mismos componentes que Team Management
- Diferente data, posible layout variant

**Dependencies:**
- AlertBanner (critical delay, top)
- KpiCard ×4 (grid-4)
- DependencyCard ×n (grid-2)
- Critical path sidebar/table
- System diagnostics section

---

## 7. ORDEN DE IMPLEMENTACIÓN

### Fase 0: Scaffolding (Día 1)

1. Crear estructura de carpetas completa
2. Configurar `tokens.css` con todos los design tokens
3. Configurar `base.css` (reset, tipografía, fonts)
4. Configurar `layout.css` (grid shell)
5. Crear `index.html` con shell vacío
6. Implementar `router.js`
7. Implementar `store.js`
8. Implementar `api.js` con mock interceptor
9. Crear `app.js` entry point
10. Verificar que el shell carga y navega

### Fase 1: Design System (Días 2-3)

1. `components.css` — todas las clases de componentes
2. `utilities.css` — helpers y responsive
3. `button.js` — con variantes: primary, ghost, icon-only
4. `badge.js` — success, warning, error, info
5. `chip.js` — filtros con active state
6. `progress-bar.js` — con gradiente
7. `avatar.js` — con fallback iniciales
8. `icon.js` — wrapper Material Symbols
9. `input.js`, `textarea.js`, `select.js`
10. `toggle.js`, `radio-group.js`
11. `modal.js` — glassmorphism con animación
12. Crear página de test `/dev/components` que muestre todos los componentes

### Fase 2: Layout (Día 3)

1. `top-nav.js` — logo, search, notification bell, avatar perfil
2. `side-nav.js` — nav items, active states, CTA button inferior
3. `AppShell` wiring en `app.js`
4. Active route highlighting en side-nav
5. Responsive collapse (mobile hamburger)

### Fase 3: Cards (Días 4-5)

1. `kpi-card.js` — ambas variantes (left-border + icon top-right)
2. `opportunity-card.js` — horizontal con BU badge, skills, priority
3. `team-member-card.js` — vertical con avatar, availability bar, skills
4. `vacancy-card.js` — variante de posición abierta
5. `dependency-card.js` — progress, status badges, fechas
6. `alert-banner.js` — banner crítico superior
7. `filter-bar.js` — chips horizontales con estado

### Fase 4: Páginas (Días 5-8)

1. **Tech Dashboard** — valida la mayoría de componentes
2. **Team Management** — card grid + filtros
3. **Dependencies** — layout data-dense
4. **Publish Need** — formulario completo
5. **Team Display** — reutiliza Team Management

### Fase 5: Interactividad (Días 8-10)

1. `postularme-modal.js` — form completo con validación JS
2. `skill-input.js` — tag input con sugerencias
3. `urgency-selector.js` — radio visual
4. Estado de filtros persistente en store
5. Skeleton loaders para cada página
6. Transiciones de navegación
7. Mock data completa para todas las páginas

---

## 8. MOCK DATA STRATEGY

```javascript
// js/mock/index.js
// Interceptor que reemplaza api.js cuando no hay backend

const USE_MOCKS = true; // Toggle para desarrollo

if (USE_MOCKS) {
  const originalFetch = window.fetch;
  window.fetch = async (url, options) => {
    if (!url.startsWith('/api')) return originalFetch(url, options);

    // Simular latencia de red
    await new Promise(r => setTimeout(r, 300 + Math.random() * 200));

    const mockHandlers = {
      'GET /api/technicians/me/dashboard': () => import('./opportunities.js'),
      'GET /api/projects': () => import('./opportunities.js'),
      'GET /api/teams/:id': () => import('./team-members.js'),
      'GET /api/projects/:id/dependencies': () => import('./dependencies.js'),
      // ... etc
    };

    // Match route and return mock data
    const handler = findMatchingHandler(url, options.method, mockHandlers);
    if (handler) {
      const data = await handler();
      return new Response(JSON.stringify(data.default), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return originalFetch(url, options);
  };
}
```

---

## 9. VENTAJAS DE ESTE APPROACH PARA EL PITCH CTO

### Argumento 1: Zero Supply Chain Risk
- 0 dependencias npm
- 0 paquetes que auditar
- 0 vulnerabilidades de terceros
- Cumple con política de seguridad AT&T sin excepciones

### Argumento 2: Zero Build Pipeline
- No requiere Node.js en CI/CD
- No requiere webpack/vite/bundler
- Deploy = copiar archivos estáticos a servidor web
- Funciona detrás de cualquier reverse proxy AT&T

### Argumento 3: Mantenimiento Trivial
- Cualquier dev que sepa HTML/CSS/JS puede mantenerlo
- No hay framework que actualizar
- No hay breaking changes de dependencias
- Código legible sin abstracción de framework

### Argumento 4: Performance Nativa
- ~15-25KB total JS vs ~300KB+ de React bundle
- Carga instantánea en red interna
- No hay Virtual DOM overhead
- CSS nativo sin runtime (styled-components/emotion)

### Argumento 5: Longevidad
- HTML/CSS/JS son standards del W3C
- No van a ser deprecados
- ES Modules son nativos en todos los browsers modernos
- CSS Custom Properties son standard desde 2016

---

## 10. LIMITACIONES Y MITIGACIONES

| Limitación | Mitigación |
|---|---|
| Sin component reactivity automática | Store con pub/sub + re-render selectivo |
| Sin JSX (HTML como strings) | Template literals + buena estructura de funciones |
| Sin HMR (Hot Module Replacement) | LiveReload con un script de 5 líneas (dev only) |
| Sin type safety (no TypeScript) | JSDoc annotations para IntelliSense en VS Code |
| Sin testing framework integrado | Tests e2e con Playwright (zero bundle dep) |
| Sin lazy loading de rutas | Dynamic `import()` nativo de ES Modules |

---

## 11. MASTER PROMPT PARA CLAUDE CODE (FRONTEND)

Copiar este prompt en Claude Code para generar todo el frontend:

```
Eres Claude Code construyendo el frontend de CoLab Hub para AT&T TSI.

STACK: HTML, CSS, JavaScript vanilla. CERO dependencias npm. ES Modules nativos.
DESIGN: Dark theme enterprise, design tokens en CSS custom properties.
PATRON: SPA con router vanilla, componentes como funciones que retornan HTML strings.

Sigue el plan en este orden:
1. Crear toda la estructura de carpetas
2. Implementar css/tokens.css, base.css, layout.css, components.css, utilities.css
3. Implementar js/router.js, store.js, api.js
4. Implementar index.html shell
5. Implementar layouts: top-nav.js, side-nav.js
6. Implementar componentes UI (button, badge, chip, progress, avatar, icon, modal, inputs)
7. Implementar cards (kpi, opportunity, team-member, vacancy, dependency, alert-banner, filter-bar)
8. Implementar páginas en orden: tech-dashboard, team-management, dependencies, publish-need, team-display
9. Implementar forms: postularme-modal, skill-input, urgency-selector
10. Implementar mock data para todas las páginas
11. Verificar que todas las rutas funcionan y los componentes se renderizan

REGLAS:
- CERO npm install. Todo es vanilla.
- Colores EXACTOS de tokens.css. No inventar colores.
- Border radius 12px (0.75rem) por defecto
- Font: Inter para texto, JetBrains Mono para datos/código
- Íconos: Material Symbols Rounded
- Cada componente JS exporta una función que recibe un objeto y retorna HTML string
- Event listeners se adjuntan DESPUÉS de innerHTML, nunca inline
- El router devuelve una función cleanup que cada página usa para limpiar listeners
- Mock data realista: técnicos AT&T, BUs reales, skills de telecom
- Mobile responsive con media queries en utilities.css
```