import { queryOptions, useQuery } from "@tanstack/react-query";
import { getClubContent } from "@/lib/club-content.functions";
import { supabase } from "@/integrations/supabase/client";
import type { Photo } from "@/lib/club-data";

export const clubContentQuery = queryOptions({
  queryKey: ["club-content"],
  queryFn: () => getClubContent(),
  staleTime: 30_000,
});

export const PHOTO_BUCKET = "club-photos";

/** Turns uploaded photo rows into displayable photos with short-lived links (made in the browser). */
export function useUploadedPhotos(rows: { id: string; path: string; caption: string; alt: string; width: number; height: number }[]) {
  return useQuery({
    queryKey: ["club-photo-links", rows.map((r) => r.path)],
    enabled: rows.length > 0,
    staleTime: 50 * 60_000,
    queryFn: async (): Promise<(Photo & { id: string; path: string })[]> => {
      const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(
        rows.map((r) => r.path),
        60 * 60,
      );
      return rows.map((r, i) => ({
        id: r.id,
        path: r.path,
        src: data?.[i]?.signedUrl ?? "",
        alt: r.alt,
        caption: r.caption,
        width: r.width,
        height: r.height,
        emoji: "📷",
      }));
    },
  });
}
