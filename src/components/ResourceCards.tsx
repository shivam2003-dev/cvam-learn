import type { Reference } from "@/lib/types";

const TYPE_STYLE: Record<string, { label: string; tone: string }> = {
  book: { label: "Book", tone: "text-amber border-amber/40" },
  official: { label: "Docs", tone: "text-lime border-lime/40" },
  paper: { label: "Paper", tone: "text-rose border-rose/40" },
  article: { label: "Article", tone: "text-sky border-sky/40" },
  video: { label: "Video", tone: "text-rose border-rose/40" },
  course: { label: "Course", tone: "text-amber border-amber/40" },
  opensource: { label: "Open source", tone: "text-lime border-lime/40" },
  roadmap: { label: "Roadmap", tone: "text-soft border-line" },
};

export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1) || null;
    if (host.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const embed = u.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/);
      if (embed) return embed[1];
    }
  } catch {}
  return null;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function VideoCard({ item, id }: { item: Reference; id: string }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group/card block overflow-hidden rounded-xl border border-line bg-ink transition hover:border-lime/60"
    >
      <div className="relative aspect-video overflow-hidden bg-raised">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition group-hover/card:scale-[1.03]"
        />
        <span className="absolute inset-0 grid place-items-center bg-black/20 transition group-hover/card:bg-black/5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-black/70 ring-1 ring-white/30">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-white" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-text">{item.title}</p>
        <p className="mt-1.5 font-mono text-[11px] text-faint">YouTube</p>
      </div>
    </a>
  );
}

export function LinkCard({ item }: { item: Reference }) {
  const host = hostOf(item.url);
  const style = TYPE_STYLE[item.type] ?? { label: item.type, tone: "text-soft border-line" };
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="flex gap-3 rounded-xl border border-line bg-ink p-3 transition hover:border-lime/60"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-raised">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
          alt=""
          loading="lazy"
          width={22}
          height={22}
          className="h-[22px] w-[22px] rounded-sm"
        />
      </span>
      <span className="min-w-0">
        <span
          className={`inline-block rounded-full border px-2 py-px font-mono text-[10px] uppercase tracking-wide ${style.tone}`}
        >
          {style.label}
        </span>
        <span className="mt-1.5 line-clamp-2 block text-sm font-medium leading-snug text-text">
          {item.title}
        </span>
        <span className="mt-1 block truncate font-mono text-[11px] text-faint">{host}</span>
      </span>
    </a>
  );
}

/** Single YouTube videos become thumbnail cards; everything else stays a link card. */
export function splitVideos(items: Reference[]) {
  const videos = items.flatMap((item) => {
    const id = item.type === "video" ? youtubeId(item.url) : null;
    return id ? [{ item, id }] : [];
  });
  const videoUrls = new Set(videos.map(({ item }) => item.url));
  return { videos, rest: items.filter((item) => !videoUrls.has(item.url)) };
}
