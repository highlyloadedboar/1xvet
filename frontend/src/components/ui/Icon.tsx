type IconName =
  | "pulse"
  | "search"
  | "chat"
  | "shield"
  | "paw"
  | "plus"
  | "arrow"
  | "x"
  | "check"
  | "bell"
  | "doc"
  | "calendar"
  | "trash"
  | "filter"
  | "send"
  | "image"
  | "clip"
  | "back";

const PATHS: Record<IconName, React.ReactNode> = {
  pulse: (
    <path d="M3 12h4l2-7 3 14 2-7 2 4h5" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  chat: (
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.7-.8L3 21l1.9-5.3A8.4 8.4 0 1 1 21 11.5z" />
  ),
  shield: (
    <path d="M12 3l8 4v5c0 5-3.5 8.4-8 10-4.5-1.6-8-5-8-10V7l8-4z" />
  ),
  paw: (
    <>
      <circle cx="6" cy="9" r="2.2" />
      <circle cx="10.5" cy="6" r="2" />
      <circle cx="13.5" cy="6" r="2" />
      <circle cx="18" cy="9" r="2.2" />
      <path d="M12 12c-3 0-6 2.4-6 5.5 0 1.7 1.4 2.5 2.5 2.5 1.6 0 2-1 3.5-1s1.9 1 3.5 1c1.1 0 2.5-.8 2.5-2.5 0-3.1-3-5.5-6-5.5z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14M13 5l7 7-7 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 13l4 4L19 7" />,
  bell: (
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9zM10 21h4" />
  ),
  doc: (
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zM14 3v6h6" />
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </>
  ),
  trash: (
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  ),
  filter: <path d="M3 5h18l-7 9v6l-4-2v-4L3 5z" />,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="M21 15l-5-5L5 21" />
    </>
  ),
  clip: (
    <path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 1 1 5 5L10.5 17.5a2 2 0 1 1-3-3L15 7" />
  ),
  back: <path d="M19 12H5M12 19l-7-7 7-7" />,
};

export default function Icon({
  name,
  size = 16,
  className = "",
  strokeWidth = 1.8,
  fill = false,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  fill?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
