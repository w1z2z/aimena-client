"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Legacy URL — reviews live in the sidebar now. */
export default function PublicProfileReviewsRedirectPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";

  useEffect(() => {
    if (slug) router.replace(`/users/${slug}`);
  }, [router, slug]);

  return null;
}
