import { useNavigate } from "@tanstack/react-router";
import { type Space, spaces } from "../spaces.ts";

/** The Personal / Work toggle in the app header. Switching goes to that space's home. */
export function SpaceSwitch({ current }: { current: Space }) {
  const navigate = useNavigate();
  return (
    <div role="group" aria-label="Space" className="space-switch">
      {spaces.map((space) => (
        <button
          key={space.id}
          type="button"
          className="space-switch__option"
          aria-pressed={space.id === current}
          onClick={() =>
            navigate({ to: "/", search: space.id === "work" ? { space: "work" } : {} })
          }
        >
          {space.label}
        </button>
      ))}
    </div>
  );
}
