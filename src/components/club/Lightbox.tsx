import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRef } from "react";
import type { Photo } from "@/lib/club-data";

/** Full-screen photo viewer: Esc closes, ←/→ and swipe navigate, focus is trapped. */
export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: Photo[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const item = open ? (items[index] ?? null) : null;
  const go = (d: number) => {
    if (index === null) return;
    onIndex((index + d + items.length) % items.length);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-foreground/90 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center p-4 outline-none"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
          onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          {item && (
            <>
              <Dialog.Title className="sr-only">{item.caption}</Dialog.Title>
              <Dialog.Description className="sr-only">{item.alt}</Dialog.Description>
              <img
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl animate-pop"
                key={item.src}
              />
              <p className="mt-4 rounded-full bg-card px-4 py-1.5 font-display text-lg font-semibold text-foreground">
                {item.caption} <span className="text-muted-foreground">· {index! + 1} / {items.length}</span>
              </p>
              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-card text-foreground shadow-lg transition hover:scale-110"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-card text-foreground shadow-lg transition hover:scale-110"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
              <Dialog.Close
                aria-label="Close photo"
                className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-card text-foreground shadow-lg transition hover:rotate-90"
              >
                <X />
              </Dialog.Close>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Polaroid-framed, clickable photo with a graceful emoji fallback if it fails to load. */
export function PolaroidPhoto({
  photo,
  tilt,
  onOpen,
  eager = false,
}: {
  photo: Photo;
  tilt: string;
  onOpen?: () => void;
  eager?: boolean;
}) {
  return (
    <figure className="polaroid relative" style={{ "--tilt": tilt } as React.CSSProperties}>
      <span className="tape" aria-hidden="true" />
      <button
        type="button"
        onClick={onOpen}
        className="block w-full overflow-hidden rounded-sm bg-hero"
        aria-label={`Open photo: ${photo.caption}`}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={`aspect-square w-full transition duration-500 hover:scale-105 ${photo.height > photo.width * 1.2 ? "object-contain" : "object-cover"}`}
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = "none";
            img.parentElement?.setAttribute("data-fallback", photo.emoji);
          }}
        />
      </button>
      <figcaption className="absolute bottom-2 left-0 right-0 text-center font-display text-lg font-semibold text-foreground">
        {photo.emoji} {photo.caption}
      </figcaption>
    </figure>
  );
}
