# Adfinity Website

Portfolio site built on the regin.in layout (jQuery, Bootstrap, Masonry) with **Adfinity** content served locally.

## Run locally

```bash
npm start
```

Open **http://localhost:3000**

## Regenerate homepage

After changing nav or homepage render logic:

```bash
npm run build
```

## Reset views / likes

```bash
npm run reset-stats
```

## Project layout

| Path | Purpose |
|------|---------|
| `data/portfolio.json` | All portfolio items (edit to add/change work) |
| `data/homepage-order.json` | Shuffled mix of all categories for the home page |
| `uploads/products/` | Portfolio images & videos |
| `resources/` | Site UI (CSS, JS, logos, icons) |
| `index.html` | Homepage (regenerate with `npm run build`) |

## Category routes

- Logos → `/logo-designs`
- Packaging → `/packaging-designs`
- Brochures → `/brochure-designs`
- Business cards → `/business-cards`
- Book titles → `/book-titles`
- Hoardings → `/hoardings`
- About → `/about`
- Contact → `/contact`
