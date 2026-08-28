"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";

type SuggestedTenant = { country: string; continent: string; slug: string };

const DISMISS_KEY = "am-country-banner-dismissed";

export default function CountrySuggestionBanner() {
  const pathname = usePathname();
  const [tenant, setTenant] = useState<SuggestedTenant | null>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    fetch("/api/geo")
      .then((res) => res.json())
      .then((data: { tenant: SuggestedTenant | null }) => {
        if (data.tenant && !pathname.startsWith(`/${data.tenant.slug}`)) {
          setTenant(data.tenant);
        }
      })
      .catch(() => {});
    // Only ever check once per page load; navigating within the site
    // shouldn't keep re-triggering this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!tenant) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setTenant(null);
  }

  return (
    <div className="flex items-center justify-center gap-4 bg-brand-navy px-4 py-2.5 text-center text-sm text-white">
      <p>
        Looks like you&rsquo;re in {tenant.country}.{" "}
        <Link href={`/${tenant.slug}`} className="font-semibold underline underline-offset-2">
          Visit our {tenant.country} site
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-white/70 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
