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

  return (
    <label className="relative block w-full">
      <span className="sr-only">{label}</span>
      <input
        ref={ref}
        type={inputType}
        placeholder={label}
        className="h-[48px] w-full rounded-[10px] border border-[#3D3D3D] border-[0.5px] bg-white px-[12px] py-[8px] text-[16px] font-bold leading-[20px] tracking-[0.016px] text-[#1A1A1A] placeholder:text-[#3D3D3D] outline-none transition focus:border-[#8E8BED]"
        {...props}
      />
      {showPasswordToggle && isPassword ? (
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
