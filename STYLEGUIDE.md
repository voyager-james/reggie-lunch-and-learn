# Reggie / ActionCOACH Landing Page Style Guide

This funnel follows the visual system used on [ActionCOACH.com](https://www.actioncoach.com/) while keeping Reggie Shropshire's landing-page content and conversion flow intact.

## Design direction

The look is direct, energetic, and highly legible: bright ActionCOACH yellow against charcoal and white, strong Poppins typography, square geometry, angular chevrons, large photographic panels, and minimal decorative effects.

## Core tokens

| Token | Value | Use |
| --- | --- | --- |
| Action yellow | `#FFEB00` | Primary sections, highlights, calls to action |
| Charcoal | `#1E1E1E` | Headlines, dark sections, primary contrast |
| Near black | `#202020` | Supporting dark surfaces |
| White | `#FFFFFF` | Navigation, light sections, reversed text |
| Light grey | `#D9D9D9` | Dividers and supporting bands |

The implementation tokens live in `src/styles/actioncoach.css`.

## Typography

- Family: Poppins throughout.
- H1: 700 weight, 60/72px on wide screens, sentence case.
- H2: 600 weight, 40/52px on wide screens, sentence case.
- Body: 400 weight, 16/24px minimum.
- Buttons and labels: 600 weight, sentence case.
- Avoid all-caps display headings, condensed fonts, and exaggerated letter spacing.

## Layout

- Maximum content width: 1180px.
- Desktop sections use generous 80–96px vertical spacing.
- Standard landing-page sections use the same vertical padding token; do not vary section height arbitrarily.
- The hero is one flat yellow field with a clean two-column copy-and-video layout; do not use clips, angles, or overlap.
- The hero video uses the same responsive right gutter that the headline uses on the left, keeping the composition balanced.
- Content sections alternate white, yellow, and charcoal to create a clear reading rhythm.
- On mobile, all split layouts collapse to one column and angular clipping is removed.

## Components

### Navigation

- Slim charcoal announcement bar above a white main navigation.
- Logo on the left and one yellow conversion button on the right.
- No translucent, blurred, or rounded navigation surfaces.

### Buttons

- Square corners and no gradient.
- Yellow button on light or white navigation surfaces.
- Charcoal button on yellow surfaces.
- Use a double-chevron cue after the label.
- Hover is a simple color inversion or short horizontal movement; avoid floating shadows.

### Cards and accordions

- Square corners.
- Use borders and color blocking instead of soft shadows.
- Yellow is used as an edge, number block, or header—not as a glow.
- FAQ rows are compact, centered within a narrower content column, and use a yellow header treatment.

### Lists

- Never use small decorative dots.
- Use unboxed Lucide check icons for positive, useful, or included items.
- Use unboxed Lucide X icons for exclusions, problems, or negative-fit items.
- Icon colors stay within the yellow, charcoal, and white ActionCOACH palette; do not introduce red.
- Lists remain left-aligned even when the surrounding section heading is centered.

### Video

- Video is always presented as a self-contained 16:9 frame.
- Never crop an active video or force it to fill a taller decorative container.

### Photography

- Images are large, tightly cropped, and integrated into the layout.
- Avoid rounded image masks and stock-style floating cards.
- Use yellow geometric overlays only when they reinforce the ActionCOACH identity.

## Do not use

- Rounded “app UI” cards or pill buttons.
- Purple/blue gradients, glassmorphism, or blurred panels.
- Condensed uppercase display type.
- Oversized drop shadows or decorative effects that weaken the flat, editorial brand style.

## Accessibility and responsive behavior

- Maintain WCAG-readable contrast between yellow, charcoal, and white.
- Interactive controls keep a minimum 44px target height.
- Keyboard focus uses a visible 3px outline.
- Mobile type scales down without dropping below 16px body text.
- Respect `prefers-reduced-motion`.
