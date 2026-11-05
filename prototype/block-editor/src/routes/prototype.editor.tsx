// PROTOTYPE, throwaway: BlockNote vs Plate for #16
import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { ClientOnly, createFileRoute, useNavigate } from '@tanstack/react-router'

type Variant = 'blocknote' | 'plate'
const VARIANTS: Variant[] = ['blocknote', 'plate']

const BlockNoteEditor = lazy(() => import('../editors/BlockNoteEditor'))
const PlateEditor = lazy(() => import('../editors/PlateEditor'))

export const Route = createFileRoute('/prototype/editor')({
  validateSearch: (s: Record<string, unknown>): { variant: Variant } => ({
    variant: s.variant === 'plate' ? 'plate' : 'blocknote',
  }),
  component: EditorPage,
})

function EditorPage() {
  const { variant } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [json, setJson] = useState<unknown>(null)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const go = useCallback(
    (dir: 1 | -1) => {
      const i = VARIANTS.indexOf(variant)
      const next = VARIANTS[(i + dir + VARIANTS.length) % VARIANTS.length]
      navigate({ search: { variant: next } })
    },
    [variant, navigate],
  )

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      const el = document.activeElement as HTMLElement | null
      if (el && (el.matches('input, textarea, [contenteditable]') || el.isContentEditable)) return
      go(e.key === 'ArrowRight' ? 1 : -1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const onChange = useCallback((doc: unknown) => setJson(doc), [])

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-8">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-base font-semibold">Editor prototype: {variant}</h1>
        <button
          type="button"
          className="proto-btn"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? 'Dark' : 'Light'} mode
        </button>
      </header>

      <div className="proto-card" data-variant={variant}>
        <ClientOnly fallback={<p className="p-4 text-sm text-muted-foreground">Loading editor...</p>}>
          <Suspense fallback={<p className="p-4 text-sm text-muted-foreground">Loading editor...</p>}>
            {variant === 'blocknote' ? (
              <BlockNoteEditor key="bn" theme={theme} onChange={onChange} />
            ) : (
              <PlateEditor key="plate" onChange={onChange} />
            )}
          </Suspense>
        </ClientOnly>
      </div>

      <details className="proto-card mt-4" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary className="cursor-pointer px-4 py-2 text-sm font-medium">Stored JSON (live)</summary>
        <pre className="max-h-96 overflow-auto border-t border-border p-4 text-[13px] leading-5">
          {JSON.stringify(json, null, 2)}
        </pre>
      </details>

      {import.meta.env.DEV && (
        <nav className="proto-pill" aria-label="Variant switcher">
          <button type="button" aria-label="Previous variant" onClick={() => go(-1)}>
            ←
          </button>
          <span>{variant}</span>
          <button type="button" aria-label="Next variant" onClick={() => go(1)}>
            →
          </button>
        </nav>
      )}
    </div>
  )
}
