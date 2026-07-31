/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";

import type { ApiListingOwner } from "@/shared/api/listings";
import { BoltIcon } from "@/shared/ui/icons";
import { formatProfileNumber, PROFILE_ASSETS } from "@/widgets/profile/constants";

type ListingOwnerCardProps = {
  owner: ApiListingOwner;
};

export function ListingOwnerCard({ owner }: ListingOwnerCardProps) {
  const avatarInitial = owner.displayName.trim().charAt(0).toUpperCase() || "U";
  const ratingDisplay =
    owner.ratingAvg >= 100
      ? formatProfileNumber(Math.round(owner.ratingAvg))
      : owner.ratingAvg > 0
        ? owner.ratingAvg.toFixed(1).replace(".", ",")
        : formatProfileNumber(owner.swapsCount);

  return (
    <Link href={`/users/${owner.slug}`} className="listing-detail-owner">
      <div className="listing-detail-owner__avatar">
        {owner.avatarUrl ? (
          <img src={owner.avatarUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="listing-detail-owner__avatar-fallback">{avatarInitial}</span>
        )}
      </div>

      <div className="listing-detail-owner__meta">
        <div className="listing-detail-owner__name-row">
          <p className="listing-detail-owner__name">{owner.displayName}</p>
          {owner.verified ? (
            <img src={PROFILE_ASSETS.verified} alt="" className="size-[14px] shrink-0" />
          ) : null}
        </div>
        <div className="listing-detail-owner__rating">
          <BoltIcon className="h-[11px] w-[8px] rotate-[15deg] text-white" />
          <span>{ratingDisplay}</span>
        </div>
      </div>
    </Link>
  );
}
