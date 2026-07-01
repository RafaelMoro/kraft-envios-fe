---
description: Design or redesign frontend UI using DESIGN.md, Flowbite/Tailwind, and the frontend-design skill.
---

# /frontend-design - UI Design Workflow

Use the `frontend-design` skill.

Input: `$ARGUMENTS`

## Required Context

Read first:

1. `DESIGN.md`
2. `AGENTS.md` styling section
3. The component/page files the user wants changed
4. Nearby UI components that already establish spacing, typography, iconography, buttons, cards, and responsive behavior

## Hard Constraints

- Preserve the app's current font family. Do not change font family unless the user explicitly asks.
- Do not use `font-mono` for IDs, guide numbers, prices, or metadata unless the user explicitly asks.
- Keep Flowbite React + Tailwind v4 patterns.
- Prefer existing Remix line icons and shared button classes.
- Keep dark-mode classes when adding text, border, or background colors.
- Do not add dependencies for visual polish.

## Workflow

1. Identify the existing visual language around the target UI.
2. Choose one intentional design improvement that fits the app, not a generic redesign.
3. Implement the smallest useful diff.
4. Update focused tests only for behavior/copy changes, not CSS classes.
5. Run focused tests and `pnpm lint`.

If the requested change would require a new visual direction or a font-family change, ask one concise question before implementing.
