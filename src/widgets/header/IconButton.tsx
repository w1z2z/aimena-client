type IconButtonProps = {
  children: React.ReactNode;
  label: string;
};

export function IconButton({ children, label }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#8E8BED] border-[0.3px] bg-[#D9D9D9] transition hover:bg-[#d3d3d3] active:translate-y-[0.5px]"
    >
      {children}
    </button>
  );
}
