type CommonProps = {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
};

type InputFieldProps = CommonProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
    area?: false;
  };

type TextareaFieldProps = CommonProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    area: true;
  };

type Props = InputFieldProps | TextareaFieldProps;

export default function Field(props: Props) {
  const { label, icon, error, className = "" } = props;
  const id =
    props.id ?? `field-${(label ?? "").toLowerCase().replace(/\s+/g, "-")}`;

  const inputClasses = `block w-full rounded-[11px] border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-light outline-none transition-colors focus:border-accent ${icon ? "pl-9" : ""}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-light">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-light">
            {icon}
          </span>
        )}
        {props.area ? (
          <textarea
            {...(props as TextareaFieldProps)}
            id={id}
            className={`${inputClasses} resize-none`}
          />
        ) : (
          <input
            {...(props as InputFieldProps)}
            id={id}
            className={inputClasses}
          />
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
