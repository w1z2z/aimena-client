/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";

import type { ApiListingOwner } from "@/shared/api/listings";
import { RatingStarIcon } from "@/shared/ui/icons";
import { formatRatingPoints, PROFILE_ASSETS } from "@/widgets/profile/constants";

type ListingOwnerCardProps = {
  owner: ApiListingOwner;
};

export function ListingOwnerCard({ owner }: ListingOwnerCardProps) {
  const avatarInitial = owner.displayName.trim().charAt(0).toUpperCase() || "U";
  const ratingDisplay = formatRatingPoints(owner.ratingAvg);

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
          <RatingStarIcon className="size-[13px]" />
          <span>{ratingDisplay}</span>
        </div>
      </div>
    </Link>
  );
}
