# 4. Day and Dusk: a top-bar layout with a sage accent

Date: 2026-11-05

## Status

Accepted. Supersedes the layout, accent, type and radius choices of the first
design system (PR #11) where they conflict.

## Context

The first design system framed every signed-in screen with a sidebar (space
switcher plus the space's sections) and used a calm blue accent on warm gray,
system fonts, and an 8/12/20 radius family. Chris then worked out a different
concept for the home screen, "Morrow Dashboard", in two themes: Day (personal)
and Dusk (work). It puts the Personal / Work switch in a top bar, opens each
space on a hero image with a greeting beside a Today panel, and shows the
space's board below.

## Decision

- **Shell.** `.shell-app` is a sticky top bar (brand, a centered Personal /
  Work switch, actions) over one centered column up to 1360px. No sidebar.
  The space is a search param (`?space=work`; Personal is the default).
- **Home.** A space's home is `.today` (hero + Today panel, 340px tall,
  wrapping to a stack) then a `.page-block` holding the `.board`.
- **Color.** Day: warm sand paper (`--sand-*`) with green-gray ink
  (`--gray-*`). Dusk: green-gray surfaces. One muted sage accent (`--sage-*`,
  hue ~155) replaces blue, and info uses it too. Exact concept colours are
  kept; the only change is `--accent-foreground` on `--accent`, darkened to
  sage-700 because the concept's pairing measured 4.3:1.
- **Type.** Geist for UI at 14px, Geist Serif (`--font-display`, regular
  weight only) for the brand, greeting and page and section titles. Both are
  self-hosted (Geist through `@fontsource-variable`, Geist Serif vendored
  under `src/assets/fonts/`), so the app makes no font requests.
- **Radius.** 6 / 10 / 12 / 16 / 20, rounder as things get bigger.
- **Cards at rest** are flat with a 1px border; shadows are for things that
  float.

Kept from the first system, though the concept differs: nothing under 13px
and no tracked capitals (the concept's 11px uppercase card-type chips and 12px
meta become 13px sentence case), the 4px spacing grid (with 2px half steps),
motion, and the violet ban.

## Consequences

- With no sidebar, a space's several sections need a home. The concept shows
  one board per space; a section picker in the board's header is the likely
  next step, decided when sections are built.
- Search and inbox buttons from the concept wait for those features.
- The concept's Today todo list waits for todos; until then the Today panel
  holds the Scratchpad.
