import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import { toast } from "sonner";

type Post = { id: string; saved?: boolean; supported?: boolean; supportCount?: number };
type Snapshot = Partial<Post> & { posts?: Post[] };

export function useAcademicPostToggle(
  field: "saved" | "supported",
  queryKey: string,
  mutationFn: (postId: string) => Promise<Partial<Record<"saved" | "supported", boolean>>>,
  extraPosts: Post[] = [],
  setExtraPosts?: Dispatch<SetStateAction<any[]>>,
) {
  const qc = useQueryClient();
  const pending = useRef(new Map<string, { confirmed: boolean; desired: boolean }>());
  const patch = (posts: Post[], id: string, active: boolean) => posts.map(p => p.id !== id ? p : {
    ...p, [field]: active,
    ...(field === "supported" ? { supportCount: Math.max(0, (p.supportCount ?? 0) + Number(active) - Number(Boolean(p.supported))) } : {}),
  });
  const update = (id: string, active: boolean) => {
    qc.setQueriesData<Snapshot>({ queryKey: [queryKey] }, old => old?.posts ? { ...old, posts: patch(old.posts, id, active) } : old?.id === id ? { ...old, ...patch([old as Post], id, active)[0] } : old);
    setExtraPosts?.(posts => patch(posts, id, active));
  };
  const mutation = useMutation({
    mutationKey: [queryKey, "post-toggle"],
    mutationFn: async (id: string) => {
      const job = pending.current.get(id)!;
      try {
        // One request per post/action at a time; clicks change only the desired state.
        while (job.confirmed !== job.desired) {
          const result = await mutationFn(id);
          if (typeof result[field] !== "boolean") throw new Error("Invalid post action response");
          job.confirmed = result[field];
        }
        update(id, job.confirmed);
      } catch (error) {
        update(id, job.confirmed);
        throw error;
      } finally {
        pending.current.delete(id);
      }
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => {
      if (qc.isMutating({ mutationKey: [queryKey, "post-toggle"] }) === 1) {
        return Promise.all([
          qc.invalidateQueries({ queryKey: [queryKey] }),
          qc.invalidateQueries({ queryKey: ["academic-saved-content"] }),
          qc.invalidateQueries({ queryKey: ["academic-post"] }),
          qc.invalidateQueries({ queryKey: ["academic-network"] }),
        ]);
      }
      return undefined;
    },
  });
  const mutate = (id: string) => {
    const queued = pending.current.get(id);
    void qc.cancelQueries({ queryKey: [queryKey] });
    if (queued) {
      queued.desired = !queued.desired;
      update(id, queued.desired);
      return;
    }
    const post = qc.getQueriesData<Snapshot>({ queryKey: [queryKey] })
      .flatMap(([, value]) => value?.posts ?? (value?.id ? [value as Post] : [])).find(p => p.id === id) ?? extraPosts.find(p => p.id === id);
    const confirmed = Boolean(post?.[field]);
    pending.current.set(id, { confirmed, desired: !confirmed });
    update(id, !confirmed);
    mutation.mutate(id);
  };
  return { ...mutation, mutate };
}
