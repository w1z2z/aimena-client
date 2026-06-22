"use client";

import { useState } from "react";

import { SearchIcon } from "@/shared/ui/icons";

export function SearchBar() {
  const [value, setValue] = useState("");

  return (
    <div className="relative w-full max-w-[560px]">
      <SearchIcon className="pointer-events-none absolute left-[16px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#8E8BED]" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Что ищете?"
        className="h-[38px] w-full rounded-[12px] border border-[#CACACA] bg-white pl-[42px] pr-[14px] text-[14px] font-medium text-[#1A1A1A] outline-none transition focus:border-[#8E8BED] focus:ring-2 focus:ring-[#8E8BED]/20"
      />
    </div>
  );
}
