# FridgeChef

**Convierte los ingredientes que tienes en recetas deliciosas — impulsado por IA.**

FridgeChef analiza lo que hay en tu nevera y genera al instante 4 recetas reales rankeadas por porcentaje de coincidencia (calculado en el servidor a partir de tus ingredientes, no estimado por la IA), con instrucciones paso a paso, estimación de calorías y lista de compras integrada.

---

## Capturas

> _Agrega tus ingredientes → obtén recetas en segundos_

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.4 (App Router) + React 19.3 + TypeScript 6 |
| Estilos | Tailwind CSS v4 |
| Animaciones | Framer Motion 14 |
| Estado global | Zustand (persistido en localStorage) |
| IA | Google Gemini (Flash-Lite → Flash, salida con schema) · Groq como respaldo |
| Imágenes | Pexels · Openverse |
| Iconos | Lucide React |
| Fuentes | Plus Jakarta Sans · Be Vietnam Pro (`next/font`) |
| Tests | Vitest |

---

## Funcionalidades

- **Sugerencias por IA** — recetas generadas por Gemini con salida estructurada (JSON schema)
- **% de coincidencia exacto** — el servidor cruza los ingredientes de cada receta con los tuyos, descarta los inventados y calcula el porcentaje (sal, pimienta, aceite y agua se asumen)
- **Cadena de modelos** — Gemini Flash-Lite (~2 s), luego Flash y por último Groq si alguno falla o se queda sin cuota
- **Ingredientes libres** — elige entre 150 ingredientes con emoji o escribe cualquier otro
- **Filtros en tiempo real** — por tiempo, dificultad y etiqueta dietética (sin llamadas extra a la IA)
- **Detalle de receta** — pasos numerados, consejos y calorías estimadas
- **Lista de compras** — agrega ingredientes faltantes con un tap, comparte o copia al portapapeles
- **Imágenes automáticas** — búsqueda paralela en Pexels y Openverse con scoring de relevancia
- **Persistencia** — ingredientes, recetas y lista de compras sobreviven a recargas (también el enlace directo a una receta)
- **Caché inteligente** — evita llamadas repetidas a la IA en cliente y servidor
- **APIs protegidas** — validación de entrada, límite de peticiones por IP y errores que no exponen detalles internos

---

## Configuración

### Variables de entorno

Hay dos archivos:

- **`.env.example`** — plantilla sin valores, se sube a git para documentar qué variables existen.
- **`.env.local`** — tus claves reales; está en `.gitignore` y nunca se sube.

Copia `.env.example` a `.env.local` y completa las claves:

```env
GEMINI_API_KEY=tu_clave_gemini   # requerida — https://aistudio.google.com/apikey
GROQ_API_KEY=tu_clave_groq       # opcional, respaldo — https://console.groq.com/keys
PEXELS_API_KEY=tu_clave_pexels   # opcional, imágenes — https://www.pexels.com/api/
```

> Sin Pexels, las imágenes se obtienen solo de Openverse. Sin Groq, no hay respaldo si Gemini alcanza su límite.

### Instalación

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Estructura del proyecto

```
app/
  page.tsx                 # Página principal (ingredientes + resultados)
  recipe/[id]/page.tsx     # Detalle de receta
  shopping-list/page.tsx   # Lista de compras
  api/
    recipes/               # POST → IA → normalización → 4 recetas
    recipe-detail/         # POST → IA → pasos + consejos + calorías
components/
  ingredients/             # Buscador + chips de ingredientes
  recipes/                 # Card, grid, MatchBadge, RecipeMeta
    detail/                # Hero, ingredientes, pasos
  filters/                 # Barra de filtros
  shopping/                # Lista, tarjeta por receta, items personalizados
  layout/                  # Navegación, PageShell, StoreHydrator
  ui/                      # Skeletons, estado vacío
lib/
  ai.ts                    # Gemini + respaldo Groq, schemas y prompts
  recipe-normalize.ts      # Validación y cálculo del % de coincidencia
  api-guard.ts             # Validación de entrada, rate limit, errores seguros
  recipe-images.ts         # Imágenes multi-fuente con scoring
  store.ts                 # Zustand store persistido
  utils.ts                 # Utilidades compartidas
  hooks/                   # useFlash, useClickOutside
  *.test.ts                # Tests unitarios (Vitest)
types/
  index.ts                 # Tipos compartidos
```

---

## Scripts

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # Tests unitarios (Vitest)
```

---

## Despliegue

El proyecto está optimizado para desplegarse en [Vercel](https://vercel.com). Cada push a `master` se despliega automáticamente. Configura `GEMINI_API_KEY`, `GROQ_API_KEY` y `PEXELS_API_KEY` en *Project → Settings → Environment Variables*.
