# Entry Door SVG Design

**Date:** 2026-05-19

## Summary

Replace the placeholder green square + "DOOR" text on the bar floor with a proper top-down SVG door that visually reflects whether the bar is open or closed.

## Visual Design

Style matches the existing `BathroomSVG` / `KegeratorSVG` pattern: top-down floor-plan view, 50×50 viewBox, fills its cell absolutely.

**Closed state (BUILD and REPORT phases):**
- Bottom wall section (same purple-grey as bathroom walls)
- Two wooden door frame posts at the gap edges
- Wooden door panel with recessed rectangular panels and a brass knob
- Faint door-swing arc to suggest the door can open

**Open state (RUNNING phase):**
- Same wall section and frame posts
- Door gap reveals a dark interior opening (no panel)
- Green glowing threshold strip at the bottom edge

## Components

### `src/components/DoorSVG.jsx` (new)

```
Props: { isOpen: boolean }
```

SVG 50×50, `preserveAspectRatio="none"`, `position: absolute`, fills parent. Renders closed or open state based on `isOpen`.

### `src/components/GameGrid.jsx` (modified)

- Add `dayState` prop (string: `'BUILD' | 'RUNNING' | 'REPORT'`)
- Derive `isOpen = dayState === 'RUNNING'`
- Replace `{isDoor && <div style=...>DOOR</div>}` with `<DoorSVG isOpen={isOpen} />`
- Add `overflow: hidden` to the door cell (via CSS) so the absolute-positioned SVG clips cleanly within the 50×50 cell

### `src/components/GameGrid.css` (modified)

- Remove `background: rgba(16, 185, 129, 0.2)` and `border-bottom: 2px solid #10b981` from `.grid-cell.door`
- The SVG handles all door visuals

### `src/App.jsx` (modified)

- Pass `dayState={dayState}` to the main bar floor `<GameGrid>` call (line ~758)

## State Logic

| `dayState` | `isOpen` | Door appearance |
|------------|----------|----------------|
| `BUILD`    | false    | Closed wooden door |
| `RUNNING`  | true     | Open dark entryway |
| `REPORT`   | false    | Closed wooden door |

## Out of Scope

- Animated door open/close transition
- Door interaction (clicking the door)
- Inventory/backroom grid door (already has `showDoor={false}`)
