export default function Stars({
  value = 5,
  size = 13,
  className = "",
}: {
  value?: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex gap-[1.5px] ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= value ? "var(--coral)" : "var(--border)"}
          aria-hidden
        >
          <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8z" />
        </svg>
      ))}
    </span>
  );
}
