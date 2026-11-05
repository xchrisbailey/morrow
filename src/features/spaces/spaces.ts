/** A Space is one of the Owner's two halves of Morrow. Personal is the default. */
export type Space = "personal" | "work";

export const spaces: readonly { id: Space; label: string }[] = [
  { id: "personal", label: "Personal" },
  { id: "work", label: "Work" },
];

/** The signed-in app's search params. Personal is the default, so it stays out of the URL. */
export type SpaceSearch = { space?: "work" };

export function validateSpaceSearch(search: Record<string, unknown>): SpaceSearch {
  return search.space === "work" ? { space: "work" } : {};
}

export function spaceOf(search: SpaceSearch): Space {
  return search.space ?? "personal";
}
