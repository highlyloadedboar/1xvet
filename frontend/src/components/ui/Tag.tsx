type Tone = "neutral" | "accent" | "warn" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-border-lt text-muted border-border",
  accent: "bg-accent-bg text-accent border-accent-border",
  warn: "bg-warn-bg text-warn border-warn-bg",
  danger: "bg-coral-bg text-danger border-coral-bg",
};

export default function Tag({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
