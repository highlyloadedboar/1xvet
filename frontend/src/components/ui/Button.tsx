import { forwardRef } from "react";

type Variant = "primary" | "outline" | "ghost" | "soft";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent border border-transparent hover:bg-accent-dim",
  outline:
    "bg-transparent text-accent border-[1.5px] border-accent-border hover:bg-accent-bg",
  ghost:
    "bg-transparent text-muted border border-transparent hover:bg-border-lt",
  soft:
    "bg-surface-2 text-foreground border border-border hover:bg-border-lt",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-[15px] py-[7px] text-[13px]",
  md: "px-[22px] py-[10px] text-[14px]",
  lg: "px-[30px] py-[14px] text-[15.5px]",
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className = "", children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      {...rest}
      className={`inline-flex items-center justify-center gap-[7px] rounded-[13px] font-semibold tracking-[-0.1px] transition-all whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  );
});

export default Button;
