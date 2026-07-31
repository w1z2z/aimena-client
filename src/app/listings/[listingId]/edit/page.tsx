"use client";

import { useParams } from "next/navigation";

import { ListingEditor } from "@/app/create-listing/ListingEditor";

export default function EditListingPage() {
  const params = useParams<{ listingId: string }>();
  const listingId = typeof params.listingId === "string" ? params.listingId : "";

  return <ListingEditor mode="edit" listingId={listingId} />;
}
