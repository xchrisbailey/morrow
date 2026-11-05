import type { PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { useEffect, useState } from "react";
import type { Scratchpad } from "../scratchpad.schema.ts";

type Props = {
  initialContent: Scratchpad["content"];
  onChange: (content: Scratchpad["content"]) => void;
};

/** Follows `data-theme` on <html>, then the OS setting. */
function useColorScheme(): "light" | "dark" {
  const read = (): "light" | "dark" => {
    const forced = document.documentElement.dataset.theme;
    if (forced === "light" || forced === "dark") return forced;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const [scheme, setScheme] = useState(read);
  useEffect(() => {
    const update = () => setScheme(read());
    const media = matchMedia("(prefers-color-scheme: dark)");
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    media.addEventListener("change", update);
    update();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);
  return scheme;
}

/** Default export so it can be lazy-loaded; BlockNote is only ever rendered in the browser. */
export default function ScratchpadEditor({ initialContent, onChange }: Props) {
  const scheme = useColorScheme();
  const editor = useCreateBlockNote({
    initialContent: initialContent.length ? (initialContent as PartialBlock[]) : undefined,
  });
  return (
    <BlockNoteView
      editor={editor}
      theme={scheme}
      onChange={() => onChange(editor.document as unknown as Scratchpad["content"])}
    />
  );
}
