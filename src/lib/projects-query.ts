import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { listProjects } from "@/lib/projects.functions";
import { PROJECT_MEDIA_BUCKET } from "@/lib/projects";

export const projectsQuery = queryOptions({
  queryKey: ["club-projects"],
  queryFn: () => listProjects(),
  staleTime: 20_000,
});

/** Short-lived links (made in the browser) for AI preview videos stored in the private project bucket. */
export function useProjectVideoLinks(paths: string[]) {
  return useQuery({
    queryKey: ["project-video-links", paths],
    enabled: paths.length > 0,
    staleTime: 50 * 60_000,
    queryFn: async (): Promise<Record<string, string>> => {
      const { data } = await supabase.storage.from(PROJECT_MEDIA_BUCKET).createSignedUrls(paths, 60 * 60);
      const out: Record<string, string> = {};
      (data ?? []).forEach((d, i) => {
        if (d.signedUrl) out[paths[i]!] = d.signedUrl;
      });
      return out;
    },
  });
}
