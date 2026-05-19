# Win95 Theme Overhaul Design

**Date:** 2026-05-19

## Summary

Replace the current dark glassmorphism aesthetic (navy backgrounds, blur effects, Inter font, rounded glass panels) with a Windows 95 visual language applied to the existing layout. The Computer screen and DecisionModal already have correct Win95 styling; this overhaul makes everything else match them.

## Scope

**In scope:**
- `src/index.css` — global tokens, font, body background
- New `src/win95.css` — shared Win95 utility classes
- `src/components/TopBar.css` + mobile two-row layout
- `src/components/StartMenu.css`
- `src/components/ReportModal.css`
- `src/components/EventNotification.css`
- `src/components/WinScreen.css`
- `src/components/BankruptScreen.css`
- `src/components/Inventory.css`
- `src/components/GameGrid.css` (play-area wrapper only)

**Out of scope (already correct or intentionally unchanged):**
- `src/components/Computer.css` — already Win95
- `src/components/DecisionModal.css` — already Win95
- Game grid dark floor (`background: rgba(0,0,0,0.4)`) — bar interior, not UI
- Customer/machine SVGs and all game logic

## Design System

### New file: `src/win95.css`

Imported once by `index.css`. Provides reusable Win95 building blocks.

```css
/* Raised panel — standard Win95 box */
.w95-panel {
  background: #c0c0c0;
  border-top: 2px solid #ffffff;
  border-left: 2px solid #ffffff;
  border-bottom: 2px solid #808080;
  border-right: 2px solid #808080;
}

/* Sunken inset — for lists, grids, text areas */
.w95-inset {
  background: #c0c0c0;
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-bottom: 2px solid #ffffff;
  border-right: 2px solid #ffffff;
}

/* Title bar — blue gradient, white text */
.w95-titlebar {
  background: linear-gradient(to right, #000080, #1084d0);
  color: #ffffff;
  font-weight: bold;
  font-size: 0.82rem;
  letter-spacing: 0.02em;
  padding: 4px 8px;
  user-select: none;
}

/* Standard button */
.w95-btn {
  background: #c0c0c0;
  color: #000000;
  border-top: 2px solid #ffffff;
  border-left: 2px solid #ffffff;
  border-bottom: 2px solid #808080;
  border-right: 2px solid #808080;
  font-family: inherit;
  cursor: pointer;
  padding: 4px 16px;
}
.w95-btn:active {
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-bottom: 2px solid #ffffff;
  border-right: 2px solid #ffffff;
  padding: 5px 15px 3px 17px;
}
.w95-btn:disabled {
  color: #808080;
  cursor: not-allowed;
}

/* Primary button (navy) */
.w95-btn-primary {
  background: #000080;
  color: #ffffff;
  border-top: 2px solid #aaaacc;
  border-left: 2px solid #aaaacc;
  border-bottom: 2px solid #000040;
  border-right: 2px solid #000040;
  font-family: inherit;
  cursor: pointer;
  padding: 4px 16px;
}
.w95-btn-primary:active {
  border-color: #000040;
  border-bottom-color: #aaaacc;
  border-right-color: #aaaacc;
}
.w95-btn-primary:disabled {
  background: #808080;
  border-color: #808080;
  cursor: not-allowed;
}
```

### Updated `index.css` tokens

```css
:root {
  --bg-color: #c0c0c0;
  --panel-bg: #c0c0c0;
  --accent-color: #000080;
  --text-primary: #000000;
  --text-secondary: #444444;
  --glass-border: #808080;
}

body {
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  background: #c0c0c0;
}
```

Remove `backdrop-filter`, `border-radius` defaults, and `--glass-border` usage from global rules.

## Component Designs

### TopBar

- Background: `#c0c0c0`, bottom border `2px solid #808080`, no blur
- Stat pills: `.w95-panel` raised boxes, black text, no border-radius
- "Open Bar" / "Start Day" button: `.w95-btn-primary`
- Computer button: `.w95-btn`
- Day clock SVG: keep ring, change track color to `#808080`, ring color stays green/amber/red
- Brand name: black text, no accent color

**Mobile layout (≤640px):**
- Row 1: bar name (left) + action button + computer button (right)
- Row 2: all stat pills wrapped, smaller font (`11px`)

### StartMenu

- Replace glassmorphism modal with `.w95-panel` window
- Add `.w95-titlebar` header: "Pinbar Tycoon"
- Buttons: `.w95-btn` for New Game / Load Game, full width
- Background overlay: solid `#c0c0c0`, no blur, no border-radius

### ReportModal

- `.w95-titlebar` header: "End of Day Report"
- `.w95-panel` body
- Stats list: `.w95-inset` container, black text
- "Next Day" button: `.w95-btn`
- Width: `380px` desktop, `90vw` mobile

### WinScreen

- `.w95-titlebar` header: "Congratulations!"
- `.w95-panel` body with win stats
- "Play Again" button: `.w95-btn-primary`
- Remove gold glow, Georgia font → inherit Tahoma

### BankruptScreen

- `.w95-titlebar` header: "Game Over"
- `.w95-panel` body
- "Try Again" button: `.w95-btn`

### EventNotification

- Raised `.w95-panel` (no glassmorphism, no colored left-border)
- Severity shown by icon prefix: `⚠️` bad, `✅` good, `ℹ️` neutral
- Label: black, `font-size: 10px`, uppercase
- Message: black, `font-size: 12px`
- Position: fixed bottom-center, same as now

### Inventory

- `.w95-panel` wrapper
- Section labels: black text, no accent color
- Remove backdrop-filter

### GameGrid play area

- `.play-area` background: `#008080` (Win95 teal desktop)
- `.bar-grid` border: `.w95-inset` style (sunken into the desktop)
- Grid cells: keep existing dark floor colors

## Mobile Responsiveness

### TopBar (≤640px)
- `flex-wrap: wrap`
- Row 1: brand + action buttons (space-between)
- Row 2: stat pills at `font-size: 11px`

### Grid scrolling (≤768px)
- `.play-area`: `overflow: auto; padding: 0.5rem`
- Grid renders at full 750×500px, scrollable within play area
- No change to `CELL_SIZE` or grid logic

### Modals (≤480px)
- All modals: `width: 95vw; max-width: 380px`
- Font sizes reduce by ~10%

## Global Buttons (`index.css`)

`.buy-btn` and `.repair-btn` are defined in `index.css` and used across components. Replace with Win95 style:

- `.buy-btn` → `.w95-btn-primary` style (navy background, white text, Win95 border)
- `.repair-btn` → `.w95-btn` style (silver background, black text, Win95 border, green text color retained for semantic meaning)
- Remove `border-radius` from both

## Typography

- Font: `'MS Sans Serif', Tahoma, sans-serif` globally (no external import needed — system font)
- All `font-family: 'Inter'` references removed from CSS files
