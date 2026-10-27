# Axteri Marketplace

Frontend del marketplace B2B de **Axteri**, desarrollado y mantenido por **L4Dev**.

Este repositorio contiene exclusivamente la aplicación del marketplace. La landing comercial de Axteri, desarrollada en Astro, se mantiene en un repositorio independiente.

## Stack

- **Angular 22**
- **TypeScript 6** con `strict`
- **Angular Router**
- **Angular Signals**
- **RxJS**
- **SCSS**
- **BEM**
- **CSS Custom Properties** para design tokens
- **Vitest**
- **ESLint**
- **Prettier**
- **pnpm**

La aplicación utiliza componentes standalone y la configuración moderna de Angular.

## Inicio rápido

### Requisitos

- Node.js compatible con la versión de Angular definida en el proyecto.
- pnpm `10.23.0`.

### Instalación

```bash
pnpm install --frozen-lockfile
```

### Desarrollo

```bash
pnpm start
```

La aplicación estará disponible en:

```text
http://localhost:4200/
```

> En PowerShell, si la política de ejecución bloquea `pnpm.ps1`, utiliza `pnpm.cmd`.

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm start` | Inicia el servidor de desarrollo |
| `pnpm build` | Genera el build de producción |
| `pnpm watch` | Ejecuta el build en modo observación |
| `pnpm test` | Ejecuta las pruebas con Vitest |
| `pnpm test --watch=false` | Ejecuta las pruebas una sola vez |
| `pnpm lint` | Ejecuta ESLint |
| `pnpm format` | Formatea el proyecto con Prettier |
| `pnpm format:check` | Verifica el formato sin modificar archivos |

## Arquitectura

El proyecto sigue una organización **feature-first**.

```text
src/app/
├── core/
│   └── layout/
│       ├── header/
│       ├── footer/
│       └── main-layout/
│
├── shared/
│   └── ui/
│       └── product-card/
│
├── models/
│   └── product.model.ts
│
├── features/
│   └── home/
│       ├── pages/
│       │   └── home-page/
│       ├── components/
│       │   ├── hero/
│       │   ├── limited-offers/
│       │   ├── categories/
│       │   ├── featured-products/
│       │   ├── quality-banner/
│       │   ├── preferred-brands/
│       │   ├── news/
│       │   └── recommendations/
│       ├── data/
│       └── models/
│
├── app.config.ts
├── app.routes.ts
└── app.ts
```

### Criterios de arquitectura

- `core/` contiene infraestructura y elementos globales de la aplicación.
- `shared/` contiene componentes reutilizables entre distintas features.
- `features/` agrupa funcionalidad por dominio o sección.
- Cada feature encapsula sus propios componentes, datos y modelos cuando corresponde.
- Se evita crear abstracciones o carpetas antes de que exista una necesidad real.
- Los componentes visuales se mantienen desacoplados de futuras APIs y servicios.

## Git workflow

El repositorio utiliza dos ramas permanentes:

- `main`: versión estable del marketplace.
- `dev`: rama de integración del desarrollo activo.

No se desarrolla directamente sobre `main` ni `dev`.

### Flujo

```text
component/* ─┐
feature/*   ─┤
page/*      ─┤
service/*   ─┤
fix/*       ─┼── PR → dev
refactor/*  ─┤
chore/*     ─┤
docs/*      ─┘

dev
 │
 └── PR → main
```

Las ramas de trabajo deben partir siempre de un `dev` actualizado.

```bash
git switch dev
git pull origin dev
```

Luego crea la rama correspondiente:

```bash
git switch -c component/<name>
git switch -c feature/<name>
git switch -c page/<name>
git switch -c service/<name>
git switch -c fix/<name>
git switch -c refactor/<name>
git switch -c chore/<name>
git switch -c docs/<name>
```

Ejemplos:

```text
component/header
component/hero
component/product-card

feature/search
feature/cart

page/catalog
page/product-detail

service/products-api

fix/header-responsive
fix/products-mega-menu

refactor/header-navigation

docs/git-workflow
```

Las ramas deben ser específicas y de vida corta.

Una rama ya integrada no debe reutilizarse para cambios posteriores.

Por ejemplo, después de integrar:

```text
component/header
```

una corrección futura debe realizarse desde una nueva rama:

```text
fix/header-search
fix/header-responsive
refactor/header-navigation
```

## Pull Requests

Las ramas de trabajo crean Pull Request hacia:

```text
dev
```

Cuando `dev` representa una versión estable y validada:

```text
dev → PR → main
```

Antes de abrir un PR:

```bash
pnpm format:check
pnpm lint
pnpm test --watch=false
pnpm build
```

El PR no debe contener errores conocidos introducidos por sus cambios.

### Títulos de Pull Request

Los títulos siguen **Conventional Commits**:

```text
<type>(<scope>): <description>
```

Ejemplos:

```text
feat(header): implement responsive marketplace header
feat(hero): implement marketplace hero
fix(header): correct products mega menu behavior
refactor(header): simplify navigation state
docs(readme): document branch workflow
```

## Mantener una rama actualizada

Obtén primero los cambios recientes:

```bash
git fetch origin
```

Si eres la única persona trabajando sobre la rama:

```bash
git rebase origin/dev
```

Si la rama está compartida:

```bash
git merge origin/dev
```

Después de hacer rebase sobre una rama que ya fue publicada:

```bash
git push --force-with-lease
```

No utilices `git push --force`.

## Commits

Los commits también siguen **Conventional Commits**:

```text
<type>(<scope>): <description>
```

Tipos principales:

| Tipo | Uso |
| --- | --- |
| `feat` | Nueva funcionalidad |
| `fix` | Corrección |
| `refactor` | Refactor sin cambiar comportamiento |
| `docs` | Documentación |
| `chore` | Configuración o mantenimiento |
| `test` | Pruebas |

Ejemplos:

```text
feat(header): add products mega menu
fix(header): refine responsive behavior
feat(hero): implement marketplace hero
docs(readme): document branch workflow
```

Los commits deben ser pequeños, coherentes y evitar mezclar cambios no relacionados.

## Estilos

### BEM

Los estilos utilizan BEM:

```scss
.product-card {
  &__image {
  }

  &__content {
  }

  &__title {
  }

  &__price {
  }

  &--featured {
  }
}
```

### Responsive

La estrategia del proyecto es **desktop-first**.

Breakpoints oficiales:

| Breakpoint | Valor |
| --- | ---: |
| `2xl` | `96rem` / 1536px |
| `xl` | `80rem` / 1280px |
| `lg` | `64rem` / 1024px |
| `md` | `48rem` / 768px |
| `sm` | `40rem` / 640px |

No es obligatorio utilizar todos los breakpoints en cada componente.

Evita agregar breakpoints arbitrarios cuando los oficiales puedan resolver correctamente la adaptación.

## Diseño y assets

La interfaz se implementa a partir de los diseños oficiales de Axteri.

Los recursos estáticos se organizan dentro de:

```text
public/assets/
├── logos/
├── icons/
├── images/
└── ...
```

Los valores visuales provenientes del diseño y pendientes de definición definitiva se gestionan mediante tokens o custom properties cuando corresponde.

Principalmente:

- colores de texto;
- colores de iconos;
- fondos;
- gradientes;
- sombras.

Las dimensiones, spacing, tipografía responsive y comportamiento de los componentes son decisiones de implementación frontend.

La tipografía principal del proyecto es **Exo**.

## Estado actual

La Home se encuentra en desarrollo por secciones.

Estructura prevista:

```text
Header
Hero
Ofertas por tiempo limitado
Categorías
Productos destacados
Productos de calidad
Marcas preferidas
Noticias
Sugerencias
Footer
```

Actualmente:

- la estructura general de la Home está preparada;
- el Header está implementado;
- existen mocks tipados para desarrollar la interfaz sin depender todavía de APIs;
- `ProductCard` se reutiliza entre las distintas secciones de productos;
- el resto de secciones se implementará progresivamente.

## Integraciones futuras

Todavía están fuera del alcance de la fase actual:

- autenticación con Clerk;
- backend;
- base de datos;
- APIs de productos;
- búsqueda real;
- carrito;
- favoritos;
- cotizaciones;
- checkout;
- pagos;
- funcionalidades de vendedor;
- integraciones con n8n.

Estas funcionalidades se incorporarán progresivamente sin acoplar prematuramente la UI a implementaciones futuras.

## Buenas prácticas

- No hagas push directo a `main` ni `dev`.
- Parte siempre de un `dev` actualizado.
- No reutilices ramas ya integradas.
- Mantén los cambios de una rama enfocados en una responsabilidad.
- No subas credenciales ni secretos.
- No subas referencias de diseño locales que no formen parte del producto.
- Evita dependencias innecesarias.
- Reutiliza componentes únicamente cuando exista una necesidad real.
- Evita sobrecomponentización y abstracciones prematuras.
- Mantén accesibilidad y HTML semántico.
- Ejecuta lint, tests y build antes de solicitar integración.

## Licencia

Proyecto privado desarrollado por **L4Dev** para **Axteri**.