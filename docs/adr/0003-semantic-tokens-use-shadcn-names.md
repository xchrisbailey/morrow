# 3. Semantic tokens use shadcn's names

Date: 2026-11-05

## Status

Accepted. Amends ADR-0001.

## Context

ADR-0001 made tokens plain CSS custom properties, with the semantic layer named
in morrow's own words (`--color-accent`, `--color-border`, ...), and expected
Tailwind v4 to map them through `@theme`. Morrow has since adopted Tailwind v4
and shadcn (Base UI), and the note editor (BlockNote's shadcn view, ADR-0002)
also reads shadcn's variables.

The editor prototype bridged morrow's names to shadcn's in about 20 aliases. It
worked, but two names collided in Tailwind's namespace:

- **Accent:** morrow's `--color-accent` is the brand blue. shadcn's `accent` is
  a pale hover wash, so `bg-accent` and `var(--color-accent)` meant different
  things.
- **Radius:** morrow's primitives `--radius-sm/md/lg` (8/12/20px) collided with
  shadcn's radius scale, which is derived from one `--radius` and used in its
  components as `rounded-md`, `rounded-lg` and so on.

## Decision

- **Names.** Where a role overlaps with shadcn's, the semantic layer uses
  shadcn's name directly: `--background`, `--foreground`, `--card`,
  `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`,
  `--destructive`, `--border`, `--input`, `--ring`, and their `-foreground`
  pairs.
  - Morrow's accent (sage since ADR-0004, blue before) is **primary**.
  - **accent** means the hover/selected wash.
  - Roles shadcn lacks keep morrow names: sunken surface, subtle text, links,
    status colours, selection and shadows.
  - There is no bridge file. Tailwind's `@theme inline` maps these variables
    to classes.
- **Radius.** shadcn's radius scale derives from `--radius` (10px since
  ADR-0004). Morrow's radius primitives are named by pixel value out of the
  clash (`--radius-6/10/12/16/20` since ADR-0004). The role aliases are exposed
  as `rounded-check`, `rounded-control`, `rounded-card`, `rounded-column`,
  `rounded-panel` and `rounded-dialog`, and app code uses those.
- **Motion.** `tw-animate-css` stays. One motion stylesheet overrides it to
  rule 7: no zoom, a 6px drop, `--duration-panel` on `--ease-standard`.
  Generated components' hover and press transitions are retuned to
  140/200/90ms. Reduced motion turns all of it off.
- **Dark mode.** Tailwind's `dark:` variant matches morrow's mechanism:
  `prefers-color-scheme`, overridden either way by `data-theme` on `<html>`.
- **Imports.** `design/` stays the token source at the repo root. The app
  imports `design/index.css` once, inside `layer(base)`, so morrow's reset
  cannot beat Tailwind's classes.
- **Components.** shadcn components are restyled by editing the copied files,
  not by wrapping them.
- **Preview.** `design/preview/app.html` is deleted when real screens exist.
  The foundations page stays until an in-app design route replaces it.

Unchanged from ADR-0001: primitives hold raw values, components use semantic
tokens only, and themes remap the semantic layer only.

## Consequences

- shadcn, BlockNote and Plate-style components work without translation, and
  shadcn's docs read directly onto morrow.
- `design/tokens/semantic.css`, `design/tokens/primitives.css` (radius names),
  `docs/design-system.md` and the preview pages must be rewritten to the new
  names during the scaffold.
- Morrow's vocabulary now partly follows a third-party convention. If shadcn
  renames its variables, the semantic layer follows.
