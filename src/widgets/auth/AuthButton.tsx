import type { ButtonHTMLAttributes, ReactNode } from "react";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  grow?: boolean;
};

export function AuthButton({
  children,
  variant = "primary",
  fullWidth = true,
  grow = false,
  className,
  type = "button",
  ...props
}: AuthButtonProps) {
  return (
    <button
      type={type}
      className={`auth-button auth-button--${variant}${fullWidth ? " auth-button--full" : ""}${grow ? " auth-button--grow" : ""}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
