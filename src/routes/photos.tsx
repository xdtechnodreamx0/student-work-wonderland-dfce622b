import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PHOTOS } from "@/lib/club-data";
import { clubContentQuery, useUploadedPhotos } from "@/lib/club-content";
import { pageMeta } from "@/lib/seo";
import { PageHeader, Reveal, Section } from "@/components/club/Bits";
import { Lightbox, PolaroidPhoto } from "@/components/club/Lightbox";

export const Route = createFileRoute("/photos")({
  head: () => pageMeta("Photo wall", "Moments from our club: drawing and crafting, mentors teaching, show-off day and computer lab day."),
  loader: ({ context }) => context.queryClient.ensureQueryData(clubContentQuery),
  component: Photos,
});

const TILTS = ["-3deg", "2deg", "-1.5deg", "3deg"];

function Photos() {
  const [open, setOpen] = useState<number | null>(null);
  const { data } = useSuspenseQuery(clubContentQuery);
  const uploaded = useUploadedPhotos(data.photos);
  const all = [...PHOTOS, ...(uploaded.data ?? []).filter((p) => p.src)];
  return (
    <>
      <PageHeader eyebrow="📸 Photos" emoji="🖼️" title="Moments from our club" intro="Paper, crayons, whiteboards and screens — tap any photo to see it big. Use ← → to flip through." />
      <Section>
        <div className="mx-auto grid max-w-6xl gap-12 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((p, i) => (
            <Reveal key={p.src} delay={Math.min(i, 6) * 100}>
              <PolaroidPhoto photo={p} tilt={TILTS[i % TILTS.length] ?? "0deg"} onOpen={() => setOpen(i)} eager={i === 0} />
            </Reveal>
          ))}
        </div>
      </Section>
      <Lightbox items={all} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
