# Admin workflow pro schvalování článků

## Co je hotové

Web teď podporuje stav článku přímo ve frontmatteru markdown souborů:

- `draft` — rozpracovaný článek
- `in_review` — připraveno ke schválení
- `rework` — vráceno k přepracování
- `published` — veřejně publikováno

Veřejný blog (`/blog`, `/en/blog`) zobrazuje **jen články se stavem `published`**.

Admin přehled je na:

- `/admin`

## Ochrana admin sekce

`/admin` je nově schovaný za přihlašovací branou přímo na webu.
Bez zadání hesla se dashboard nezobrazí.

Aktuální řešení:

- lehká klientská ochrana pro statický deploy
- po zadání správného hesla se admin odemkne v rámci session
- po odhlášení nebo zavření session je potřeba znovu přihlášení

### Aktuální admin heslo

- `vestech-admin-2026`

> Doporučení: tohle je dobré jako rychlá první ochrana, ale není to plnohodnotné server-side zabezpečení. Pro produkční vyšší ochranu doporučuju přejít na Cloudflare Access nebo server-side auth vrstvu.

## Jak to používat

Každý článek v `src/content/blog/*.md` může mít ve frontmatteru např.:

```md
---
title: Název článku
description: Krátký popis
pubDate: 2026-04-05
author: Jára
lang: cs
tags:
  - AI
  - QA
readTime: 6
status: in_review
reviewerNotes: "Zkrátit úvod a doplnit konkrétní příklad."
---
```

## Doporučený workflow

### 1. AI připraví článek

Když připravím nový článek, nastavím mu typicky:

- `status: draft` během psaní
- `status: in_review` když je připravený na tvoje posouzení

### 2. Ty otevřeš admin sekci

V adminu uvidíš články rozdělené podle stavů.

### 3. Rozhodnutí

Pokud článek chceš publikovat:

- změň `status: published`

Pokud ho chceš vrátit:

- změň `status: rework`
- doplň `reviewerNotes`

Pokud ho chceš znovu poslat ke schválení po úpravě:

- změň `status: in_review`

## Důležitá technická poznámka

Aktuální web běží jako **statický Astro web na Cloudflare Pages**.
To znamená:

- admin dashboard je reálný
- filtrování publikovaných článků je reálné
- ale změna stavu článku zatím probíhá přes úpravu markdown souboru v repozitáři + nový deploy

## Co by bylo potřeba pro plně klikací admin

Aby na webu fungovalo přímo tlačítko:

- `Publikovat`
- `Vrátit k přepracování`

...bez ruční editace souboru, je potřeba doplnit jednu z těchto variant:

### Varianta A — GitHub API + chráněná admin akce

Admin stránka by po kliknutí:

- upravila markdown přes GitHub API
- commitla změnu do repa
- spustila nový deploy

Výhody:

- nejbližší tomu, co chceš
- pořád se držíme markdown workflow

Nevýhody:

- potřebuje bezpečné uložení tokenu
- chce to serverovou/admin vrstvu

### Varianta B — Malý backend / databáze draftů

Články by se ukládaly mimo markdown do draft storage a publikace by je teprve převáděla do veřejného obsahu.

Výhody:

- čistší redakční workflow

Nevýhody:

- větší zásah do architektury
- víc práce

## Doporučení

Pro VesTech bych šel do **Varianty A: GitHub API admin publish workflow**.
Je to nejrychlejší cesta k tomu, aby sis na webu opravdu kliknul na publish / vrátit k přepracování a ono to reálně změnilo obsah webu.
