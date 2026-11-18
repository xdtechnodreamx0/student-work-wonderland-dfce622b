import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { getMyProgress, type Progress } from "@/lib/learning.functions";

export function useProgress() {
  const auth = useAuth();
  const fn = useServerFn(getMyProgress);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["my-progress", auth.userId], enabled: !!auth.userId, queryFn: () => fn() as Promise<Progress> });
  const set = (p: Progress) => qc.setQueryData(["my-progress", auth.userId], p);
  return { ...q, set, signedIn: !!auth.userId };
}
