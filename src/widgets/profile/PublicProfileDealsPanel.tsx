"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getUserDealHistory } from "@/shared/api/deals";

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

const EMPTY_BY_TYPE: Record<ProfileDealTypeFilter, string> = {
  all: "Пока нет обменов.",
  successful: "Нет успешных обменов.",
  cancelled: "Нет отмененных обменов.",
};

export function PublicProfileDealsPanel() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [sort, setSort] = useState<ProfileSortOrder>("newest");
  const [typeFilter, setTypeFilter] = useState<ProfileDealTypeFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [sort, typeFilter, slug]);

  const dealsQuery = useQuery({
    queryKey: ["public-profile-deals", slug, typeFilter, sort, page],
    queryFn: ({ signal }) =>
      getUserDealHistory(
        slug,
        { page, pageSize: PROFILE_PAGE_SIZE, status: typeFilter, sort },
        signal,
      ),
    enabled: Boolean(slug),
    placeholderData: (previous) => previous,
  });

  const deals = dealsQuery.data?.data ?? [];
  const total = dealsQuery.data?.meta.total ?? 0;
  const pageCount = dealsQuery.data?.meta.pageCount ?? getProfilePageCount(total);
  const countLabel = `${total} ${pluralRu(total, "обмен", "обмена", "обменов")}`;

  let body: ReactNode;
  if (dealsQuery.isLoading && deals.length === 0) {
    body = <p className="text-[16px] font-semibold text-[#626262]">Загрузка истории обменов…</p>;
  } else if (dealsQuery.isError && deals.length === 0) {
    body = (
      <p className="text-[16px] font-semibold text-[#FF2056]">Не удалось загрузить историю обменов.</p>
    );
  } else if (deals.length === 0) {
    body = <p className="text-[16px] font-semibold text-[#626262]">{EMPTY_BY_TYPE[typeFilter]}</p>;
  } else {
    body = (
      <>
        <div className="flex flex-col gap-6">
          {deals.map((deal) => (
            <ProfileDealCard
              key={deal.id}
              deal={deal}
              showReviewAction={false}
              showChatAction={false}
            />
          ))}
        </div>
        <ProfilePagination page={page} pageCount={pageCount} onChange={setPage} />
      </>
    );
  }

  return (
    <section className="flex w-[1074px] max-w-full shrink-0 flex-col">
      <div className="flex flex-col gap-3">
        <h1 className="text-[40px] font-bold leading-10 tracking-[-0.5px] text-[#1A1A1A]">
          История обменов
        </h1>
        <p className="text-[14px] font-normal leading-[1.7] text-[#3D3D3D]">{countLabel}</p>
      </div>

      <div className="relative mt-12 w-full overflow-visible">
        <div className="absolute bottom-full right-0 z-30 mb-12 flex items-center overflow-visible">
          <ProfileSortControl
            sort={sort}
            onSortChange={setSort}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            typeOptions={PROFILE_DEAL_TYPE_OPTIONS}
            dialogLabel="Сортировка истории обменов"
          />
        </div>
        {body}
      </div>
    </section>
  );
}
