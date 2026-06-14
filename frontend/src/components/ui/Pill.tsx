type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export default function Pill({ active, className = "", children, ...rest }: Props) {
  return (
    <button
      type="button"
      {...rest}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-accent bg-accent text-on-accent"
          : "border-border bg-surface text-muted hover:border-accent-border hover:text-foreground"
      } ${className}`}
    >
      {children}
    </button>
  );
}
