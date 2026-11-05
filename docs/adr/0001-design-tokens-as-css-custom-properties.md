# 1. Design tokens as plain CSS custom properties

Date: 2026-11-05

## Status

Accepted. Amended by ADR-0003 (semantic names follow shadcn; radius primitives renamed).

## Context

Morrow needs a design system before any feature work, but the stack is not
chosen yet (TanStack Start is likely; Tailwind is undecided). Tokens written
for one tool (a Tailwind config, a CSS-in-JS theme, a JSON pipeline) would
have to be rewritten if that choice changes.

## Decision

Tokens are plain CSS custom properties in two layers:

- **Primitives** hold raw values (color ramps in OKLCH, scales).
- **Semantic tokens** name roles and are the only layer components use.
  Themes (light, dark) remap semantic tokens only.

Dark mode follows `prefers-color-scheme`, and `data-theme="light|dark"` on
`<html>` overrides it either way.

Layout is plain CSS classes (primitives, containers, page shells, app views)
tuned with custom properties instead of modifier classes.

There is no build step. Breakpoint names exist as `@custom-media` in a file
that is not imported until a build step (Lightning CSS or PostCSS) exists.

## Consequences

- Works unchanged with any framework, and Tailwind v4 can map the tokens in
  `@theme`.
- No type safety or token linting yet. If Morrow ever needs native apps or
  design-tool sync, move the source of truth to DTCG JSON and generate this
  CSS from it.
- Media queries repeat literal rem values until `@custom-media` is wired up.
