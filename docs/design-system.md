# Morrow design system

Morrow is a personal hub for solo developers. It has two spaces, Personal and
Work. Each space holds sections that the user creates and names. A section is a
kanban board, and its cards can be notes (Notion-style block editor), task
lists and more later. Personal also has a todo list.

The look is minimal and calm: warm neutrals carry nearly every screen, one blue
accent marks what matters, and motion is quick and only answers the person.

## Where things live

| File | What it holds |
| --- | --- |
| `design/index.css` | Entry point. Import once, globally. |
| `design/tokens/primitives.css` | Raw values: color ramps, type scale, spacing, radius, motion, z-index, breakpoints. |
| `design/tokens/semantic.css` | Role tokens (`--color-text`, `--color-accent`, `--shadow-md`...). Light and dark themes. |
| `design/tokens/breakpoints.css` | `@custom-media` names for when a CSS build step exists. Not imported yet. |
| `design/base.css` | Reset and element defaults wired to tokens. |
| `design/layout.css` | Layout tokens, primitives, containers, page shells and app views. |
| `design/preview/` | Foundations page and an interactive app prototype. Open `index.html` in a browser. Rebuild with `sh design/preview/build.sh`. |

## Rules

1. **Components use semantic tokens, never primitives.** Use `--color-accent`, not
   `--blue-600`. A theme only remaps semantic tokens.
2. **One accent.** Blue, hue 255. It marks the primary action, links, selection,
   focus and progress. Keep it under a few percent of any screen. No violet or
   lavender anywhere (hue 270 to 330).
3. **Text contrast.** Body text on its background is 7:1 or more. Muted text is
   4.5:1 or more and is for labels, dates and meta. `--color-text-subtle` is for
   placeholders and counts only.
4. **Nothing under 13px.** Labels are sentence case at 13px medium. No tracked
   capitals.
5. **One radius family.** 8px controls and kanban cards, 12px panels and board
   columns, 20px dialogs. Use the role aliases (`--radius-control`, `--radius-card`,
   `--radius-panel`, `--radius-dialog`).
6. **Spacing on a 4px grid.** `--space-N` is N x 4px. Lay out siblings with `gap`
   from a layout primitive, not margins.
7. **Motion is quiet and answers the person.** Hover in 140ms, out 200ms, press
   90ms, all on `--ease-standard`. A card lifts 2px on hover; a button steps up
   1px and presses down 1px at 0.985 scale. Things that travel (a switch
   indicator, a dropped card) use `--ease-travel` over 240ms. No bounce, no
   scroll-triggered motion, no entrance animations. Reduced motion turns all of
   it off.
8. **Elevation is for floating things.** Cards at rest get `--shadow-xs`; only
   hover, drag, popovers and dialogs go higher. In dark mode, lighter surfaces
   carry elevation instead.

## Layout

Three levels, smallest first:

- **Primitives** (`.stack`, `.cluster`, `.spread`, `.grid-auto`, `.grid-12`,
  `.sidebar-layout`, `.switcher`, `.center`, `.cover`, `.frame`, `.prose`) each do
  one arrangement job and mostly respond to their own width. Tune with custom
  properties: `style="--gap: var(--space-6)"`, `--min`, `--threshold`.
- **Containers** (`.container` with `--xs` to `--2xl`, `.section`, `.breakout`,
  `.cq`) set max width, the fluid page gutter and vertical rhythm.
- **Page shells** frame whole pages:
  - `.shell-app`: every signed-in screen. Sidebar with the space switcher and
    the space's sections; docked from 1024px, a drawer below.
  - `.shell-focus`: one task, no navigation (sign in, onboarding).
  - `.shell-site`: a future public landing page.
- **App views** fill `.shell-app__main`:
  - `.board`: a section's kanban. Any number of columns, which scroll sideways
    inside the board; each column scrolls its own cards. Columns snap one at a
    time on phones.
  - `.with-inspector`: a selected card opens beside the board from 1280px, as a
    sheet over it below that.
  - `.editor`: a note page. A 720px text column with a left gutter for block
    drag handles; `.editor__block--wide` and `--full` break out for tables and
    embeds.
  - `.list-view`: todos and any task list opened full page.

### Breakpoints

Mobile first, min-width only. Prefer intrinsic layouts and container queries.

| Name | Min width | What changes |
| --- | --- | --- |
| sm | 640px | Board columns stop snapping full width. |
| md | 768px | `.grid-12` spans apply. |
| lg | 1024px | Sidebar docks. |
| xl | 1280px | Card inspector docks beside the board. |
| 2xl | 1536px | Room for `--container-2xl`. |

## When the stack is chosen

The tokens are plain CSS custom properties so they work with any stack. The
likely stack is TanStack Start. With Tailwind v4, map the semantic tokens in an
`@theme` block (for example `--color-accent: var(--color-accent)`) so utilities
read from this system. Build components (button, card, checkbox, switch,
menu) against the semantic tokens; the prototype's `app.css` shows the
intended look and motion for each.

## Origins

The rules on color, contrast, type size, radius and motion follow the
system and motion references of the taste skill
(<https://www.tasteskill.dev/docs>), adapted from marketing pages to an app.
