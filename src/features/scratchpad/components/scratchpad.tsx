import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { scratchpadQueryOptions, useSaveScratchpad } from "../scratchpad.queries.ts";
import type { Scratchpad as ScratchpadData } from "../scratchpad.schema.ts";

const ScratchpadEditor = lazy(() => import("./scratchpad-editor.tsx"));

const AUTOSAVE_MS = 800;

/**
 * Debounced autosave that also flushes on blur, when the page hides or unloads,
 * and when the component unmounts. Returns the `onChange` for the editor.
 */
function useAutosave() {
  const { mutate } = useSaveScratchpad();
  const pending = useRef<ScratchpadData["content"] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const content = pending.current;
    pending.current = null;
    if (content) mutate({ content });
  }, [mutate]);

  useEffect(() => {
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [flush]);

  const onChange = useCallback(
    (content: ScratchpadData["content"]) => {
      pending.current = content;
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, AUTOSAVE_MS);
    },
    [flush],
  );

  return { onChange, flush };
}

export function Scratchpad() {
  const { data } = useSuspenseQuery(scratchpadQueryOptions());
  const { onChange, flush } = useAutosave();
  // The editor is uncontrolled: it takes the loaded content once, then owns it.
  const [initial] = useState(() => data.content);

  return (
    <div className="editor">
      <h1 className="editor__title">Scratchpad</h1>
      <div onBlur={flush} className="min-h-64">
        <ClientOnly fallback={<p className="text-muted-foreground">Loading editor…</p>}>
          <Suspense fallback={<p className="text-muted-foreground">Loading editor…</p>}>
            <ScratchpadEditor initialContent={initial} onChange={onChange} />
          </Suspense>
        </ClientOnly>
      </div>
    </div>
  );
}
