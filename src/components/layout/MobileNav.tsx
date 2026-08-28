"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import TenantLink from "@/components/layout/TenantLink";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  CloseIcon,
  NavIcon,
} from "@/components/ui/icons";
// Type-only, so the server-side navigation module is never pulled into the
// client bundle.
import type { NavLink, NavMenu } from "@/components/layout/navigation";
import { useSiteLinks } from "@/components/layout/useSiteLinks";

function MobileAnchor({
  link,
  className,
  onClick,
  children,
}: {
  link: { href: string; tenantAware: boolean };
  className?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const Anchor = link.tenantAware ? TenantLink : Link;
  return (
    <Anchor href={link.href} className={className} onClick={onClick}>
      {children}
    </Anchor>
  );
}

/**
 * Full-screen mobile menu with one level of drill-down: the root lists the
 * top-level sections, and tapping one pushes that section's groups into view
 * with a back arrow, rather than expanding everything inline at once.
 */
export default function MobileNav({
  menus,
  plainLinks,
  giveLabel,
  toggleNavLabel,
  backLabel,
  closeLabel,
}: {
  menus: NavMenu[];
  plainLinks: NavLink[];
  giveLabel: string;
  toggleNavLabel: string;
  backLabel: string;
  closeLabel: string;
}) {
  const links = useSiteLinks(plainLinks);
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const active = menus.find((menu) => menu.key === activeKey) ?? null;

  function close() {
    setOpen(false);
    setActiveKey(null);
  }

  // Keep the page behind the overlay from scrolling, and let Escape back out.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // The header sets `backdrop-blur`, and a backdrop-filter makes an element a
  // containing block for fixed-position descendants — so the overlay has to be
  // portalled to <body>, or `fixed inset-0` would resolve against the 77px
  // header instead of the viewport.
  const overlay = (
    <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
      <div className="flex h-[77px] shrink-0 items-center justify-between border-b border-black/10 px-6">
        {active ? (
          <button
            onClick={() => setActiveKey(null)}
            aria-label={backLabel}
            className="flex size-10 items-center justify-center rounded-full text-ink"
          >
            <ArrowLeftIcon className="size-5" />
          </button>
        ) : (
          <span className="size-10" aria-hidden />
        )}

        <button
          onClick={close}
          aria-label={closeLabel}
          className="flex size-10 items-center justify-center rounded-full border border-brand-blue text-brand-blue"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        {active ? (
          <div className="py-6">
            <MobileAnchor
              link={active}
              onClick={close}
              className="inline-flex items-center gap-2 border-b-2 border-brand-blue pb-1.5 font-display text-2xl font-bold text-brand-blue"
            >
              {active.label}
              <ArrowRightIcon className="size-5" />
            </MobileAnchor>

            <div className="mt-8 space-y-8">
              {active.groups.map((group) => (
                <div key={group.key} className="flex gap-4">
                  <NavIcon
                    name={group.icon}
                    className="mt-0.5 size-6 shrink-0 text-brand-blue"
                  />
                  <div className="min-w-0">
                    <MobileAnchor
                      link={group}
                      onClick={close}
                      className="font-display text-lg font-bold text-ink"
                    >
                      {group.label}
                    </MobileAnchor>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                      {group.description}
                    </p>

                    {group.links.length > 0 && (
                      <ul className="mt-3 space-y-0.5">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <MobileAnchor
                              link={link}
                              onClick={close}
                              className="-mx-3 block rounded-lg px-3 py-2.5 text-sm text-ink"
                            >
                              {link.label}
                            </MobileAnchor>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-black/[0.08]">
            {menus.map((menu) => (
              <li key={menu.key}>
                <button
                  onClick={() => setActiveKey(menu.key)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-start"
                >
                  <span className="font-display text-2xl font-bold text-ink">
                    {menu.label}
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-ink">
                    <ChevronRightIcon className="size-4" />
                  </span>
                </button>
              </li>
            ))}

            {links.map((link) => (
              <li key={link.href}>
                <MobileAnchor
                  link={link}
                  onClick={close}
                  className="flex items-center justify-between gap-4 py-5"
                >
                  <span className="font-display text-2xl font-bold text-ink">
                    {link.label}
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-ink">
                    <ArrowRightIcon className="size-4" />
                  </span>
                </MobileAnchor>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-black/10 p-4">
        <TenantLink
          href="/get-involved/donate"
          onClick={close}
          className="block rounded-full bg-brand-blue py-4 text-center text-sm font-semibold uppercase tracking-[0.04em] text-white"
        >
          {giveLabel}
        </TenantLink>
      </div>
    </div>
  );

  return (
    <>
      <button
        aria-label={toggleNavLabel}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-md text-white lg:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-6">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && createPortal(overlay, document.body)}
    </>
  );
}
