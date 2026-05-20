import { announcementItems } from "@/data/navigation";

export function AnnouncementBar() {
  return (
    <div
      aria-label="Store announcements"
      className="group fixed top-0 right-0 left-0 z-[820] h-announcement overflow-hidden border-b border-white/10 bg-[rgba(3,3,4,0.98)] text-auren-accent-strong"
    >
      <div className="flex w-max min-w-full animate-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((group) => (
          <span
            aria-hidden={group === 1}
            className="flex flex-none items-center gap-[clamp(24px,5vw,72px)] min-w-[100vw] px-container"
            key={group}
          >
            {announcementItems.map((item) => (
              <small
                className="inline-flex h-announcement items-center whitespace-nowrap text-[rgba(240,220,174,0.88)] text-[0.66rem] font-black tracking-[0.16em] uppercase"
                key={`${group}-${item}`}
              >
                {item}
              </small>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
