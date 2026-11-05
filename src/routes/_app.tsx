import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { LogOutIcon, Settings2Icon } from "lucide-react";
import { Button } from "#/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import { getSessionUserFn, hasOwnerFn, signOutFn } from "#/features/auth/auth.functions.ts";
import { viewerQueryOptions } from "#/features/profile/profile.queries.ts";
import { SpaceSwitch } from "#/features/spaces/components/space-switch.tsx";
import { spaceOf, validateSpaceSearch } from "#/features/spaces/spaces.ts";

// Signed-in shell. The redirect is navigation only: every data server function
// is protected by the `authed` middleware.
export const Route = createFileRoute("/_app")({
  validateSearch: validateSpaceSearch,
  beforeLoad: async () => {
    const user = await getSessionUserFn();
    if (!user) throw redirect({ to: (await hasOwnerFn()) ? "/sign-in" : "/setup" });
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(viewerQueryOptions()),
  component: AppShell,
});

function AppShell() {
  const { data: viewer } = useQuery(viewerQueryOptions());
  const space = spaceOf(Route.useSearch());
  const router = useRouter();

  async function signOut() {
    await signOutFn();
    router.options.context.queryClient.clear();
    await router.navigate({ to: "/sign-in" });
  }

  return (
    <div className="shell-app">
      <header className="shell-app__header">
        <Link
          to="/"
          search={(prev) => prev}
          className="shell-app__brand text-foreground no-underline"
        >
          <MorrowMark />
          <span className="font-display text-[1.375rem] leading-none tracking-[-0.01em]">
            Morrow
          </span>
        </Link>
        <div className="shell-app__switch">
          <SpaceSwitch current={space} />
        </div>
        <div className="shell-app__actions">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
            className="text-muted-foreground"
            render={<Link to="/settings" search={(prev) => prev} />}
            nativeButton={false}
          >
            <Settings2Icon className="size-5" strokeWidth={1.6} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Account"
              className="ml-1.5 inline-flex size-(--size-control-md) items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden="true"
                className="inline-flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
              >
                {initialOf(viewer?.name)}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="truncate">{viewer?.name}</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link to="/settings" search={(prev) => prev} />}>
                <Settings2Icon />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOutIcon />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="shell-app__main">
        <Outlet />
      </main>
    </div>
  );
}

function initialOf(name: string | undefined) {
  return name?.trim().charAt(0).toUpperCase() || "?";
}

/** Sun on the horizon, in the accent. */
function MorrowMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
      className="text-primary"
    >
      <path d="M3 17h18" />
      <path d="M6 17a6 6 0 0 1 12 0" />
      <path d="M12 5v2M5.6 7.6l1.4 1.4M18.4 7.6 17 9" />
    </svg>
  );
}
