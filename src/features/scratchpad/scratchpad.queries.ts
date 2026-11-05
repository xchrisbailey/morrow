import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "#/components/ui/toast.tsx";
import { toAppError } from "#/server/errors.ts";
import { getScratchpadFn, saveScratchpadFn } from "./scratchpad.functions.ts";
import type { SaveScratchpadInput, Scratchpad } from "./scratchpad.schema.ts";

export const scratchpadKeys = {
  all: ["scratchpad"] as const,
  detail: () => [...scratchpadKeys.all, "detail"] as const,
};

export const scratchpadQueryOptions = () =>
  queryOptions({ queryKey: scratchpadKeys.detail(), queryFn: () => getScratchpadFn() });

/**
 * Direct manipulation, so the optimistic style: write the cache first, roll back
 * on error, invalidate once the last in-flight save settles.
 */
export function useSaveScratchpad() {
  const queryClient = useQueryClient();
  const key = scratchpadKeys.detail();
  return useMutation({
    mutationKey: [...scratchpadKeys.all, "save"],
    mutationFn: (input: SaveScratchpadInput) => saveScratchpadFn({ data: input }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Scratchpad>(key);
      queryClient.setQueryData<Scratchpad>(key, { content: input.content, updatedAt: Date.now() });
      return { previous };
    },
    onError: (error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.add({
        type: "error",
        title: "Couldn't save the Scratchpad",
        description: toAppError(error).message,
      });
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: [...scratchpadKeys.all, "save"] }) === 1) {
        return queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}
