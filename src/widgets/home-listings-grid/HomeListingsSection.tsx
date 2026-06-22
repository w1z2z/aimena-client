"use client";

import { useState } from "react";

import { HomeListingsGrid } from "./HomeListingsGrid";
import { HomeListingsPagination } from "./HomeListingsPagination";

export function HomeListingsSection() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <>
      <HomeListingsGrid page={currentPage} />
      <HomeListingsPagination currentPage={currentPage} onPageChange={setCurrentPage} />
    </>
  );
}
