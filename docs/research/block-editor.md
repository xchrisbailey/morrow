# Which block editor fits morrow?

Research for issue #13 (map #12). Researched 2026-11-05 against npm, GitHub and each project's docs.

## Verdict

1. **BlockNote with `@blocknote/shadcn`.** Every must-have ships built in, the shadcn variant already uses Base UI, and it stores a plain JSON block array. Costs: client-only rendering, a large bundle, lossy Markdown, and the `xl-*` add-ons are GPL or paid.
2. **Plate (Plate UI, Base UI base).** Most flexible, MIT, fully copy-paste and Tailwind-native, with a Base UI registry base. Costs: you assemble the editor from kits and plugins, and it ships the most surface area to maintain.

Tiptap and Lexical are credible but you build the block UX yourself (Tiptap) or nearly all of it (Lexical). Yoopta is the weakest on health. Prototype BlockNote first, Plate second.

## Versions and health (npm / GitHub, 2026-11-05)

| Editor | Latest | Published | License | Last push | Stars |
| --- | --- | --- | --- | --- | --- |
| BlockNote (`@blocknote/*`) | 0.57.0 | 2026-10-30 | MPL-2.0; `xl-*` packages GPL-3.0 or commercial | 2026-11-05 | ~10.4k |
| Plate (`platejs`) | 53.5.2 | 2026-10-30 | MIT | 2026-11-05 | ~16.7k |
| Tiptap (`@tiptap/*`) | 3.32.2 | 2026-10-30 | MIT core; Notion-like template needs a paid plan | 2026-11-05 | ~39k |
| Lexical (`lexical`) | 0.53.0 | 2026-10-28 | MIT | 2026-11-05 | ~24k |
| Yoopta (`@yoopta/editor`) | 6.0.5 | 2026-05-11 | MIT | 2026-05-11 | ~3.1k |

Release cadence: BlockNote ships roughly every 1 to 3 weeks (0.54.2 on 09-09 through 0.57.0 on 10-30). Plate ships several times a week. Tiptap ships every 2 to 4 weeks. Lexical ships monthly. Yoopta has had no release or push in about six months, so it is treated as a maintenance risk. All of BlockNote, Plate, Lexical and Tiptap are pre-1.0 or fast-moving on majors, so pin versions.

Bundle size (bundlephobia, minified+gzip, whole-package and not tree-shaken, so an upper bound): `@blocknote/shadcn` ~324 kB (includes core ~190 kB and react ~260 kB figures overlapping), `platejs` ~104 kB (plus plugins and copied UI), `@tiptap/starter-kit` ~108 kB, `lexical` ~69 kB (plus `@lexical/*`). Treat as order of magnitude; measure in the prototype with the real build.

Sources: https://registry.npmjs.org/ (per package), https://github.com/TypeCellOS/BlockNote, https://github.com/udecode/plate, https://github.com/ueberdosis/tiptap, https://github.com/facebook/lexical, https://bundlephobia.com.

## Must-haves matrix

| Need | BlockNote | Plate | Tiptap | Lexical |
| --- | --- | --- | --- | --- |
| Slash menu | Built in (suggestion menu) | `slash-node` registry component | Build on `@tiptap/suggestion`; paid template has one | Playground `ComponentPickerPlugin` (copy it) |
| Drag handles | Built in side menu | `block-draggable` (uses `@platejs/dnd`, react-dnd) | `@tiptap/extension-drag-handle(-react)`, MIT | Playground `DraggableBlockPlugin` (copy it) |
| Markdown shortcuts | Built in | Autoformat plugin | Input rules in StarterKit | `MarkdownShortcutsExtension` |
| Headings, lists, to-dos, quote, code, divider | All built in (`packages/core/src/blocks`: Code, Divider, Heading, ListItem, Quote, Image, ...) | Basic nodes, list, code-block kits | StarterKit plus task-list extension | Rich-text, list, code packages; to-do via check list; divider via horizontal-rule node |
| JSON storage | Block array: `{id, type, props, content, children}` | Slate JSON value | ProseMirror JSON | Serialized editor-state JSON |

Sources: BlockNote docs https://github.com/TypeCellOS/BlockNote/tree/main/docs/content/docs (document-structure, features/blocks); Plate registry https://platejs.org/r/block-draggable.json and https://platejs.org/r/slash-node.json; Tiptap https://tiptap.dev/docs/ui-components/templates/notion-like-editor; Lexical playground https://github.com/facebook/lexical/tree/main/packages/lexical-playground/src/plugins.

## React 19 and SSR in TanStack Start

All four declare React 19 support or an open range: BlockNote react peer `^18 || ^19`; Plate `>=18`; Tiptap react `^17 || ^18 || ^19`; Lexical react `>=18`.

- **BlockNote**: docs say it "should only be rendered client-side (and not on the server)". Use a client component and a client-only wrapper (in TanStack Start, `ClientOnly` or a lazy import behind a mounted check). No server render of the editor; stored JSON is fine to read on the server. There is a separate server-processing path for converting blocks to HTML or Markdown without a browser (docs `features/server-processing.mdx`).
- **Plate**: SSR-capable. Docs warn a `'use client'` component still renders on the server first, so seed from `initialValue` and restore saved state after mount. Static rendering (`PlateStatic`, `platejs/static`) renders content to HTML on the server with no editor, which suits read-only note views.
- **Tiptap**: docs say use `immediatelyRender: false` to avoid SSR hydration mismatch; the editor mounts client-side. Server-side JSON to HTML is possible with the HTML helpers.
- **Lexical**: runs in a React tree but is a contenteditable that initialises client-side. `@lexical/headless` exists for server-side state work.

Net: none gives an interactive editor on the server. Plan for a client-only editor island in every case. Plate has the best story for server-rendered read-only output.

Sources: https://github.com/TypeCellOS/BlockNote/blob/main/docs/content/docs/getting-started/nextjs.mdx; https://platejs.org/docs/installation/next; https://platejs.org/docs/static; https://tiptap.dev/docs/editor/getting-started/install/react; https://lexical.dev/docs/intro.

## Styling and UI dependencies

- **BlockNote shadcn**: `@blocknote/shadcn` 0.57.0 depends on `@base-ui/react ^1.6.0`, `lucide-react`, `class-variance-authority`, `tailwind-merge`, and has peer `tailwindcss ^4.1.12`. So it does not use Radix or Mantine, which matches the shadcn Base UI variant. (The package docs page still says "based on Radix"; the published dependency list is the authority.) Setup: import `BlockNoteView` from `@blocknote/shadcn` plus `@blocknote/shadcn/style.css`, and add `@source` for the package in the Tailwind v4 entry CSS. It expects shadcn CSS variables (`--background`, `--foreground`, `--popover`, `--border`, `--ring`, `--radius`, ...). The editor itself also has `--bn-colors-*` variables (for example `--bn-colors-editor-text`, `--bn-colors-editor-background`, `--bn-colors-menu-background`). Both sets can be mapped onto morrow semantic tokens in one small CSS layer (ADR-0001: components use semantic tokens, themes remap them). Mantine variant (`@blocknote/mantine`) needs `@mantine/core` and should be avoided.
- **Plate UI**: copy-paste components installed with the shadcn CLI (`@plate/plate-ui`), so styling is entirely your own Tailwind classes and tokens. The Plate repo has `registry/bases/base` and `registry/bases/radix` trees, so a Base UI base exists alongside Radix; confirm in the prototype that the CLI picks the Base UI base for the project. Drag-and-drop uses react-dnd (a peer of `@platejs/dnd`), an extra dependency.
- **Tiptap**: headless; no UI dependency, you write every menu with Base UI and Tailwind. Tiptap's own UI components and templates are shadcn-like and copy-in. Fits tokens perfectly but costs the most UI work.
- **Lexical**: headless; same trade-off. Playground plugins are reference code to copy, not a supported UI kit.

Sources: https://registry.npmjs.org/@blocknote/shadcn/latest; https://github.com/TypeCellOS/BlockNote/blob/main/docs/content/docs/getting-started/shadcn.mdx and `react/styling-theming/themes.mdx`; https://platejs.org/docs/installation/plate-ui; https://github.com/udecode/plate (apps/www/src/registry/bases).

## Nice to have

- **Markdown import and export**: BlockNote has `blocksToMarkdownLossy` / `tryParseMarkdownToBlocks`; docs call it a minimal, lossy subset. Plate has `@platejs/markdown` (remark based, MIT, two-way, supports MDX and custom nodes). Tiptap has `@tiptap/markdown` (MIT, marked based). Lexical has `@lexical/markdown` (MIT) and `@lexical/mdast`. Plate is the most capable; BlockNote is adequate if JSON stays the source of truth.
- **Image block path**: BlockNote has Image (plus Video, Audio, File) blocks built in and takes an `uploadFile` callback, so a later self-hosted upload endpoint plugs in directly. Plate has `@platejs/media`. Tiptap has an image extension (the upload node is in the template or UI components). Lexical needs a custom ImageNode (the playground has one).

## Licensing watch-outs

- BlockNote core, react, shadcn, mantine: MPL-2.0 (file-level copyleft; fine in a closed app unless you modify BlockNote files). The `xl-*` packages (AI, multi-column, PDF/DOCX/ODT export) are `GPL-3.0 OR PROPRIETARY`. Avoid them unless the license terms suit; morrow does not need them for the must-haves.
- Tiptap core is MIT, but the Notion-like template requires a paid Start plan in production; do not depend on it.
- Plate, Lexical, Yoopta: MIT. Plate also sells optional Plus templates; the core and the registry components above are free.

## Yoopta

MIT, 6.0.5, built on Slate. Last release and push 2026-05-11, small community (~3k stars). Rejected on maintenance risk relative to the others.

## Deciding trade-offs

| | BlockNote shadcn | Plate |
| --- | --- | --- |
| Time to a working Notion-like note | Hours; slash, handles, shortcuts, blocks included | Days; assemble kits and copy UI |
| Fit with Base UI and Tailwind v4 | Native (Base UI dep, Tailwind 4.1 peer) | Copied components, your tokens; Base UI base available |
| Control over look | Moderate; override two variable sets and some classes | Full |
| Server rendering | Client-only | Client island plus `PlateStatic` for read-only |
| Markdown fidelity | Lossy | Strong |
| Weight | Heaviest | Medium, grows with plugins |
| Risk | Pre-1.0 API churn; MPL-2.0 file copyleft; xl-* GPL | Pre-stable API churn at v53; react-dnd extra dependency |

Recommendation: prototype BlockNote shadcn first (a note card with the editor bound to a JSON column in SQLite, themed through morrow tokens, dark mode, reduced motion). Prototype Plate if BlockNote's look cannot be fitted to the design system, if lossy Markdown matters, or if bundle size is a problem.

## Open questions for the prototype

- Measure real gzip size of the editor chunk in a TanStack Start build, lazy-loaded on card open.
- Check Base UI popovers and menus stack correctly against morrow z-index tokens and the 8px/12px/20px radius families.
- Check the nothing-under-13px and no-entrance-animation rules against BlockNote's and Plate's default menus.
- Confirm Plate CLI selects the Base UI registry base in this project.
