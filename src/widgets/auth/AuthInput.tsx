"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";

import { EyeIcon, EyeOffIcon } from "@/shared/ui/icons";

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  showPasswordToggle?: boolean;
};

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, showPasswordToggle = false, type = "text", ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;
  const withToggle = showPasswordToggle && isPassword;

  return (
    <label className="auth-input-field relative block w-full max-w-[508px]">
      <span className="sr-only">{label}</span>
      <input
        ref={ref}
        type={inputType}
        placeholder={label}
        className={`auth-input${withToggle ? " auth-input--with-toggle" : ""}`}
        {...props}
      />
      {withToggle ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
          className="absolute right-[12px] top-1/2 flex h-[19px] w-[19px] -translate-y-1/2 items-center justify-center text-[#3D3D3D]"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeIcon className="h-[19px] w-[19px]" /> : <EyeOffIcon className="h-[19px] w-[19px]" />}
        </button>
      ) : null}
    </label>
  );
});
