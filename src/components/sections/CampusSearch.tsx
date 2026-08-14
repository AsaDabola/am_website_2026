"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { SearchIcon } from "@/components/ui/icons";

type Campus = { name: string; location: string };

export default function CampusSearch({
  campuses,
  searchPlaceholder,
  noMatchesLabel,
}: {
  campuses: Campus[];
  searchPlaceholder: string;
  noMatchesLabel: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return campuses;
    return campuses.filter(
      (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q),
    );
  }, [query, campuses]);

  return (
    <div>
      <label className="relative block">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-white/70" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-full border border-white/25 bg-white/10 py-4 pl-12 pr-5 text-sm text-white placeholder:text-white/60 backdrop-blur-sm focus:border-white/50 focus:outline-none"
        />
      </label>

      <ul className="mt-6 max-h-[416px] divide-y divide-white/15 overflow-y-auto rounded-xl border border-white/15 bg-white/5">
        {filtered.map((campus) => (
          <li key={campus.name}>
            <Link
              href="/network"
              className="flex items-center justify-between gap-4 px-6 py-4 text-sm hover:bg-white/10"
            >
              <span className="font-semibold text-white">{campus.name}</span>
              <span className="text-white/60">{campus.location}</span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-6 py-4 text-sm text-white/70">{noMatchesLabel}</li>
        )}
      </ul>
    </div>
  );
}
