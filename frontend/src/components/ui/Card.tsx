type Props = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export default function Card({ hover, className = "", children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={`rounded-2xl border border-border bg-surface shadow-[0_2px_14px_rgba(16,60,40,0.06)] ${hover ? "cursor-pointer transition-all hover:shadow-[0_12px_44px_rgba(16,60,40,0.11)] hover:-translate-y-0.5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
