# Morrow design system

Morrow is a personal hub for solo developers. It has two spaces, Personal and
Work. Each space holds sections that the user creates and names. A section is a
kanban board, and its cards can be notes (Notion-style block editor), task
lists and more later. Personal also has a todo list.

The look is minimal and calm, in two themes: **Day** (light) and **Dusk**
(dark). Warm sand paper and green-gray ink carry nearly every screen, one muted
sage accent marks what matters, a serif voice titles pages, and motion is quick
and only answers the person. The current layout comes from the "Morrow
Dashboard" concept (ADR-0004).

## Where things live

| File                            | What it holds                                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `design/index.css`              | Entry point. Import once, globally.                                                                                                                                             |
| `design/tokens/primitives.css`  | Raw values: color ramps (sand, gray, sage, status, scene), type scale, spacing, radius, motion, z-index, breakpoints.                                                           |
| `design/tokens/semantic.css`    | Role tokens, named as shadcn names them (`--foreground`, `--primary`, `--border`...) plus morrow's own (`--text-subtle`, `--success`, `--shadow-md`...). Light and dark themes. |
| `design/tokens/breakpoints.css` | `@custom-media` names for when a CSS build step exists. Not imported yet.                                                                                                       |
| `design/base.css`               | Reset and element defaults wired to tokens.                                                                                                                                     |
| `design/layout.css`             | Layout tokens, primitives, containers, page shells and app views.                                                                                                               |
| `design/preview/`               | Foundations page. Open `index.html` in a browser. Rebuild with `sh design/preview/build.sh`.                                                                                    |
| `src/styles/app.css`            | The app's style entry: Tailwind, the self-hosted fonts, `design/index.css` in `layer(base)`, and the `@theme inline` map from tokens to classes.                                |
| `src/styles/motion.css`         | Retunes `tw-animate-css` and shadcn's transitions to rule 7.                                                                                                                    |

## Rules

1. **Components use semantic tokens, never primitives.** Use `--primary`, not
   `--sage-600`. A theme only remaps semantic tokens.
2. **One accent.** Sage, hue about 155 and chroma under 0.05, named `--primary`
   (shadcn's `--accent` is only the hover and selected wash, also the avatar
   and soft buttons). It marks the primary action, links, selection, focus and
   progress. Keep it under a few percent of any screen. Success stays a
   brighter green so the two never read alike. No violet or lavender anywhere
   (hue 270 to 330).
3. **Text contrast.** Body text on its background is 7:1 or more. Muted text is
   4.5:1 or more and is for labels, dates and meta. `--text-subtle` is for
   placeholders and counts only.
4. **Two voices, nothing under 13px.** Geist for everything you operate, at
   14px in app UI and 16px for long-form text. Newsreader (`--font-display`,
   `font-display`) at medium weight for the brand, the greeting, and page and
   section titles (`h1`, `h2`); card and dialog titles stay in Geist. Labels are
   sentence case at 13px medium. No tracked capitals.
5. **One radius family, rounder as things get bigger.** 6px checkboxes, 10px
   controls and list rows, 12px kanban cards and popovers, 16px board columns,
   20px page panels (hero, Today) and dialogs. The primitives are
   `--radius-6/10/12/16/20`. Use the role aliases (`--radius-check`,
   `--radius-control`, `--radius-card`, `--radius-column`, `--radius-panel`,
   `--radius-dialog`), which Tailwind exposes as `rounded-check`,
   `rounded-control` and so on. shadcn's own `rounded-md`, `rounded-lg` derive
   from `--radius: 10px`.
6. **Spacing on a 4px grid.** `--space-N` is N x 4px; the half steps
   (`--space-2-5`, `-3-5`, `-4-5`: 10, 14, 18px) are for control and card
   interiors. Lay out siblings with `gap` from a layout primitive, not margins.
7. **Motion is quiet and answers the person.** Hover in 140ms, out 200ms, press
   90ms, all on `--ease-standard`. A card lifts 2px on hover; a button steps up
   1px and presses down 1px at 0.985 scale. Things that travel (a switch
   indicator, a dropped card) use `--ease-travel` over 240ms. No bounce, no
   scroll-triggered motion, no entrance animations. Reduced motion turns all of
   it off.
8. **Elevation is for floating things.** Cards and panels at rest are flat with
   a 1px `--border`; the selected Space switch segment gets `--shadow-xs`; only
   hover, drag, popovers and dialogs go higher. In Dusk, lighter surfaces carry
   elevation instead.

## Layout

Three levels, smallest first:

- **Primitives** (`.stack`, `.cluster`, `.spread`, `.grid-auto`, `.grid-12`,
  `.sidebar-layout`, `.switcher`, `.center`, `.cover`, `.frame`, `.prose`) each do
  one arrangement job and mostly respond to their own width. Tune with custom
  properties: `style="--gap: var(--space-6)"`, `--min`, `--threshold`.
- **Containers** (`.container` with `--xs` to `--2xl`, `.section`, `.breakout`,
  `.cq`) set max width, the fluid page gutter and vertical rhythm.
- **Page shells** frame whole pages:
  - `.shell-app`: every signed-in screen. A sticky 56px top bar
    (`__brand`, `__switch` holding the `.space-switch`, `__actions`) over
    `__main`, one centered column up to 1360px (`--container-app`) with 24px
    sides and 36px (`--page-block-gap`) between blocks. Below 768px the switch
    drops to its own row. The current Space is the `space` search param.
  - `.shell-focus`: one task, no navigation (sign in, onboarding).
  - `.shell-site`: a future public landing page.
- **App views** fill `.shell-app__main`:
  - `.today`: the top of a Space's home. `__hero` (a figure: the `.scene`
    landscape, drawn from the `--scene-*` tokens, and the `__caption` glass
    card with the greeting and date) beside `__panel` (Today: todos later, the
    Scratchpad now). Both are 340px tall; the row wraps to a stack when the
    hero would drop below 560px, and below 640px the hero is 220px and the
    panel grows with its content.
  - `.page-block`: a titled block of a page (`__header`, `__title` in the
    display face, actions at the end).
  - `.board`: a Space's kanban. Any number of 300px `__column`s (16px apart,
    `--background-subtle`, `rounded-column`) scroll sideways inside the board;
    columns grow with their cards and the page scrolls. `__card` is
    `--card` with a border, `rounded-card`, 14px padding; `__count` is the pill
    beside a column title; `__new-column` is the dashed slot at the end.
    Columns snap one at a time on phones.
  - `.with-inspector`: a selected card opens beside the board from 1280px, as a
    sheet over it below that.
  - `.editor`: a note page. A 720px text column with a left gutter for block
    drag handles; `.editor__block--wide` and `--full` break out for tables and
    embeds.
  - `.list-view`: todos and any task list opened full page.

### Breakpoints

Mobile first, min-width only. Prefer intrinsic layouts and container queries:
the hero and Today panel sit side by side from about 950px because `.today`
wraps on its own width, not on a breakpoint.

| Name | Min width | What changes                                                  |
| ---- | --------- | ------------------------------------------------------------- |
| sm   | 640px     | Board columns stop snapping; Today row is 340px tall.         |
| md   | 768px     | `.grid-12` spans apply; Space switch joins the top bar's row. |
| xl   | 1280px    | Card inspector docks beside the board.                        |
| 2xl  | 1536px    | Room for `--container-2xl`.                                   |

## Token names (ADR-0003)

The semantic layer uses shadcn's names where a role overlaps, so shadcn and
BlockNote components read it without a bridge file. `@theme inline` in
`src/styles/app.css` maps each variable to Tailwind classes (`bg-background`,
`text-muted-foreground`, `border-input`, ...).

| Role                     | Token                                                                                                                                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page, columns and tracks | `--background`, `--background-subtle`                                                                                                                                                                                               |
| Cards, panels            | `--card` / `--card-foreground`                                                                                                                                                                                                      |
| Popovers, dialogs        | `--popover` / `--popover-foreground`                                                                                                                                                                                                |
| Wells, code blocks       | `--muted` / `--muted-foreground`                                                                                                                                                                                                    |
| Primary action (sage)    | `--primary` / `--primary-foreground`, `--primary-hover`, `--primary-active`                                                                                                                                                         |
| Hover and selected wash  | `--accent` / `--accent-foreground`, `--accent-hover`                                                                                                                                                                                |
| Neutral controls         | `--secondary` / `--secondary-foreground`, `--secondary-hover`, `--secondary-active`                                                                                                                                                 |
| Danger                   | `--destructive` / `--destructive-foreground`, `--destructive-bg/-border/-text`                                                                                                                                                      |
| Borders                  | `--border`, `--input` (field and strong border), `--border-subtle`                                                                                                                                                                  |
| Focus                    | `--ring`                                                                                                                                                                                                                            |
| Morrow only              | `--text-subtle`, `--text-inverse`, `--surface-inverse`, `--overlay`, `--link`, `--link-hover`, `--selection`, `--success`, `--warning`, `--info` (each with `-bg`, `-border`, `-text`), `--shadow-*`, `--scene-*`, `--font-display` |

Dark mode (Dusk): Tailwind's `dark:` variant follows `prefers-color-scheme` and is
overridden either way by `data-theme="light|dark"` on `<html>`. BlockNote's
`--bn-colors-*` variables are mapped onto the same tokens in `src/styles/app.css`.

Build components against the semantic tokens. shadcn components are copied into
`src/components/ui/` and edited in place when they break a rule here.

## Origins

The rules on color, contrast, type size, radius and motion follow the
system and motion references of the taste skill
(<https://www.tasteskill.dev/docs>), adapted from marketing pages to an app.
