import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button.tsx";
import { getSessionUserFn, hasOwnerFn, signOutFn } from "#/features/auth/auth.functions.ts";
import { viewerQueryOptions } from "#/features/profile/profile.queries.ts";

// Signed-in shell. The redirect is navigation only: every data server function
// is protected by the `authed` middleware.
export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const user = await getSessionUserFn();
    if (!user) throw redirect({ to: (await hasOwnerFn()) ? "/sign-in" : "/setup" });
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(viewerQueryOptions()),
  component: AppShell,
});

const navClass =
  "flex h-(--size-control-md) items-center rounded-control px-3 text-sm font-medium text-muted-foreground hover:bg-secondary-hover hover:text-foreground [&.active]:bg-accent [&.active]:text-accent-foreground";

function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const { data: viewer } = useQuery(viewerQueryOptions());
  const router = useRouter();

  async function signOut() {
    await signOutFn();
    router.options.context.queryClient.clear();
    await router.navigate({ to: "/sign-in" });
  }

  return (
    <div className="shell-app" data-nav-open={navOpen ? "" : undefined}>
      <header className="shell-app__header">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Toggle navigation"
          onClick={() => setNavOpen((open) => !open)}
        >
          <MenuIcon />
        </Button>
        <span className="font-semibold">Morrow</span>
      </header>
      <aside className="shell-app__sidebar flex flex-col gap-4 p-3">
        <nav className="flex flex-col gap-1" onClick={() => setNavOpen(false)}>
          <Link to="/" className={navClass} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/settings" className={navClass}>
            Settings
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t pt-3">
          <p className="truncate px-3 text-sm text-muted-foreground">{viewer?.name}</p>
          <Button variant="ghost" className="justify-start" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </aside>
      <main className="shell-app__main">
        <Outlet />
      </main>
    </div>
  );
}
