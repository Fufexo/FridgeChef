# FridgeChef

**Convierte los ingredientes que tienes en recetas deliciosas — impulsado por IA.**

FridgeChef analiza lo que hay en tu nevera y genera al instante 4 recetas rankeadas por porcentaje de coincidencia, con instrucciones paso a paso, estimación de calorías y lista de compras integrada.

---

## Capturas

> _Agrega tus ingredientes → obtén recetas en segundos_

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Estilos | Tailwind CSS v4 |
| Animaciones | Framer Motion |
| Estado global | Zustand |
| IA | Google Gemini (`gemini-1.5-flash`) |
| Imágenes | Pexels · Openverse |
| Iconos | Lucide React |
| Fuentes | Plus Jakarta Sans · Be Vietnam Pro (`next/font`) |

---

## Funcionalidades

- **Sugerencias por IA** — recetas generadas por Gemini, ordenadas por % de ingredientes disponibles
- **Filtros en tiempo real** — por tiempo, dificultad y etiqueta dietética (sin llamadas extra a la IA)
- **Detalle de receta** — pasos numerados, consejos y calorías estimadas
- **Lista de compras** — agrega ingredientes faltantes con un tap, comparte o copia al portapapeles
- **Imágenes automáticas** — búsqueda paralela en Pexels y Openverse con scoring de relevancia
- **Caché inteligente** — sessionStorage evita llamadas redundantes; caché en memoria en el servidor

---

## Configuración

### Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
GEMINI_API_KEY=tu_clave_gemini
PEXELS_API_KEY=tu_clave_pexels          # opcional
```

> La clave de Pexels es opcional. Sin ella, las imágenes se obtienen solo de Openverse.

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
  page.tsx                 # Página principal
  recipe/[id]/page.tsx     # Detalle de receta
  shopping-list/page.tsx   # Lista de compras
  api/
    recipes/               # POST → Gemini → 4 RecipeSuggestion[]
    recipe-detail/         # POST → Gemini → pasos + consejos + calorías
components/
  ingredients/             # Input + chips de ingredientes
  recipes/                 # Cards, grid, detalle
  filters/                 # Barra de filtros
  shopping/                # Lista de compras
  layout/                  # Navegación
  ui/                      # Skeletons, estado vacío
lib/
  gemini.ts                # Cliente Gemini + prompts
  store.ts                 # Zustand store
  utils.ts                 # Utilidades compartidas
  recipe-images.ts         # Resolución de imágenes multi-fuente
  hooks/                   # useFlash, useClickOutside
types/
  index.ts                 # Tipos compartidos
```

---

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # ESLint
```

---

## Despliegue

El proyecto está optimizado para desplegarse en [Vercel](https://vercel.com). Asegúrate de configurar las variables de entorno en el dashboard de Vercel antes de hacer el deploy.
