"use client";

type ErrorBlockProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorBlock({
  title = "Не удалось загрузить данные",
  message = "Попробуйте обновить страницу чуть позже.",
  onRetry,
}: ErrorBlockProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#F3F2FF]">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" stroke="#8E8BED" strokeWidth="2" />
          <path d="M12 7v5" stroke="#8E8BED" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1.25" fill="#8E8BED" />
        </svg>
      </div>
      <h2 className="mt-5 text-[20px] font-bold leading-[1.2] text-[#1A1A1A]">{title}</h2>
      <p className="mt-2 max-w-[360px] text-[15px] leading-[1.5] text-[#626262]">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex h-[40px] items-center justify-center rounded-[36px] bg-[#8E8BED] px-7 text-[14px] font-semibold !text-white transition-colors hover:bg-[#7A77E0]"
        >
          Попробовать снова
        </button>
      ) : null}
    </div>
  );
}
