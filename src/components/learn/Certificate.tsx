import type { Certificate } from "@/lib/learning.functions";

export function CertificateCard({ c, small = false }: { c: Certificate; small?: boolean }) {
  return (
    <div className={`certificate relative overflow-hidden rounded-2xl border-4 border-double border-fun-amber bg-card text-center shadow-sm ${small ? "p-3" : "p-8"}`}>
      <p className={small ? "text-3xl" : "text-6xl"} aria-hidden="true">{c.topEmoji}</p>
      <p className="font-display text-xs font-bold uppercase tracking-widest text-fun-amber-ink">Certificate of Achievement</p>
      <p className={`font-display font-bold ${small ? "text-base" : "text-3xl"}`}>{c.name}</p>
      <p className={small ? "text-xs" : "text-lg"}>completed the <strong>{c.levelName}</strong> level</p>
      {!small && <p className="mt-1 text-muted-foreground">Math Blog Club · AI Explorers Learning Journey · Aga Khan School, Garden</p>}
      <div className={`mt-2 flex justify-between gap-2 ${small ? "text-[0.65rem]" : "mt-6 text-sm"}`}>
        <span>📅 {c.date}</span>
        <span className="italic">✍️ {c.signer}</span>
      </div>
    </div>
  );
}
