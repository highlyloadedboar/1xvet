const AV_COLORS = [
  "#2ee6a0",
  "#8a1f43",
  "#ff6a4d",
  "#7c5cff",
  "#f5b544",
  "#2f9e8f",
  "#16573e",
  "#c2761f",
];

export default function Avatar({
  name,
  size = 40,
  seed = 0,
  className = "",
}: {
  name: string;
  size?: number;
  seed?: number;
  className?: string;
}) {
  const bg = AV_COLORS[Math.abs(seed) % AV_COLORS.length];
  const initials = (name || "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-sans font-bold text-white tracking-tight ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  );
}
