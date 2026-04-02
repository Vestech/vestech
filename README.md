# VesTech Research

Blog VesTech Research — výzkum na hraně technologií.

**Tech stack:** Astro 6 · Tailwind CSS 4 · TypeScript  
**Hosting:** Cloudflare Pages  
**Doména:** vestech.cz

---

## Lokální vývoj

```bash
npm install
npm run dev
# → http://localhost:4321
```

## Build

```bash
npm run build
# výstup: ./dist/
```

---

## Nový článek

Vytvoř soubor v `src/content/blog/`:

```markdown
---
title: "Název článku"
description: "Popis pro SEO a náhled"
pubDate: 2026-04-02
author: Ondra        # nebo Jára
lang: cs             # nebo en
tags: [AI, QA]
readTime: 5
---

Obsah článku v Markdownu...
```

EN verze: stejný soubor s `lang: en`, uložit jako `-en.md`

---

## Deploy na Cloudflare Pages

### Jednorázový setup

1. Nahraj kód na GitHub: `github.com/vestech/vestech-research`
2. Přihlas se na [pages.cloudflare.com](https://pages.cloudflare.com)
3. **Create application** → **Pages** → **Connect to Git**
4. Vyber repo, nastav:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version** (Environment variable): `NODE_VERSION = 20`
5. Klikni **Save and Deploy**

### Napojení domény vestech.cz (Forpsi)

Po prvním deployi dostaneš URL jako `vestech-research.pages.dev`.

V **Cloudflare Pages → Custom domains** přidej `vestech.cz`.

Cloudflare ti ukáže DNS záznamy — přidej je u Forpsi:
- Typ `A`, název `@`, hodnota: IP z Cloudflare
- Typ `CNAME`, název `www`, hodnota: `vestech-research.pages.dev`

SSL se nastaví automaticky.

### Každý další deploy

```bash
git add . && git commit -m "nový článek" && git push
# Cloudflare automaticky builduje a nasazuje
```
