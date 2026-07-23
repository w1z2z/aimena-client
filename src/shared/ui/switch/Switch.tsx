type SwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  className?: string;
  "aria-label"?: string;
};

export function Switch({ checked, onChange, className, "aria-label": ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`site-switch${checked ? " is-on" : ""}${className ? ` ${className}` : ""}`}
    >
      <span className="site-switch__track" aria-hidden />
      <span className="site-switch__knob" aria-hidden />
    </button>
  );
}
