# How does shadcn's Base UI variant take morrow's tokens?

Research for issue #15. Researched 2026-11-05 against shadcn CLI 4.23.0 (`packages/shadcn/package.json` on main) and the live docs.

## Short answer

shadcn's Base UI variant is first class (and the `init` default since July 2026). It styles everything through the usual `--background`/`--primary`/`--radius` variables plus `@theme inline`. Morrow keeps its tokens as the source of truth by adding one small bridge file that defines the shadcn variable names as `var(--color-...)` aliases of morrow's semantic tokens. Dark mode needs no duplicated values, because morrow's semantic tokens already remap. Two things need care: the Tailwind `dark:` variant (must follow `prefers-color-scheme` plus `data-theme`) and a `--radius-*` name collision with morrow's primitives.

## 1. Base UI support

- **Default.** "Run `npx shadcn init` and Base UI is the default pick"; `-b radix` keeps Radix. Radix still gets "every update and new component" (unless a component is Base UI only). `asChild` became `render`. Source: https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- **CLI flags.** `shadcn init -b, --base <base>` takes `base`, `radix` or `aria`; `-p, --preset`, `-t, --template` (next, vite, start, react-router, laravel, astro), `--css-variables` (default on). `-d` means `--template=next --preset=nova`. Source: https://ui.shadcn.com/docs/cli
- **components.json.** The style value is `<base>-<preset>`, for example `"style": "base-nova"`, `"iconLibrary": "lucide"` (https://ui.shadcn.com/docs/installation/manual). The older docs page https://ui.shadcn.com/docs/components-json still shows `"new-york"` and says style and `baseColor` cannot change after init; `cssVariables: true` is recommended and switching later means reinstalling components; `tailwind.css` is the path to the CSS file importing Tailwind. Eight styles exist in the registry (`style-luma, lyra, maia, mira, nova, rhea, sera, vega.css`), per the changelog ("across all eight styles") and `apps/v4/registry/styles/`.
- **Dependencies.** The base's registry style depends on `@base-ui/react`, `class-variance-authority`, `cn`, `lucide-react`, dev deps `tw-animate-css` and `shadcn`, and injects `@import "tw-animate-css"; @import "shadcn/tailwind.css";` plus `* { @apply border-border outline-ring/50 }` and `body { @apply bg-background text-foreground }`. Source: `apps/v4/registry/bases/base/registry.ts` and `apps/v4/registry/bases.ts` (https://github.com/shadcn-ui/ui).
- **Coverage vs Radix.** Diffing `apps/v4/registry/bases/base/ui` against `bases/radix/ui` (about 62 files each): identical except Base UI has an extra `toast.tsx`. A third base, React Aria, exists. Newer components (Trace, Code Block, Questionnaire) ship for Base UI, React Aria and Radix (changelog Aug/Oct 2026). So there are no component gaps in this direction; the gap is behavioural: the migration note says behaviour differences exist and are only flagged, not auto-patched. Not verified per component here.
- **How components are styled.** Component files carry only structural classes plus a `cn-*` hook (for example `cn-button cn-button-variant-default`); the look lives in the style CSS (for example `style-nova.css`: `.cn-button-variant-default { @apply bg-primary text-primary-foreground hover:bg-primary/80 }`). That CSS is generated into the project at init, so it is editable.
- **Hooks into Base UI state.** `shadcn/tailwind.css` defines `@custom-variant data-open`, `data-closed`, `data-checked`, `data-unchecked`, `data-disabled`, `data-active`, etc. matching both Radix (`data-state=...`) and Base UI (`data-open`) attributes. Every part carries `data-slot`.

## 2. Variables expected

From https://ui.shadcn.com/docs/theming:

- Pairs: `--background/--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent` (each with `-foreground`), plus `--destructive` (no foreground), `--border`, `--input`, `--ring`, `--chart-1..5`, `--sidebar`, `--sidebar-foreground`, `--sidebar-primary(-foreground)`, `--sidebar-accent(-foreground)`, `--sidebar-border`, `--sidebar-ring`, and `--radius` (default `0.625rem`).
- Defined under `:root` and `.dark`, exposed through `@theme inline { --color-background: var(--background); ... }`.
- Radius scale in `@theme inline`: `--radius-sm: calc(var(--radius) * 0.6)`, `md` 0.8, `lg` 1, `xl` 1.4, `2xl` 1.8, `3xl` 2.2, `4xl` 2.6.
- Dark mode: `@custom-variant dark (&:is(.dark *));`.
- Why `inline`: Tailwind docs say with `@theme inline` "the utility class will use the theme variable value instead of referencing the actual theme variable", which avoids `var()` being resolved at the wrong scope. It is required when theme values are `var()` references (https://tailwindcss.com/docs/theme). The v4 migration notes (https://ui.shadcn.com/docs/tailwind-v4) say the same: move `:root`/`.dark` out of `@layer base`, add `inline`.
- Opacity modifiers (`bg-primary/80`, `ring-ring/50`) compile to `color-mix()` in Tailwind v4, so OKLCH values in custom properties work, including morrow's alpha-bearing tokens.

## 3. The bridge from morrow's tokens

Principle (ADR-0001): `design/tokens/*.css` stays the only place values live. The bridge file holds aliases only and is never edited per theme.

```css
/* design/shadcn-bridge.css  (imported after design/index.css) */
:root {
  --background: var(--color-bg);
  --foreground: var(--color-text);
  --card: var(--color-surface);
  --card-foreground: var(--color-text);
  --popover: var(--color-surface-raised);
  --popover-foreground: var(--color-text);
  --primary: var(--color-accent);
  --primary-foreground: var(--color-text-on-accent);
  --secondary: var(--color-control);
  --secondary-foreground: var(--color-text);
  --muted: var(--color-surface-sunken);
  --muted-foreground: var(--color-text-muted);
  --accent: var(--color-accent-subtle);        /* shadcn "accent" = hover/selected wash, not brand accent */
  --accent-foreground: var(--color-accent-text);
  --destructive: var(--color-danger);
  --border: var(--color-border);
  --input: var(--color-border-strong);
  --ring: var(--color-focus-ring);
  --radius: var(--radius-sm);                  /* 8px base; see radius note */
  --chart-1: var(--blue-500);                  /* charts: only place a primitive is allowed; or add semantic chart tokens */
  --chart-2: var(--green-500);
  --chart-3: var(--amber-500);
  --chart-4: var(--red-500);
  --chart-5: var(--gray-500);
  --sidebar: var(--color-bg-subtle);
  --sidebar-foreground: var(--color-text);
  --sidebar-primary: var(--color-accent);
  --sidebar-primary-foreground: var(--color-text-on-accent);
  --sidebar-accent: var(--color-accent-subtle);
  --sidebar-accent-foreground: var(--color-accent-text);
  --sidebar-border: var(--color-border);
  --sidebar-ring: var(--color-focus-ring);
}
/* No .dark block: the right-hand tokens already change under
   prefers-color-scheme and [data-theme=dark]. */

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  /* ...chart-1..5, sidebar-* same pattern... */
}

@custom-variant dark {
  &:where([data-theme="dark"], [data-theme="dark"] *) { @slot; }
  @media (prefers-color-scheme: dark) {
    &:where(:not([data-theme="light"], [data-theme="light"] *)) { @slot; }
  }
}
```

Points to check when implementing (I did not run a build; the sketch is from the docs and the registry source):

1. **Name collision on `--color-*`.** Tailwind's namespace is `--color-*`, and morrow's semantic tokens use it too (`--color-accent`, `--color-border`, `--color-text`...). The shadcn lines `--color-accent: var(--accent)` and `--color-border: var(--border)` in `@theme inline` redefine morrow tokens that already exist, and `--accent` itself points at `--color-accent-subtle`, so the two meanings of "accent" would clash (`--color-accent` would end up as the subtle wash, breaking morrow's brand accent). Options: (a) recommended: when Tailwind is adopted, rename the clashing morrow semantic tokens (ADR-0001 expects a Tailwind `@theme` mapping, so this is in scope), (b) keep morrow names and set shadcn's `--color-accent` and `--color-border` theme keys to the same values morrow already uses, accepting that `bg-accent` is then the brand blue and restyling the `cn-*` rules that use `accent` for hover washes. This is the main open decision for the ticket that consumes this research.
2. **Radius collision.** Morrow primitives define `--radius-sm/md/lg` (8/12/20px) in `:root`; shadcn's `@theme inline` redefines `--radius-sm..4xl` as multiples of `--radius`. Same-name definitions fight. Either drop shadcn's radius scale and restyle `cn-*` rules to role utilities (`rounded-control`, `rounded-card`, `rounded-panel`, `rounded-dialog` via a `--radius-control: var(--radius-control)`-style theme entry with distinct keys), or rename morrow's primitives. Since the `cn-*` style CSS is generated into the repo, editing it is feasible.
3. **Dark variant.** Components use `dark:` (for example `dark:aria-invalid:ring-destructive/40`), so `@custom-variant dark` must match morrow's mechanism. Tailwind's docs only show the data-attribute form (`@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`); they show no combined media-query form (https://tailwindcss.com/docs/dark-mode). The nested `@media` variant above is my extrapolation; test it. Because the bridge variables already follow morrow's theming, only the few explicit `dark:` utilities depend on it.
4. **Shadows, fonts.** shadcn nova uses `shadow-md`, `ring-1 ring-foreground/10`. Map `--shadow-*` and `--font-sans` into `@theme` only under non-clashing names or accept that same-named theme keys equal morrow's values (same value, no conflict).
5. **`border-border`/`outline-ring/50` defaults** from the style's `@layer base` can be removed or kept; they read the bridged variables.
6. `cssVariables: true`, `baseColor` is irrelevant once the bridge overrides every variable; run init with a preset (nova) and then replace the generated `:root`/`.dark` blocks in `tailwind.css` with the bridge import.

## 4. Animation and design-system rule 7

- Base UI: components expose `data-open`/`data-closed` and `data-starting-style`/`data-ending-style`. Base UI recommends CSS transitions on the starting/ending-style attributes ("a transition can be smoothly cancelled midway"), supports CSS animations and JS libraries (Motion), and detects CSS animations before unmounting. Its animation page says nothing on reduced motion (https://base-ui.com/react/handbook/animation).
- shadcn components use `tw-animate-css` utilities: popover is `data-open:animate-in data-closed:animate-out fade-in-0 zoom-in-95 slide-in-from-top-2 duration-100`; dialog overlay is `fade-in-0 duration-100` (from `style-nova.css`). `tw-animate-css` replaced `tailwindcss-animate` and is installed by default (https://ui.shadcn.com/docs/tailwind-v4). It is a dev dependency (CSS only, no JS) and `shadcn/tailwind.css` also adds accordion keyframes.
- Fit with rule 7: rule 7 says "no bounce, no scroll-triggered motion, no entrance animations" except menus and popovers fading with a 6px drop (`--duration-panel`, 200ms) and sheets/dialogs at `--duration-sheet`. shadcn's zoom-in-95, slide-in-from-*-2 (8px) and 100ms durations do not match. Reduced motion: `design/base.css` already has `@media (prefers-reduced-motion: reduce)` that turns motion off globally, which will also neutralise `animate-in` keyframes (not confirmed against `animation-duration` overrides; verify).
- Options, in order of preference: (1) keep `tw-animate-css` but rewrite the `cn-*` popover/dialog/overlay rules in the generated style CSS to morrow's durations and easings; (2) drop `tw-animate-css` and write `[data-starting-style]/[data-ending-style]` transitions in morrow CSS, which Base UI supports natively and is the lower-dependency route that matches ADR-0001; the `data-open`/`data-closed` custom variants from `shadcn/tailwind.css` still work either way. Hover and press motion on buttons (`transition-all`, `active:translate-y-px`) in shadcn also needs retuning to 140/200/90ms on `--ease-standard`.

## Open items / not verified

- No build was run; the CSS sketch is untested.
- Per-component Base UI behavioural gaps vs Radix are not enumerated in the docs.
- The `components-json` docs page lags the CLI (still shows `new-york`); the style value `base-nova` comes from the manual installation page.
