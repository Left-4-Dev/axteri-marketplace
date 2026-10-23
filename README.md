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

## Referencia y límites de esta iteración

Se analizó visualmente `references/home-design.png`, la referencia desktop oficial.
La secuencia es: header, hero, ofertas, categorías, destacados, banner de calidad,
marcas preferidas, noticias, sugerencias y footer. La captura muestra cinco ofertas,
nueve categorías, cinco destacados, tres marcas y diez sugerencias.

`references/` contiene material local de análisis: no se importa, copia, transforma
ni publica. Queda excluido de Prettier y de los assets de Angular. No se han
descargado imágenes ni añadido dependencias.

Esta implementación es un **esqueleto semántico**, no una reproducción visual.
Los colores y medidas siguen siendo provisionales. `src/styles/_skeleton.scss`
comparte únicamente reglas SCSS mínimas de listas, secciones y placeholders.
Se mantiene el enfoque desktop-first, sin introducir breakpoints ni implementar
todavía el responsive definitivo.

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
  ficticias. El branding permanece como texto hasta recibir los logos.
- El buscador se mantiene dentro de Hero: todavía no hay otro consumidor que
  justifique un componente de búsqueda compartido.

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
