import { createFileRoute, notFound } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import { Input } from "#/components/ui/input.tsx";
import { toast } from "#/components/ui/toast.tsx";

// DEV ONLY. A temporary page for checking the shadcn components against the
// design tokens in light and dark. It 404s in production builds, and the app
// skeleton (issue #24) may delete it.
export const Route = createFileRoute("/dev/components")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: ComponentCheck,
});

type Theme = "light" | "dark" | "system";

function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);
  return [theme, setTheme] as const;
}

const variants = [
  "default",
  "secondary",
  "soft",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;
const sizes = ["xs", "sm", "default", "lg"] as const;

function ComponentCheck() {
  const [theme, setTheme] = useTheme();
  return (
    <main className="container">
      <div className="stack" style={{ "--gap": "var(--space-8)" } as CSSProperties}>
        <header className="stack">
          <p className="rounded-control border border-warning-border bg-warning-bg px-3 py-2 text-sm text-warning-text">
            Dev only. A temporary page for checking components; the app skeleton may remove it.
          </p>
          <div className="spread">
            <h1>Components</h1>
            <div className="cluster" role="group" aria-label="Theme">
              {(["light", "dark", "system"] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={theme === t ? "default" : "secondary"}
                  aria-pressed={theme === t}
                  onClick={() => setTheme(t)}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </header>

        <section className="stack" aria-labelledby="buttons">
          <h2 id="buttons" className="text-xl">
            Button
          </h2>
          {sizes.map((size) => (
            <div key={size} className="cluster">
              {variants.map((variant) => (
                <Button key={variant} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
            </div>
          ))}
          <div className="cluster">
            <Button disabled>Disabled</Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
            <Button variant="secondary" size="icon" aria-label="More">
              <MoreHorizontalIcon />
            </Button>
          </div>
        </section>

        <section className="stack" aria-labelledby="inputs">
          <h2 id="inputs" className="text-xl">
            Input
          </h2>
          <div className="stack" style={{ maxInlineSize: "var(--container-xs)" }}>
            <Input placeholder="Placeholder text" aria-label="Default" />
            <Input defaultValue="Typed value" aria-label="Filled" />
            <Input defaultValue="Not an email" aria-invalid aria-label="Invalid" />
            <Input placeholder="Disabled" disabled aria-label="Disabled" />
          </div>
        </section>

        <section className="stack" aria-labelledby="menu">
          <h2 id="menu" className="text-xl">
            Dropdown menu
          </h2>
          <div className="cluster">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="secondary" />}>
                Open menu
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Card</DropdownMenuLabel>
                  <DropdownMenuItem>
                    Rename <DropdownMenuShortcut>R</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Move to Work</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        <section className="stack" aria-labelledby="dialog">
          <h2 id="dialog" className="text-xl">
            Dialog
          </h2>
          <div className="cluster">
            <Dialog>
              <DialogTrigger render={<Button variant="secondary" />}>Open dialog</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename section</DialogTitle>
                  <DialogDescription>Sections hold boards. Pick a short name.</DialogDescription>
                </DialogHeader>
                <Input defaultValue="Side projects" aria-label="Section name" />
                <DialogFooter showCloseButton>
                  <Button>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        <section className="stack" aria-labelledby="toast">
          <h2 id="toast" className="text-xl">
            Toast
          </h2>
          <div className="cluster">
            <Button
              variant="secondary"
              onClick={() => toast.add({ title: "Saved", description: "Your changes are in." })}
            >
              Default
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.add({ type: "success", title: "Display name updated" })}
            >
              Success
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast.add({
                  type: "error",
                  title: "Couldn't save changes",
                  description: "Check your connection and try again.",
                })
              }
            >
              Error
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
