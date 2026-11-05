# 2. BlockNote as the note editor

Date: 2026-11-05

## Status

Accepted

## Context

Note cards need a Notion-style block editor with a slash menu, drag handles to
reorder blocks, markdown shortcuts, and headings, lists, to-dos, quotes, code
and dividers. Content is stored as JSON. The UI stack is shadcn on Base UI
with Tailwind v4, themed from morrow's tokens (ADR-0001).

Research narrowed the field to BlockNote (`@blocknote/shadcn`) and Plate
(`platejs` with Plate UI). Tiptap needs a paid template or hand-built menus,
Lexical lacks the block UX, and Yoopta is poorly maintained. A hands-on
prototype of both measured (gzip, production build, lazy chunk):

- **BlockNote:** about 315 kB. Every must-have is built in. It took about 26
  lines of token-bridge CSS and met the design rules.
- **Plate:** about 759 kB, because the stock registry slash menu pulls in AI,
  Excalidraw, math and tables. It needs only 2 extra CSS lines, but its menus
  use zoom-in entrance animations (rule 7), it shows an AI group, its toolbar
  still imports Radix, and it needed missing dependencies installed by hand.

The Owner preferred Plate's feel and look.

## Decision

Use BlockNote with its shadcn/Base UI view (`@blocknote/react`,
`@blocknote/shadcn`), pinned to an exact version.

- The editor renders client-only and loads lazily when a note is opened.
- A note's stored content is BlockNote's JSON block array
  (`{id, type, props, content, children}`). Markdown is an export, not the
  source of truth.
- BlockNote and shadcn variables are mapped onto morrow's semantic tokens in
  one bridge stylesheet. Components never use primitives.
- The GPL/commercial `@blocknote/xl-*` packages are not used.

## Consequences

- The database stores BlockNote's document format, so switching editors later
  means a content migration.
- Markdown export is lossy. If faithful Markdown becomes a requirement, revisit
  this decision.
- No interactive server render. Read-only views either render the editor
  client-side or convert blocks to HTML on the server.
- The look comes from BlockNote's components restyled through variables and a
  little CSS, not from code we own as with Plate. If closing the gap to the
  feel the Owner liked in Plate takes heavy overrides, reconsider Plate with a
  trimmed slash menu and retuned motion.
- BlockNote is pre-1.0 and MPL-2.0, so pin it and upgrade deliberately.
- Prototype: branch `prototype/block-editor`.
