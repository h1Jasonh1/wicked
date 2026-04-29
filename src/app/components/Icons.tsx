export type IconName =
  | "search"
  | "user"
  | "heart"
  | "bag"
  | "menu"
  | "close"
  | "arrow"
  | "star"
  | "truck"
  | "gem"
  | "shield"
  | "return"
  | "plus"
  | "minus"
  | "up"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "x"
  | "check"
  | "card"
  | "filter"
  | "mail"
  | "phone"
  | "map";

export function Icon({ name }: { name: IconName }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    focusable: false,
  };

  switch (name) {
    case "search":
      return (
        <svg {...common}>
          <path d="M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />
          <path d="m16 16 4.2 4.2" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <path d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
          <path d="M4.8 20.2c1.2-3.4 3.5-5.1 7.2-5.1s6 1.7 7.2 5.1" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.4 5.8c-1.7-1.7-4.4-1.6-6 .2L12 8.3 9.6 6c-1.7-1.8-4.4-1.9-6-.2-1.9 1.9-1.7 5 .3 6.9l8.1 7.5 8.1-7.5c2-1.9 2.2-5 .3-6.9Z" />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <path d="M6.4 8.6h11.2l1 11.2H5.4l1-11.2Z" />
          <path d="M9 8.6V7.2a3 3 0 0 1 6 0v1.4" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12" />
          <path d="M18 6 6 18" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h13" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="m12 3.2 2.7 5.4 6 .9-4.4 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.4-4.2 6-.9L12 3.2Z" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M3.5 6.8h11.1v9.1H3.5z" />
          <path d="M14.6 10h3.1l2.8 3.1v2.8h-5.9" />
          <path d="M7 19a1.9 1.9 0 1 0 0-3.8A1.9 1.9 0 0 0 7 19Z" />
          <path d="M17.4 19a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Z" />
        </svg>
      );
    case "gem":
      return (
        <svg {...common}>
          <path d="M6.2 4.4h11.6l3.1 4.5L12 20 3.1 8.9l3.1-4.5Z" />
          <path d="M3.1 8.9h17.8" />
          <path d="m8 8.9 4 11.1 4-11.1" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3.4 19 6v5.2c0 4.4-2.7 7.7-7 9.4-4.3-1.7-7-5-7-9.4V6l7-2.6Z" />
          <path d="m8.8 12 2.1 2.1 4.5-4.7" />
        </svg>
      );
    case "return":
      return (
        <svg {...common}>
          <path d="M8 7H5v5h5" />
          <path d="M5.3 12a7.4 7.4 0 1 0 2.2-5.2" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "minus":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
        </svg>
      );
    case "up":
      return (
        <svg {...common}>
          <path d="m6 14 6-6 6 6" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <path d="M12 15.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" />
          <path d="M16.9 7.1h.1" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M13.7 4.2v9.4a4.1 4.1 0 1 1-3.7-4.1" />
          <path d="M13.7 4.2c.6 2.8 2.2 4.5 5.1 4.8" />
          <path d="M10 13.4a1.6 1.6 0 1 0 1.6 1.6V9.5" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M14 8.4h2.2V4.8h-2.8c-3 0-4.5 1.8-4.5 4.5v2H6.4V15h2.5v5.2h3.8V15h3l.5-3.7h-3.5V9.7c0-.8.4-1.3 1.3-1.3Z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M5 5h4.1l10 14h-4.1L5 5Z" />
          <path d="M19 5 5 19" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4.2 4.2L19 6.8" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3.8" y="5.8" width="16.4" height="12.4" rx="2.2" />
          <path d="M4.2 10h15.6" />
          <path d="M7.2 14.5h3.4" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <path d="M4 6h16" />
          <path d="M7 12h10" />
          <path d="M10 18h4" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3.8" y="5.6" width="16.4" height="12.8" rx="2" />
          <path d="m4.5 7 7.5 6 7.5-6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M7.2 4.3 9.7 4l1.4 4-1.6 1.2c.9 1.9 2.4 3.4 4.3 4.3l1.2-1.6 4 1.4-.3 2.5c-.1 1.1-1 1.9-2.1 1.9A12.3 12.3 0 0 1 4.1 6.4c0-1.1.8-2 1.9-2.1Z" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
          <path d="M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M5 12h14" />
        </svg>
      );
  }
}
