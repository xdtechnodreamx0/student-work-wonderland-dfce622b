import { useEffect, useRef, useState } from "react";
import type { ClubProject } from "@/lib/projects";
import { PROJECT_MEDIA } from "@/lib/projects-data";
import { cn } from "@/lib/utils";

/** The moving preview on each card: recorded video, AI-made video, a screenshot, or an emoji tile while Pixel works. */
export function ProjectPreview({ p, videoLink, className }: { p: ClubProject; videoLink?: string | undefined; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const builtIn = p.media_key ? PROJECT_MEDIA[p.media_key] : undefined;
  const video = builtIn?.video ?? videoLink;
  const poster = builtIn?.poster ?? p.poster_url ?? undefined;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset["mode"] === "study") {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(([e]) => (e?.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, [video]);

  const box = cn("relative aspect-[16/10] w-full overflow-hidden bg-muted", className);

  if (video && !failed) {
    return (
      <div className={box}>
        <video
          ref={ref}
          src={video}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
          aria-label={`Moving preview of ${p.title}`}
          className="h-full w-full object-cover object-top"
        />
      </div>
    );
  }
  return (
    <div className={box}>
      {poster ? (
        <img src={poster} alt={`Screenshot of ${p.title}`} loading="lazy" className="project-pan h-full w-full object-cover object-top" />
      ) : (
        <div className="grid h-full w-full place-items-center bg-hero text-7xl" aria-hidden="true">
          <span className="animate-float">{p.emoji}</span>
        </div>
      )}
      {(p.video_status === "pending" || p.ai_status === "pending") && (
        <span className="absolute inset-x-3 bottom-3 rounded-full bg-card/90 px-3 py-1.5 text-center text-xs font-bold shadow">
          🎬 Pixel is making the preview video…
        </span>
      )}
    </div>
  );
}
