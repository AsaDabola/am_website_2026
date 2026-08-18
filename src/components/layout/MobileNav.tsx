"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";

type NavLink = { label: string; href: string };
type Dropdown = { label: string; links: NavLink[] };

export default function MobileNav({
  dropdowns,
  plainLinks,
  giveLabel,
  toggleNavLabel,
}: {
  dropdowns: Dropdown[];
  plainLinks: NavLink[];
  giveLabel: string;
  toggleNavLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label={toggleNavLabel}
        className="flex size-10 items-center justify-center rounded-md text-white lg:hidden"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-6">
          <path
            d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="border-t border-white/10 bg-brand-blue lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {dropdowns.map((item) => (
              <div key={item.label} className="py-2">
                <p className="px-1 text-sm font-semibold text-white">{item.label}</p>
                <ul className="mt-1 space-y-1">
                  {item.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="block rounded-md px-1 py-1.5 text-sm text-white/75 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {plainLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md px-1 py-2 text-sm font-medium text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/get-involved/donate"
              className="mt-2 inline-flex w-fit rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.04em] text-white"
            >
              {giveLabel}
            </Link>
          </Container>
        </div>
      )}
    </>
  );
}
