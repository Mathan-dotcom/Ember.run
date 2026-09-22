# 🎛️ Meridian Design System & Styleguide

> **Design Direction:** Instrument-Panel Skeuomorphism
> **Brand Identity:** High-Precision Autonomous Financial Mission Control
> **Theme:** `data-theme="meridian"`
> **Version:** 4.0.0 (September 2026) — converted from v3.0.0 Brutalism

---

### What changed from v3.0.0

Meridian keeps its identity — financial mission control, tri-font hierarchy, semantic state colors — but the surface language moves from **raw poured concrete** to **machined instrument panel**: brushed aluminum, stitched leather, beveled glass, and backlit dials. Panels are no longer bolted-on objects declared by a border and a hard shadow; they are **physical instruments** — housed in metal bezels, lit from within, casting soft real-world shadows and catching real-world highlights. Where brutalism stated plainly "a wall, a label, a warning," skeuomorphism *simulates the object itself*: a gauge looks like a gauge, a switch looks like it can be flipped, a ledger looks like it was printed on real paper and fed through a machine. Depth is not architecture — depth is **light, material, and craft**. Every element earns its shape by resembling something you could actually hold, press, or read under a desk lamp.

---

## 1. Design Philosophy

Meridian's aesthetic is built on the concept of **"A Heartbeat, Not a Homepage"** — now rendered as a physical control console:

- **Machined Surfaces:** Every surface simulates a real material — brushed aluminum (`#e4e1d8`), oiled walnut-black casing (`#1c1a17`), or backlit smoked glass. Gradients, soft multi-layer shadows, and subtle noise/grain textures aren't decoration — they're the material rendering itself honestly under light.
- **Craft Is the Decoration:** Beveled edges, embossed labels, stitched leather trim, knurled dials, and riveted panel seams replace exposed grid lines. The instrument's construction *is* the ornament.
- **Light, Don't Stamp:** Status is communicated through backlit indicator lamps, glowing gauge needles, and glass-covered readouts — the visual language of a cockpit dashboard or a vintage mixing console, not industrial safety signage.
- **Mechanical Motion:** Needle sweeps, toggle-switch clicks, dial rotations, and analog easing (`cubic-bezier(0.34, 1.56, 0.64, 1)` — real spring-back) provide constant visual feedback of a living, autonomous system. Motion has mass and momentum; it never snaps like a stamp.
- **Typographic Discipline:** A tri-font hierarchy blending a classic engraved-display serif for numbers (like a gauge face) with a humanist grotesque for interface labels and a mechanical monospace, styled like ticker-tape print, for audit ledgers.

---

## 2. Color Palette & Token System

Skeuomorphism needs **layered, material-true color** — light and shadow simulating a real light source above the panel. Where brutalism derived meaning from ink coverage, skeuomorphism derives meaning from **highlight, shadow, and glow**. Semantic states keep their v1.0.0 logic but are re-expressed as *backlit indicator-lamp colors* on the machined base.

### 2.1 CSS Variables (`:root`)

```css
:root, [data-theme="pulse"], [data-theme="meridian"] {
  /* Substrates — the housing itself */
  --panel-alu: #e4e1d8;             /* Primary panel substrate — brushed aluminum */
  --panel-alu-shadow: #cfccc2;      /* Secondary substrate — recessed brushed-metal well */
  --panel-walnut: #1c1a17;          /* Inverted panels — oiled walnut-black casing */

  /* Ink & Structure */
  --ink-hard: #221f1c;              /* Primary engraved ink — deep umber-black */
  --ink-soft: #6b645a;              /* Secondary ink — pencil-graphite label gray */
  --bevel-light: rgba(255, 255, 255, 0.65); /* Top-edge highlight on beveled surfaces */
  --bevel-dark: rgba(0, 0, 0, 0.35);        /* Bottom-edge shadow on beveled surfaces */

  /* Soft Shadow — layered, blurred, directional light source */
  --sk-shadow: rgba(20, 18, 15, 0.28);      /* Ambient drop shadow — depth as real light, not offset */
  --sk-shadow-tight: rgba(20, 18, 15, 0.18); /* Close contact shadow for resting elements */

  /* Semantic State Colors — backlit indicator-lamp accents */
  --recovered: #1c1a17;
  --recovered-accent: #e4e1d8;      /* Brushed-metal badge fill */
  --recovered-mark: #34c76f;        /* Backlit OK-green lamp — the only "green light" in the system */

  --at-risk: #1c1a17;
  --at-risk-accent: #f5a623;        /* Backlit amber lamp — queued incidents, pending actions */

  --critical: #e4e1d8;
  --critical-accent: #e0392f;       /* Backlit red lamp — outages, fallback paths, aborts */

  --signal: #1c1a17;
  --signal-accent: #3b6fd6;         /* Backlit blue lamp — active pulse nodes, primary focus */

  /* Financial Ledgers */
  --ledger: #221f1c;
  --ledger-muted: #8a8178;

  /* Radius — generous. Skeuomorphism rounds every real-world edge. */
  --radius-pulse: 14px;
  --radius-pulse-sm: 8px;
}
```

### 2.2 Color Tokens & Intent

| Token | Hex | Role & Visual Intent |
| :--- | :--- | :--- |
| `--panel-alu` | `#e4e1d8` | Page background. Brushed aluminum — never pure white; metal catches warm ambient light. |
| `--panel-alu-shadow` | `#cfccc2` | Recessed wells, alternating rows — the shaded side of a curved metal surface. |
| `--panel-walnut` | `#1c1a17` | Inverted panels, header bars, footer housing — the dark casing the instrument is mounted in. |
| `--ink-hard` | `#221f1c` | All engraved labels, primary text, embossed borders. |
| `--bevel-light` / `--bevel-dark` | rgba white/black | The paired highlight+shadow pair that gives any edge its physical bevel. |
| `--sk-shadow` | `rgba(20,18,15,.28)` | Soft, blurred ambient shadow. Depth = light falling on a raised object, not displacement. |
| `--recovered-mark` | `#34c76f` | Settled payments, confirmed recoveries. A single lit lamp — sparing, glowing, never a wash. |
| `--at-risk-accent` | `#f5a623` | Degraded rails, queued incidents, pending gates. Amber lamp, glass-covered. |
| `--critical-accent` | `#e0392f` | Outages, rollbacks, aborts. Highest urgency — the reddest lamp on the panel, may pulse. |
| `--signal-accent` | `#3b6fd6` | Active nodes, primary actions, focus rings. Blue lamp — the color of an armed system. |
| `--ledger-muted` | `#8a8178` | Secondary metadata, timestamps, protocol schemas. Faded typewriter-ribbon gray, always monospace. |

**Accent discipline:** accents are *lit lamps behind glass*, never flat fills. A `--critical-accent` element is a glowing red dot with a soft radial bloom and a glass highlight — not a flat red block.

---

## 3. Typography System

Meridian combines three distinct Google Fonts loaded with `display: swap` for instant zero-layout-shift rendering. The condensed industrial grotesque is retired — skeuomorphism speaks in **engraved instrument-face type**:

```
Fraunces            Inter                 Space Mono
(Engraved Gauge Face) (Technical UI)      (Ticker-Tape Ledger)
"₹1.08 CR"          "WAR ROOM CONSOLE"    "ERR: 86,660 | 94.2% CONF"
```

### 3.1 Font Family Mapping

| Role | Font Family | Variable | Usage |
| :--- | :--- | :--- | :--- |
| **Display** | `Fraunces` (optical size, high contrast) | `--font-display` | Large revenue statistics, hero headings, financial metrics. Set with a subtle `text-shadow` emboss, like numerals engraved into a gauge face. |
| **UI & Headings** | `Inter` | `--font-ui` | Body copy, section titles, buttons, navigation, badges. |
| **Data & Ledger** | `Space Mono` | `--font-mono` | Audit trail timestamps, error codes, ERR formulas, section index numbers, code — styled to resemble dot-matrix ticker print. |

### 3.2 Typography Scale & Utility Classes

```css
/* Hero Numbers & Statements — engraved into a gauge face */
.text-display-xl {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 9vw, 6.5rem);
  line-height: 0.95;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink-hard);
  text-shadow: 0 1px 0 var(--bevel-light), 0 -1px 1px var(--bevel-dark);
}

/* Section Hero Numbers */
.text-display-md {
  font-family: var(--font-display);
  font-size: 2.5rem;
  line-height: 1.0;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-shadow: 0 1px 0 var(--bevel-light);
}

/* Card & Section Headings — prefixed with index numbers: "01 / GATEWAY RAILS" */
.text-heading {
  font-family: var(--font-ui);
  font-size: 1.25rem;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* Body & Explanations */
.text-body {
  font-family: var(--font-ui);
  font-size: 0.9375rem;
  line-height: 1.6;
  font-weight: 400;
  max-width: 68ch;               /* honest measure, comfortable to read under lamp light */
}

/* Numbers, Values & Statistics */
.text-data {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.4;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
}

/* Captions, Subtext, Labels & Badges */
.text-micro {
  font-family: var(--font-ui);
  font-size: 0.75rem;
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--ink-soft);
}
```

### 3.3 Universal Text Alignment Standard
Body copy stays left-aligned with a ragged-right edge — like text set on a printed instrument manual page. Headings and gauge labels never wrap awkwardly: they are sized with `clamp()` to fit on one line or break at a natural point.

```css
p, .text-body, .card-description {
  text-align: left;
  max-width: 68ch;
  text-wrap: pretty;
}
```

---

## 4. Skeuomorphic Elevation & Surface Architecture

Meridian panels are **machined, not bolted**. Every surface is defined by a **soft ambient shadow, a beveled edge, and often a subtle material gradient** — real light falling on a real object. Convex vs. recessed reads not from border weight but from **the direction of the bevel highlight**: a light-top/dark-bottom bevel with an outward shadow says "this object is raised"; the reverse, with an inward shadow, says "this area is pressed in."

### 4.1 Base Panel (`.sk-panel`)
Used for static sections, structural grids, and containers — reads as a brushed-metal plate mounted flush to the console:
```css
.sk-panel {
  background: linear-gradient(180deg, #e9e6dd 0%, var(--panel-alu) 60%, var(--panel-alu-shadow) 100%);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-pulse);
  box-shadow:
    0 1px 0 var(--bevel-light) inset,
    0 -1px 0 var(--bevel-dark) inset,
    0 6px 16px var(--sk-shadow-tight);
}
```

### 4.2 Raised / Floating Panel (`.sk-panel-raised`)
Used for modals, tooltips, and top-layer drawers — depth is real light: a soft, wide, blurred shadow beneath a panel that sits visibly above the console:
```css
.sk-panel-raised {
  background: linear-gradient(180deg, #f0ede3 0%, var(--panel-alu) 55%, var(--panel-alu-shadow) 100%);
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: calc(var(--radius-pulse) + 4px);
  box-shadow:
    0 1px 0 var(--bevel-light) inset,
    0 18px 40px var(--sk-shadow);
}
```

### 4.3 Indicator Badge / Status Lamp (`.sk-badge`)
Used for badges, status chips, and protocol tags — small backlit lamps set into a metal bezel, glass-covered, with a soft glow when active:
```css
.sk-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: linear-gradient(180deg, #f2efe6, var(--panel-alu-shadow));
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 999px;
  box-shadow: 0 1px 0 var(--bevel-light) inset, 0 2px 4px var(--sk-shadow-tight);
  font-family: var(--font-ui);
  font-weight: 600;
  letter-spacing: 0.03em;
}
.sk-badge--inverted { background: linear-gradient(180deg, #2a2723, var(--panel-walnut)); color: var(--panel-alu); }
.sk-badge--lamp::before {
  content: "";
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--recovered-mark);
  box-shadow: 0 0 6px 2px var(--recovered-mark);
}
```

### 4.4 Recessed Well (`.sk-well`)
Used for input fields, search bars, read-only logs — a slot machined *into* the panel, differentiated by an **inverted bevel and a soft inner shadow** rather than any raised trick:
```css
.sk-well {
  background: var(--panel-alu-shadow);
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: var(--radius-pulse-sm);
  box-shadow:
    inset 0 2px 5px var(--sk-shadow-tight),
    inset 0 -1px 0 var(--bevel-light);
}
```

### 4.5 Machined Structure Utilities
```css
.sk-brushed-texture {
  background-image: repeating-linear-gradient(
    90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 3px
  );   /* fine brushed-aluminum grain */
}
.sk-seam-top    { box-shadow: 0 1px 0 var(--bevel-dark), 0 2px 0 var(--bevel-light); }
.sk-rivet { width: 6px; height: 6px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #f4f1e8, var(--panel-alu-shadow) 70%);
  box-shadow: 0 1px 1px var(--sk-shadow-tight); }
.sk-index::before {
  content: attr(data-index);    /* "01" — every section is numbered, engraved like a dial index */
  font-family: var(--font-mono);
  color: var(--ink-soft);
  margin-right: 0.75rem;
  text-shadow: 0 1px 0 var(--bevel-light);
}
```

---

## 5. Interaction & Motion System

### 5.1 Card Interaction (`.card-hover`)
Skeuomorphic cards **lift physically on hover** — the ambient shadow widens and softens, as if the card were rising slightly off the console under real light. On click, the card **presses down**, its shadow tightening as if it made contact with the surface beneath it. Transitions carry real spring and weight (`cubic-bezier(0.34, 1.56, 0.64, 1)` at ~220ms); there is no mechanical snap:

```css
.card-hover {
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, box-shadow;
  position: relative;
}

.card-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 1px 0 var(--bevel-light) inset, 0 16px 28px var(--sk-shadow);
  z-index: 20;
}

.card-hover:active {
  transform: translateY(1px);
  box-shadow: inset 0 2px 6px var(--sk-shadow-tight);
}
```

### 5.2 Button Hierarchy

#### Secondary Instrument Button (`.sk-button`)
```css
.sk-button {
  background: linear-gradient(180deg, #f2efe6 0%, var(--panel-alu) 50%, var(--panel-alu-shadow) 100%);
  border: 1px solid rgba(0, 0, 0, 0.16);
  border-radius: var(--radius-pulse-sm);
  box-shadow:
    0 1px 0 var(--bevel-light) inset,
    0 3px 6px var(--sk-shadow-tight);
  color: var(--ink-hard);
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease-out;
}
.sk-button:hover {
  background: linear-gradient(180deg, #f7f4eb 0%, #e9e6dd 50%, var(--panel-alu-shadow) 100%);
  box-shadow: 0 1px 0 var(--bevel-light) inset, 0 5px 10px var(--sk-shadow-tight);
}
.sk-button:active {
  transform: translateY(1px);
  box-shadow: inset 0 2px 5px var(--sk-shadow-tight);
}
```

#### Primary Accent Action Button (`.sk-button-primary`)
Primary actions **light up**: dark walnut housing, brushed-metal-colored text, a glowing blue backlight beneath the label — the emphasized choice reads as the one lit control on the panel:
```css
.sk-button-primary {
  background: linear-gradient(180deg, #2e2b26 0%, var(--panel-walnut) 60%, #131210 100%);
  color: var(--panel-alu);
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-radius: var(--radius-pulse-sm);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.08) inset,
    0 0 0 1px rgba(59, 111, 214, 0.25),
    0 4px 14px rgba(59, 111, 214, 0.35);
  font-weight: 600;
}
.sk-button-primary:hover {
  box-shadow:
    0 1px 0 rgba(255,255,255,0.1) inset,
    0 0 0 1px rgba(59, 111, 214, 0.4),
    0 6px 20px rgba(59, 111, 214, 0.5);
}
.sk-button-primary:active {
  transform: translateY(1px);
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.4);
}
```

#### Focus State (non-negotiable)
```css
.sk-button:focus-visible,
.card-hover:focus-visible {
  outline: 3px solid var(--signal-accent);
  outline-offset: 2px;
}
```

### 5.3 Keyframe Animations

#### Recovery Stamp → Recovery Lamp (`@keyframes recoveryLamp`)
A successful recovery is confirmed with a **lamp powering on** — the confirmation badge glows in with a soft bloom, overshoots gently, then settles at rest brightness. No slam; illumination:
```css
@keyframes recoveryLamp {
  0%   { opacity: 0; box-shadow: 0 0 0 0 var(--recovered-mark); transform: scale(0.92); }
  55%  { opacity: 1; box-shadow: 0 0 16px 6px var(--recovered-mark); transform: scale(1.03); }
  100% { opacity: 1; box-shadow: 0 0 6px 2px var(--recovered-mark); transform: scale(1); }
}
```

#### Rollback Flinch → Needle Flinch (`@keyframes needleFlinch`)
Kept from v1.0.0 but **re-grounded in physics** — a damped mechanical oscillation, like a real gauge needle absorbing a shock and settling:
```css
@keyframes needleFlinch {
  0%   { transform: rotate(0deg); }
  20%  { transform: rotate(-5deg); }
  45%  { transform: rotate(4deg); }
  70%  { transform: rotate(-2deg); }
  100% { transform: rotate(0deg); }
}
```

#### Critical Alert → Lamp Pulse (`@keyframes criticalPulse`)
Soft breathing glow for critical panels — a lit red lamp behind glass, pulsing like a real warning light rather than hard-inverting:
```css
@keyframes criticalPulse {
  0%, 100% { box-shadow: 0 0 8px 2px var(--critical-accent); }
  50%      { box-shadow: 0 0 20px 8px var(--critical-accent); }
}
```

---

## 6. Signature Visual Components

### 6.1 Transaction Flow Matrix (`FlowMatrix`)
- **Technology:** HTML5 2D Canvas with requestAnimationFrame.
- **Visual:** 70+ nodes on a **etched circuit-board backing** (subtle copper-trace texture, not a flat void), connected by soft glowing traces — a real PCB under panel glass, not a diagram.
- **Dynamic Physics:** During failure spikes, connecting traces **glow hazard-amber** with a soft bloom and nodes pulse larger with a radial highlight. On confirmed recovery, the affected route lights solid green and the trace settles with a gentle fade.
- **Styling:** nodes are rendered as small domed lamps (`radial-gradient` fill, soft specular highlight at 35%/35%), never flat squares; edges are anti-aliased and slightly blurred, like light through glass.

### 6.2 Immutable Terminal Audit Ledger (`AuditTrail`)
- **Style:** Monospace ticker-tape output inside a `.sk-well` with **soft alternating banding** (`--panel-alu` / `--panel-alu-shadow`, blended not hard-edged) — the log reads like paper fed through a dot-matrix printer under glass, not a raw screen.
- **Row prefix:** every entry is prefixed with a monospace index (`#0042`) and a status lamp (`● OK` / `● WARN` / `● ABORT`) rendered as a small glowing dot, not bracketed text.
- **Colors:** status is lit — soft green glow `OK`, amber glow `WARN`, pulsing red glow (`criticalPulse`) on `ABORT`. Hashes and timestamps in `--ledger-muted`, slightly faded like old ribbon ink.
- **Header:** A walnut-casing bar (`background: var(--panel-walnut)`) with an embossed title, a soft breathing cursor glow, and an engraved section index number.

### 6.3 Confidence & Autonomy Gauge (`ConfidenceGate`)
- **Visual:** Restores a **circular analog dial** — a real needle gauge set into a brushed-metal bezel with a glass cover and a soft specular highlight arcing across the top, sweeping smoothly toward the Bayesian Autonomy Gate (≥ 0.70 threshold).
- **Threshold marker:** A small raised metal tick at the 70% position with an engraved micro-label: `▲ AUTONOMY GATE — 0.70`.
- **Color Progression:** dim gray needle → ink-hard → blueprint-blue glow as confidence crosses the gate; below 0.40 the needle and tick glow hazard-amber. At full confidence, a small lamp beside the dial lights up and holds steady in `--recovered-mark`, labeled `AUTO`.

---

## 7. Component Usage Checklist

When building new components for Meridian:
- [ ] Use `font-ui` (`Inter`) for titles and controls — sentence case is fine; skeuomorphism doesn't require shouting.
- [ ] Use `font-display` (`Fraunces`) for primary financial numbers and tickers — subtle emboss text-shadow, generous scale, never uppercase-only by default.
- [ ] Use `font-mono` (`Space Mono`) for hashes, IDs, error codes, index numbers, and formula parameters — styled to read like ticker-tape or dot-matrix print.
- [ ] Set generous `border-radius` (`--radius-pulse` / `--radius-pulse-sm`) everywhere a real object would have a machined or molded edge.
- [ ] Give every panel a soft ambient shadow plus a light-top/dark-bottom bevel pair — never a flat, hard-edged offset shadow.
- [ ] Use `.sk-well` (recessed substrate + inner shadow) for anything pressed-in: inputs, search bars, read-only logs.
- [ ] Use `.sk-panel-raised` (wide blurred shadow) for anything floating: cards, modals, buttons.
- [ ] Wrap clickable cards in `.card-hover` with `.sk-panel`; use spring-based easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`), never a hard step.
- [ ] Number every section with an engraved monospace index (`01`, `02`…) via `.sk-index`.
- [ ] Keep accent colors strictly within the backlit-lamp set (amber, red, blue, green) — and render them as glowing dots and soft blooms, never as flat fills or stripes.
- [ ] Simulate craft: bevels, brushed-metal grain, rivets, and soft shadows are features. If a surface reads flat, add light and material to it.
