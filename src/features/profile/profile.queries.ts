import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getViewerFn, updateDisplayNameFn } from "./profile.functions.ts";
import type { DisplayNameInput } from "./profile.schema.ts";

export const profileKeys = {
  all: ["profile"] as const,
  viewer: () => [...profileKeys.all, "viewer"] as const,
};

export const viewerQueryOptions = () =>
  queryOptions({ queryKey: profileKeys.viewer(), queryFn: () => getViewerFn() });

/** Default mutation style: invalidate on success. */
export function useUpdateDisplayName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DisplayNameInput) => updateDisplayNameFn({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.all }),
  });
}
