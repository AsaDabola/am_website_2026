"use client";

import { useRowLabel } from "@payloadcms/ui";

/**
 * The name of the building on its collapsed row, instead of "Building 01".
 *
 * The campus tour is four rows that have to be told apart — an editor opening
 * the page to change what the chapel says should not have to open all four to
 * find it. Payload numbers array rows by default, which is right where order
 * is the only thing distinguishing them (a gallery, a list of logos) and wrong
 * here.
 */
export function BuildingRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string }>();
  const fallback = `Building ${String((rowNumber ?? 0) + 1).padStart(2, "0")}`;
  return <span>{data?.name || fallback}</span>;
}
