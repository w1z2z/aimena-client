type SwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Switch({
  checked,
  onChange,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`site-switch${checked ? " is-on" : ""}${disabled ? " is-disabled" : ""}${className ? ` ${className}` : ""}`}
    >
      <span className="site-switch__track" aria-hidden />
      <span className="site-switch__knob" aria-hidden />
    </button>
  );
}
