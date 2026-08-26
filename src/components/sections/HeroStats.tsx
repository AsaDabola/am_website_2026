"use client";

import { usePathname } from "@/i18n/navigation";
import { countryFromPath } from "@/lib/currentCountry";

/**
 * The founding year, head office and network reach under the hero headline.
 *
 * Only the main site shows them. They are facts about AM International — the
 * year it started sending, the city it sends from, the size of the worldwide
 * network — and on a country site they read as claims about that country,
 * which for most of them would be wrong.
 *
 * A client component reading the path, like the footer's organisation block:
 * the hero can render inside the layout above the point where the tenant route
 * records which country it is.
 */
export default function HeroStats({
  stats,
}: {
  stats: { value: string; label: string }[];
}) {
  if (countryFromPath(usePathname())) return null;

  return (
    <div className="mt-16 flex max-w-xl divide-x divide-white/30 border-t border-white/30 pt-6">
      {stats.map((stat) => (
        <div key={stat.label} className="px-6 first:ps-0">
          <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-white">
            {stat.value}
          </p>
          <p className="mt-1 text-[13px] text-on-dark">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
