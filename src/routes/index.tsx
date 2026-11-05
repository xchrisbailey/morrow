import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

// Placeholder: the app skeleton replaces this with the Scratchpad home screen.
function Home() {
  return (
    <main className="container">
      <div className="stack">
        <h1>Morrow</h1>
        <p className="text-muted-foreground">Notes, boards and todos in one place.</p>
        {import.meta.env.DEV && <Link to="/dev/components">Dev: component check</Link>}
      </div>
    </main>
  );
}
