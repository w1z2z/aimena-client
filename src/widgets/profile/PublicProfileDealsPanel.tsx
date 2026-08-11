"use client";

import { useEffect, useMemo, useState } from "react";

import { pluralRu } from "./constants";
import { ProfileDealCard } from "./ProfileDealCard";
import {
  getProfilePageCount,
  PROFILE_PAGE_SIZE,
  ProfilePagination,
} from "./ProfilePagination";
import {
  ProfileSortControl,
  PROFILE_DEAL_TYPE_OPTIONS,
  type ProfileDealTypeFilter,
  type ProfileSortOrder,
} from "./ProfileSortControl";
import { filterMockDeals, MOCK_DEALS, paginateItems } from "./mocks";

const EMPTY_BY_TYPE: Record<ProfileDealTypeFilter, string> = {
  all: "Пока нет обменов.",
  successful: "Нет успешных обменов.",
  in_progress: "Нет обменов в процессе.",
  cancelled: "Нет отмененных обменов.",
};

export function PublicProfileDealsPanel() {
  const [sort, setSort] = useState<ProfileSortOrder>("newest");
  const [typeFilter, setTypeFilter] = useState<ProfileDealTypeFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [sort, typeFilter]);

  const filteredDeals = useMemo(
    () => filterMockDeals(MOCK_DEALS, typeFilter, sort),
    [sort, typeFilter],
  );
  const total = filteredDeals.length;
  const pageCount = getProfilePageCount(total);
  const deals = paginateItems(filteredDeals, page, PROFILE_PAGE_SIZE);
  const countLabel = `${total} ${pluralRu(total, "обмен", "обмена", "обменов")}`;

  return (
    <section className="flex w-full flex-col">
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
          <>
            <div className="flex flex-col gap-6">
              {deals.map((deal) => (
                <ProfileDealCard key={deal.id} deal={deal} showReviewAction={false} />
              ))}
            </div>
            <ProfilePagination page={page} pageCount={pageCount} onChange={setPage} />
          </>
        )}
      </div>
    </section>
  );
}
