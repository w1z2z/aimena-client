"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";
import { getMyDealHistory } from "@/shared/api/deals";
import { ErrorBlock } from "@/shared/ui/ErrorBlock";

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
  all: "Пока нет обменов. Когда сделки появятся, история будет здесь.",
  successful: "Нет успешных обменов.",
  cancelled: "Нет отмененных обменов.",
};

export function ProfileDealsPanel() {
  const { user, accessToken } = useAuth();
  const [sort, setSort] = useState<ProfileSortOrder>("newest");
  const [typeFilter, setTypeFilter] = useState<ProfileDealTypeFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [sort, typeFilter]);

  const dealsQuery = useQuery({
    queryKey: ["profile-deals-me", user?.id, typeFilter, sort, page],
    queryFn: ({ signal }) =>
      getMyDealHistory(
        { page, pageSize: PROFILE_PAGE_SIZE, status: typeFilter, sort },
        signal,
      ),
    enabled: Boolean(user?.id && accessToken),
    placeholderData: (previous) => previous,
  });

  const deals = dealsQuery.data?.data ?? [];
  const total = dealsQuery.data?.meta.total ?? 0;
  const pageCount = dealsQuery.data?.meta.pageCount ?? getProfilePageCount(total);
  const countLabel = `${total} ${pluralRu(total, "обмен", "обмена", "обменов")}`;

  let body: ReactNode;
  if (!user) {
    body = null;
  } else if (dealsQuery.isLoading && deals.length === 0) {
    body = <p className="text-[16px] font-semibold text-[#626262]">Загрузка истории обменов…</p>;
  } else if (dealsQuery.isError && deals.length === 0) {
    body = (
      <ErrorBlock
        title="Не удалось загрузить историю обменов"
        onRetry={() => void dealsQuery.refetch()}
      />
    );
  } else if (deals.length === 0) {
    body = <p className="text-[16px] font-semibold text-[#626262]">{EMPTY_BY_TYPE[typeFilter]}</p>;
  } else {
    body = (
      <>
        <div className="flex flex-col gap-6">
          {deals.map((deal) => (
            <ProfileDealCard key={deal.id} deal={deal} showReviewAction />
          ))}
        </div>
        <ProfilePagination page={page} pageCount={pageCount} onChange={setPage} />
      </>
    );
  }

  return (
    <section className="profile-panel">
      <div className="profile-panel__header">
        <div className="profile-panel__heading">
          <h1 className="profile-panel__title">История обменов</h1>
          <p className="profile-panel__count">{countLabel}</p>
        </div>
        <div className="profile-panel__toolbar">
          <ProfileSortControl
            sort={sort}
            onSortChange={setSort}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            typeOptions={PROFILE_DEAL_TYPE_OPTIONS}
            dialogLabel="Сортировка истории обменов"
          />
        </div>
      </div>

      <div className="profile-panel__body profile-panel__body--plain">{body}</div>
    </section>
  );
}
