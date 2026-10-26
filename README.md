# Axteri Marketplace

Frontend del marketplace de **Axteri**, mantenido por **L4Dev** en el repositorio
`axteri-marketplace`. La landing desarrollada en Astro pertenece a otro repositorio.

## Stack

- Angular 22, componentes standalone y Angular Router.
- TypeScript 6 en modo strict, Angular Signals para el futuro estado local y RxJS 7.
- SCSS, clases BEM y design tokens mediante CSS Custom Properties.
- pnpm 10.23.0, Vitest 5 con el builder oficial de Angular, ESLint 10 y Prettier 3.

## Requisitos

- Node.js `^22.22.3`, `^24.15.0` o `>=26.0.0`, según los requisitos del CLI instalado.
  La base se validó con Node.js 22.23.3.
- pnpm **10.23.0**, fijado en `packageManager`.

## Instalación y desarrollo

Desde la raíz del repositorio:

```bash
pnpm install --frozen-lockfile
pnpm start
```

La aplicación está disponible en `http://localhost:4200/`.
En PowerShell, si la política de ejecución bloquea `pnpm.ps1`, utiliza `pnpm.cmd`
en lugar de `pnpm`; no es necesario cambiar la política del sistema.

## Comandos

| Comando                   | Uso                                                           |
| ------------------------- | ------------------------------------------------------------- |
| `pnpm start`              | Servidor de desarrollo con recarga automática.                |
| `pnpm build`              | Build de producción en `dist/axteri-marketplace/browser/`.    |
| `pnpm watch`              | Build de desarrollo en modo observación.                      |
| `pnpm test`               | Pruebas Vitest; modo observación en terminal interactiva.     |
| `pnpm test --watch=false` | Ejecutar los tests una vez, apropiado para CI.                |
| `pnpm lint`               | ESLint para TypeScript y plantillas, sin warnings permitidos. |
| `pnpm format`             | Aplicar Prettier.                                             |
| `pnpm format:check`       | Verificar formato sin modificar archivos.                     |

Las pruebas verifican el layout público, el orden de las ocho secciones, los
datos renderizados y el contrato de `ProductCard` (precios y eventos).

## Estructura actual

```text
src/app/
├── core/layout/
│   ├── header/
│   ├── footer/
│   └── main-layout/
├── shared/ui/product-card/
├── models/
│   └── product.model.ts
├── features/home/
│   ├── pages/home-page/
│   ├── components/
│   │   ├── hero/
│   │   ├── limited-offers/
│   │   ├── categories/
│   │   ├── featured-products/
│   │   ├── quality-banner/
│   │   ├── preferred-brands/
│   │   ├── news/
│   │   └── recommendations/
│   ├── data/
│   │   ├── home-content.data.ts
│   │   └── home-products.data.ts
│   └── models/
│       └── home-content.model.ts
├── app.ts
├── app.config.ts
├── app.routes.ts
└── app.spec.ts
```

## Alcance y límites de esta iteración

La Home contiene header, hero, ofertas, categorías, destacados, banner de calidad,
marcas preferidas, noticias, sugerencias y footer. Los datos de presentación incluyen
cinco ofertas, nueve categorías, cinco destacados, tres marcas y diez sugerencias.

La Home, salvo el Header desarrollado en la siguiente iteración, es un **esqueleto semántico**.
Los colores y medidas siguen siendo provisionales. `src/styles/_skeleton.scss`
comparte únicamente reglas SCSS mínimas de listas, secciones y placeholders.
Se mantiene el enfoque desktop-first. Los breakpoints oficiales y la adaptación
del Header se describen más abajo; el responsive definitivo de la Home sigue pendiente.

## Routing y composición

La única URL implementada es `/`. Carga de forma diferida `MainLayout`, que contiene
`Header → main/router-outlet → Footer`, y después `HomePage` como ruta hija.
El componente raíz conserva únicamente su outlet.

`HomePage` compone ocho secciones y les entrega constantes tipadas. El layout
público puede compartirse con futuras rutas sin duplicar header y footer. Los
enlaces de navegación disponibles apuntan a secciones de la Home mediante
fragmentos; no se crean rutas de catálogo, cuenta o vendedor.

Se conservan los defaults instalados de Angular 22: standalone, OnPush y
ejecución sin Zone.js. TypeScript 6 activa strict y Angular 22 strictTemplates.
No se añade estado global: estos mocks estáticos no necesitan Signals.

## Componentes y datos

- `ProductCard` es la única tarjeta usada por ofertas, destacados y sugerencias.
  Recibe `input.required<Product>()` y expone `requestQuote` y `viewDetails` mediante
  `output()`. Son eventos de presentación sin consumidores de negocio todavía:
  no abren fichas, envían cotizaciones ni consultan servicios.
- `Product` tiene identidad, marca, imagen opcional, vendedor opcional y un
  precio discriminado: fijo, rango o por cotizar. Los datos del vendedor se
  limitan a lo visible; no se crea un dominio completo de vendedores.
- `Category`, `Brand` y `NewsPromotion` pertenecen a Home. Las marcas agrupan
  categorías y cuatro previews visuales; no necesitan tarjetas completas de
  producto, precios ni un componente compartido adicional.
- `home-products.data.ts` agrupa ofertas, destacados y sugerencias. Los precios y
  proveedores son muestras de presentación, no ofertas comerciales vigentes.
- `home-content.data.ts` contiene las nueve categorías visibles, Siemens, ABB,
  Omron y la promoción HAAS VF-3. No se inventan noticias ni slides adicionales.
- Las URLs de imágenes quedan ausentes hasta recibir assets reales. Los templates
  muestran bloques neutros cuando no existe `imageUrl`, sin solicitudes a URLs
  ficticias. El Header reserva el logo mediante un SVG transparente; el resto del branding sigue como texto.
- El buscador principal permanece dentro de Hero; Header contiene el campo compacto
  del estado scrolled. Su integración se describe a continuación.

## Pendiente

Quedan pendientes assets originales, tokens de Illustrator, estilos fieles por
sección, responsive y acabado final. Tampoco se implementan búsqueda, filtros,
modo IA, cuenta, favoritos, carrito, cotizaciones ni reproducción audiovisual.
Los controles sin funcionalidad están deshabilitados; los eventos de producto
solo preparan su contrato de integración.

Los indicadores de promociones son estructurales y están deshabilitados. Las
listas no implementan carrusel, scroll snap, paginación ni temporizadores.
No se ha elegido una solución de navegación horizontal.

Catálogo, producto, checkout, perfil, vendedor, autenticación con Clerk, APIs,
base de datos, backend y pagos siguen fuera de alcance. La landing Astro
permanece separada. Playwright se evaluará al desarrollar flujos completos.

Al desplegar esta SPA, el hosting deberá redirigir las rutas a `index.html`.
No se configura hosting en esta fase.

## Header: estados, assets e integración

El Header conserva un único navbar y un único Search.
Solo `.header__navbar` tiene posición fija. Los controles derechos están en el
flujo normal del documento y salen del viewport al desplazarse.

- `initial`: logo, navegación y Search circular, sin input visible.
- `scrolled`: se activa cuando `scrollY > HEADER_SCROLL_THRESHOLD` (**48 px**,
  en `header.ts`). El navbar se extiende y muestra un input horizontal.
- El listener es pasivo, se registra con `afterNextRender` y se elimina mediante
  `DestroyRef`. El estado es un Signal booleano.
- Search inicial realiza un salto de 3 px y brillo durante 320 ms. Al terminar
  emite `primarySearchRequested`. `MainLayout` enfoca el elemento con
  `data-primary-search` y lo desplaza solo si hace falta. Header no importa Hero.
- Con movimiento reducido, el foco es inmediato y no hay animación ni scroll
  suave. El input scrolled entra con una transición visual de 180 ms.
- Search scrolled enfoca su propio input. No hay búsqueda real; enviar el
  formulario no navega ni consulta una API.
- En mobile (`<= 48rem`), el estado `scrolled` mantiene la barra superior
  simplificada (`Logo + Search + Menu`) y añade únicamente elevación visual, sin
  desplegar el input horizontal para no saturar el ancho disponible; el botón
  Search conserva la acción de dirigir el foco al buscador principal del Hero.
- La adaptación utiliza exclusivamente los cinco breakpoints oficiales desktop-first
  (`96rem`, `80rem`, `64rem`, `48rem` y `40rem`) definidos en
  `src/styles/_breakpoints.scss`. En `<= 48rem` la navegación y las acciones
  derechas pasan al panel móvil desplegable y `PRODUCTOS` se comporta como un
  accordion accesible alimentado por la misma fuente de datos del mega menú.
- Los estilos se dividen en `header.scss`, `header-responsive.scss`,
  `header-mobile.scss` y `header-motion.scss` (y `products-mega-menu-responsive.scss`
  en el mega menú) sin modificar los presupuestos globales de Angular.

### Assets preparados para reemplazo

Angular copia `public/` al build. Estos archivos son SVG válidos
preparados para reemplazo conservando exactamente sus nombres:

| Archivo                                       | Reemplazar por                        |
| --------------------------------------------- | ------------------------------------- |
| `public/assets/logos/axteri-logo.svg`         | SVG original del logo completo AXTERI |
| `public/assets/icons/common/search.svg`       | SVG original de Search                |
| `public/assets/icons/common/chevron-down.svg` | SVG original del dropdown             |
| `public/assets/icons/common/menu.svg`         | SVG original de abrir menú mobile     |
| `public/assets/icons/common/close.svg`        | SVG original de cerrar menú mobile    |
| `public/assets/icons/header/location.svg`     | SVG original de ubicación             |
| `public/assets/icons/header/account.svg`      | SVG original de cuenta                |
| `public/assets/icons/header/orders.svg`       | SVG original de pedidos               |

Las rutas públicas empiezan en `/assets/`. Los SVG se muestran mediante `img`,
con dimensiones CSS y proporción intrínseca. No se aplican filtros ni máscaras que
alteren los originales. El indicador de pedidos es HTML y contiene un **1 de
demostración**, no información de una cuenta.

La fuente global está preparada como `"Exo", sans-serif`. No hay archivos de
fuente ni `@font-face` en el repositorio: falta incorporar Exo para distribuirla.
La revisión en este equipo usa su instalación local de Exo, sin descargar fuentes.

### Valores pendientes de Illustrator

Todos los siguientes tokens están en
`src/app/core/layout/header/header.scss` y llevan `TODO: Illustrator`:

| Categoría | Custom property             | Elemento                       |
| --------- | --------------------------- | ------------------------------ |
| Texto     | `--header-text`             | Navegación, controles e input  |
| Texto     | `--header-muted-text`       | Placeholder del input          |
| Texto     | `--header-badge-text`       | Número de pedidos              |
| Fondo     | `--header-surface`          | Navbar                         |
| Fondo     | `--header-search-surface`   | Campo de búsqueda              |
| Fondo     | `--header-accent`           | Botón Search                   |
| Fondo     | `--header-accent-hover`     | Hover de Search                |
| Fondo     | `--header-location-surface` | Control de ubicación           |
| Fondo     | `--header-badge-surface`    | Indicador de pedidos           |
| Gradiente | `--header-search-gradient`  | Contorno del buscador scrolled |
| Sombra    | `--header-shadow`           | Navbar scrolled                |
| Sombra    | `--header-search-glow`      | Brillo de Search               |

Los **colores de iconos** pertenecen a los cinco SVG originales de
`public/assets/icons/`: no tienen un token CSS porque los `img` externos
conservan sus propios colores. Se incorporarán al reemplazar los archivos.

Las dimensiones, tipografía, radios, duración y breakpoints son decisiones de
implementación, no valores pendientes de Illustrator.
