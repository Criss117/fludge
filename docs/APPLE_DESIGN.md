---
name: Paper Glass
colors:
  primary: "#2E2E2E"
  surface-tint: "#2E2E2E"
  on-primary: "#E6E4D7"
  primary-container: "#E3DDCF"
  on-primary-container: "#1E1E1E"
  secondary: "#5E5A52"
  on-secondary: "#F4EFE4"
  secondary-container: "#D8D2C4"
  on-secondary-container: "#2E2E2E"
  tertiary: "#F26A4B"
  on-tertiary: "#FFFFFF"
  tertiary-container: "#FFD2BE"
  on-tertiary-container: "#52170B"
  error: "#DC2626"
  on-error: "#FFFFFF"
  error-container: "#FFD9D3"
  on-error-container: "#720309"
  background: "#E9E4D8"
  on-background: "#1E1E1E"
  surface: "#E9E4D8"
  on-surface: "#1E1E1E"
  surface-variant: "#CFC8B8"
  on-surface-variant: "#5E5A52"
  outline: "#A89F8F"
  outline-variant: "#D2CBBB"
  shadow: "#000000"
  scrim: "#000000"
  inverse-surface: "#1E1E1E"
  inverse-on-surface: "#F4EFE4"
  inverse-primary: "#D1CFC0"
  primary-fixed: "#E3DECF"
  on-primary-fixed: "#1E1E1E"
  primary-fixed-dim: "#C9C4B6"
  on-primary-fixed-variant: "#2E2E2E"
  secondary-fixed: "#DBD7CD"
  on-secondary-fixed: "#1E1E1E"
  secondary-fixed-dim: "#C2BDB2"
  on-secondary-fixed-variant: "#5E5A52"
  tertiary-fixed: "#FFD2BE"
  on-tertiary-fixed: "#400E04"
  tertiary-fixed-dim: "#FBA587"
  on-tertiary-fixed-variant: "#7B2815"
  surface-dim: "#CFC8B8"
  surface-bright: "#F4EFE4"
  surface-container-lowest: "#F9F5EC"
  surface-container-low: "#F4EFE4"
  surface-container: "#E9E4D8"
  surface-container-high: "#E3DDCF"
  surface-container-highest: "#D8D2C4"
  success: "#CDEDA3"
  on-success: "#354E16"
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: 600
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: 600
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Geist
    fontSize: 17px
    fontWeight: 500
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 400
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 400
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: 500
    letterSpacing: 0.04em
  mono:
    fontFamily: Geist Mono
    fontSize: 13px
    fontWeight: 400
rounded:
  sm: 12px
  md: 20px
  lg: 28px
  xl: 36px
  full: 9999px
---

# Design System

## Overview
A warm, calm, tactile interface that pairs a "paper and ink" palette (creams, graphite and a single coral accent) with the **iOS Liquid Glass** language: translucent surfaces, background blur, subtle specular highlights and generously rounded shapes that appear to float above the content.

Hierarchy is built with **layers of glass over a warm background**, not with hard shadows or heavy borders. Content is always the protagonist; glass is the frame that wraps it and reacts to it.

Primary typeface: **Geist** (sans) and **Geist Mono** for data, code and tabular numbers.

## Colors

### Light (default)
- **Primary** (#2E2E2E): graphite. Main buttons, active icons, emphasized text.
- **On-primary** (#E6E4D7): text and icons on primary.
- **Primary-container** (#E3DDCF): background for selected items and active chips.
- **Secondary** (#5E5A52): secondary text, inactive icons, supporting actions.
- **Secondary-container** (#D8D2C4): tonal buttons, chips, segmented controls.
- **Tertiary** (#F26A4B): coral. **The only vivid accent.** Use it for a single highlighted action per screen, attention badges and focus states.
- **Tertiary-container** (#FFD2BE) / **On-tertiary-container** (#52170B): soft accent highlights.
- **Background / Surface** (#E9E4D8): warm base canvas.
- **On-surface** (#1E1E1E): primary text.
- **On-surface-variant** (#5E5A52): supporting text and placeholders.
- **Surface-variant** (#CFC8B8): input fills and heavier dividers.
- **Outline** (#A89F8F) / **Outline-variant** (#D2CBBB): borders and separators.
- **Error** (#DC2626), **Error-container** (#FFD9D3), **On-error-container** (#720309): validation and destructive actions.
- **Success** (#CDEDA3) / **On-success** (#354E16): confirmations.
- **Inverse-surface** (#1E1E1E), **Inverse-on-surface** (#F4EFE4), **Inverse-primary** (#D1CFC0): inverted snackbars and tooltips.

Surface scale (lightest to darkest):
`surface-container-lowest` #F9F5EC → `surface-container-low` / `surface-bright` #F4EFE4 → `surface-container` #E9E4D8 → `surface-container-high` #E3DDCF → `surface-container-highest` #D8D2C4 → `surface-dim` #CFC8B8.

Fixed colors (identical across themes): `primary-fixed` #E3DECF, `primary-fixed-dim` #C9C4B6, `secondary-fixed` #DBD7CD, `secondary-fixed-dim` #C2BDB2, `tertiary-fixed` #FFD2BE, `tertiary-fixed-dim` #FBA587, with their `on-*-fixed` variants #1E1E1E / #400E04 and `on-*-fixed-variant` variants #2E2E2E / #5E5A52 / #7B2815.

### Dark
- **Primary** (#D1CFC0), **On-primary** (#363636), **Primary-container** (#363636), **On-primary-container** (#D1CFC0)
- **Secondary** (#D9CFC2), **On-secondary** (#1C1C1C), **Secondary-container** (#2A2A2A), **On-secondary-container** (#D1CFC0)
- **Tertiary** (#F88C6A), **On-tertiary** (#39150D), **Tertiary-container** (#7B2815), **On-tertiary-container** (#FFD2BE)
- **Error** (#FF847D), **On-error** (#460105), **Error-container** (#861118), **On-error-container** (#FFD8D4)
- **Background / Surface** (#141414), **On-surface** (#E8E3DA)
- **Surface-variant** (#2A2A2A), **On-surface-variant** (#8E8A83)
- **Outline** (#5C5A56), **Outline-variant** (#2C2C2C)
- **Inverse-surface** (#E8E3DA), **Inverse-on-surface** (#141414), **Inverse-primary** (#2E2E2E)
- **Surface-dim** (#101010), **Surface-bright** (#2A2A2A)
- Containers: lowest #0B0B0B → low #171717 → container #1C1C1C → high #222222 → highest #2A2A2A
- **Success** (#354E16) / **On-success** (#CDEDA3)

## Liquid Glass

Glass is the elevation layer of the system. Use it for navigation bars, tab bars, modal sheets, floating cards, segmented controls and buttons placed over content.

### Base recipe (Light)
- **Fill:** `surface-bright` (#F4EFE4) at 45–60% opacity.
- **Background blur:** `backdrop-filter: blur(24px) saturate(180%)`.
- **Inner border (reflection):** 1px gradient from `rgba(255,255,255,0.65)` at the top to `rgba(255,255,255,0.10)` at the bottom.
- **Specular highlight:** 135° linear gradient from `rgba(255,255,255,0.35)` to transparent over the top 40%.
- **Shadow:** `0 8px 32px rgba(0,0,0,0.10)` plus `0 1px 0 rgba(255,255,255,0.5) inset`.

### Base recipe (Dark)
- **Fill:** `surface-container-high` (#222222) at 40–55% opacity.
- **Background blur:** `blur(28px) saturate(160%)`.
- **Inner border:** 1px gradient from `rgba(255,255,255,0.18)` to `rgba(255,255,255,0.04)`.
- **Specular highlight:** `rgba(255,255,255,0.08)` to transparent.
- **Shadow:** `0 10px 40px rgba(0,0,0,0.45)`.

### Glass levels
| Level | Use | Opacity | Blur |
|---|---|---|---|
| Thin | Chips, small controls | 35% | 16px |
| Regular | Cards, bars, buttons | 50% | 24px |
| Thick | Modal sheets, menus, dialogs | 70% | 40px |

### Tinting
- Glass picks up a faint tint from the content behind it thanks to `saturate`.
- Accent glass uses `tertiary` at 20–30% opacity. Reserve it for one element per view.
- If text on glass falls below 4.5:1 contrast, increase the glass opacity before darkening the text.

## Typography
- **Family:** Geist for the entire interface; Geist Mono for code, IDs, amounts and tabular numbers (`font-variant-numeric: tabular-nums`).
- **Display:** Geist 40px, semi-bold (600), tracking -0.02em.
- **Headline:** Geist 24px, semi-bold, tracking -0.01em.
- **Title:** Geist 17px, medium (500).
- **Body:** Geist 14–16px, regular (400), line height 1.5.
- **Labels:** Geist 12px, medium, tracking +0.04em; uppercase only for section headers.
- Maximum weight is 600. Avoid bold (700+) to preserve the light feel of the glass.

## Shape
- iOS-style continuous corners (superellipse); when unavailable, use generous radii.
- **Small controls / chips:** 12px. **Inputs and buttons:** 20px. **Cards:** 28px. **Modal sheets and large containers:** 36px. **Capsules, tab bars and switches:** fully rounded (9999px).
- Concentric radii: an inner element's radius = container radius − padding.

## Layout & Spacing
- 4px base grid; common spacing values: 8, 12, 16, 24, 32.
- Mobile screen margins: 16–20px. Respect safe areas.
- Navigation bars and tab bars **float** 12px away from the screen edges and let content show through underneath.
- Generous space between groups; glass needs breathing room for the blur to read well.

## Components
- **Primary button:** capsule, `primary` (#2E2E2E) fill, `on-primary` text, 52px height. Pressed: scale 0.97.
- **Accent button:** `tertiary` (#F26A4B) fill, white text. Only one accent action per screen.
- **Tonal / glass button:** Regular glass with `on-surface` text; ideal over images and content.
- **Inputs:** 20px radius, `surface-variant` fill at 50% over Thin glass, 1px `outline-variant` border; focus shows a 2px `tertiary` ring.
- **Cards:** Regular glass, 28px radius, 16–20px padding, no hard borders; separation comes from the inner reflection and soft shadow.
- **Tab bar / Navigation bar:** floating Regular glass capsule; the active item is highlighted with a `primary-container` pill.
- **Segmented controls and switches:** Thin glass capsule with a sliding `primary` indicator; the "on" switch state uses `tertiary`.
- **Modal sheets:** Thick glass, 36px top radius, centered 36×5px handle in `outline`, background dimmed with `scrim` at 30%.
- **Chips:** Thin glass, 12px radius; selected chips use `secondary-container`.
- **Snackbars / Toasts:** `inverse-surface` with `inverse-on-surface` text, floating capsule.
- **States:** success uses `success`/`on-success`; error uses `error-container`/`on-error-container`.

## Motion
- Spring animations: response ~0.35s, damping 0.8.
- Glass reacts to touch: slight brightness increase and scale 0.97 on press.
- Transitions morph between glass shapes (a button expanding into a modal sheet) instead of appearing abruptly.
- Respect `prefers-reduced-motion`: replace springs with 150ms fades.

## Iconography
- 1.5–2px stroke, rounded caps and joins, SF Symbols / Lucide style.
- Default color `on-surface-variant`; active `primary`; accent `tertiary`.

## Do's and Don'ts
- Do use glass only for the functional layer (navigation, controls, sheets); main content sits on solid surfaces or the base background.
- Do keep `tertiary` as the only vivid accent and use it sparingly.
- Do guarantee at least 4.5:1 contrast for text and 3:1 for icons and control borders.
- Do switch between light and dark themes using the matching tokens.
- Don't stack glass on glass more than two layers deep; legibility and performance suffer.
- Don't use hard black shadows, thick borders or saturated gradients.
- Don't mix rounded and sharp corners in the same view.
- Don't place small text directly over detailed images without Regular or Thick glass underneath.
- Don't use colors outside the palette; neutrals are always warm, never cool grays or bluish tones.