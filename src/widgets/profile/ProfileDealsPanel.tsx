"use client";

import { useMemo, useState } from "react";

import { pluralRu } from "./constants";
import { ProfileDealCard } from "./ProfileDealCard";
import {
  ProfileSortControl,
  PROFILE_DEAL_TYPE_OPTIONS,
  type ProfileDealTypeFilter,
  type ProfileSortOrder,
} from "./ProfileSortControl";
import { filterMockDeals, MOCK_DEALS } from "./mocks";

const EMPTY_BY_TYPE: Record<ProfileDealTypeFilter, string> = {
  all: "Пока нет обменов. Когда сделки появятся, история будет здесь.",
  successful: "Нет успешных обменов.",
  in_progress: "Нет обменов в процессе.",
  cancelled: "Нет отмененных обменов.",
};

export function ProfileDealsPanel() {
  const [sort, setSort] = useState<ProfileSortOrder>("newest");
  const [typeFilter, setTypeFilter] = useState<ProfileDealTypeFilter>("all");

  const deals = useMemo(
    () => filterMockDeals(MOCK_DEALS, typeFilter, sort),
    [sort, typeFilter],
  );
  const total = deals.length;
  const countLabel = `${total} ${pluralRu(total, "обмен", "обмена", "обменов")}`;

  return (
    <section className="flex w-[1074px] shrink-0 flex-col">
      <div className="flex flex-col gap-3">
        <h1 className="text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
          История обменов
        </h1>
        <p className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">{countLabel}</p>
      </div>

      <div className="relative mt-12 w-full overflow-visible">
        <div className="absolute bottom-full right-0 z-30 mb-2 flex items-center overflow-visible">
          <ProfileSortControl
            sort={sort}
            onSortChange={setSort}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            typeOptions={PROFILE_DEAL_TYPE_OPTIONS}
            dialogLabel="Сортировка истории обменов"
          />
        </div>

        {deals.length === 0 ? (
          <p className="text-[16px] font-semibold text-[#626262]">{EMPTY_BY_TYPE[typeFilter]}</p>
        ) : (
          <div className="flex flex-col gap-6">
            {deals.map((deal) => (
              <ProfileDealCard key={deal.id} deal={deal} showReviewAction />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
