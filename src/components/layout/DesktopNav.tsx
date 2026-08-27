"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";
import { ArrowRightIcon, ChevronDownIcon, NavIcon } from "@/components/ui/icons";
import type { NavLink, NavMenu } from "@/components/layout/navigation";

/** Picks the country-aware or plain link depending on where the target lives. */
function NavAnchor({
  href,
  tenantAware,
  className,
  children,
  onClick,
}: {
  href: string;
  tenantAware: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const Anchor = tenantAware ? TenantLink : Link;
  return (
    <Anchor href={href} className={className} onClick={onClick}>
      {children}
    </Anchor>
  );
}

/**
 * Moving between two menus should not look like one panel closing and another
 * opening. Long enough to read as deliberate, short enough not to feel slow.
 */
const GLIDE_MS = 320;

/**
 * A grace period before closing. Without it, the diagonal path from a trigger
 * down into the panel passes over the gap between them and dismisses the menu
 * halfway there.
 */
const CLOSE_DELAY_MS = 140;

export default function DesktopNav({
  menus,
  plainLinks,
}: {
  menus: NavMenu[];
  plainLinks: NavLink[];
}) {
  const [active, setActive] = useState<string | null>(null);
  /** Which way the incoming section travels, from the order of the triggers. */
  const [direction, setDirection] = useState(1);
  const [height, setHeight] = useState(0);

  const panes = useRef(new Map<string, HTMLDivElement>());
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const shut = useCallback(() => {
    setActive(null);
    setHeight(0);
  }, []);

  const close = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(shut, CLOSE_DELAY_MS);
  }, [cancelClose, shut]);

  /**
   * Everything the open panel needs is measured here, at the moment of the
   * interaction, rather than in an effect watching `active`. The panes are
   * kept `visibility: hidden` rather than `display: none` precisely so they
   * can be measured while shut, and doing it here means one render per
   * interaction instead of a second pass to correct the height.
   */
  const open = useCallback(
    (key: string) => {
      cancelClose();
      if (active === key) return;

      const from = active ? menus.findIndex((m) => m.key === active) : -1;
      const to = menus.findIndex((m) => m.key === key);
      // Opening from nothing has no direction to travel in; it just fades up.
      if (from !== -1) setDirection(to > from ? 1 : -1);

      const pane = panes.current.get(key);
      setHeight(pane?.offsetHeight ?? 0);

      setActive(key);
    },
    [active, cancelClose, menus],
  );

  // A section's own height can change under it — a font finishing loading, the
  // window narrowing and rewrapping a description.
  useEffect(() => {
    if (!active || typeof ResizeObserver === "undefined") return;
    const pane = panes.current.get(active);
    if (!pane) return;
    const observer = new ResizeObserver(() => setHeight(pane.offsetHeight));
    observer.observe(pane);
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelClose();
        shut();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, cancelClose, shut]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  return (
    <>
      <nav
        className="hidden items-center gap-1 lg:flex"
        onMouseLeave={close}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
        }}
      >
        <div className="flex items-center gap-1">
          {menus.map((menu) => {
            const isOpen = active === menu.key;
            return (
              <button
                key={menu.key}
                type="button"
                aria-expanded={isOpen}
                onMouseEnter={() => open(menu.key)}
                onFocus={() => open(menu.key)}
                onClick={() => (isOpen ? shut() : open(menu.key))}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isOpen ? "text-white" : "text-white/85 hover:text-white"
                }`}
              >
                {menu.label}
                <ChevronDownIcon
                  className={`size-2.5 text-white/80 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            );
          })}

          {plainLinks.map((link) => (
            <NavAnchor
              key={link.href}
              href={link.href}
              tenantAware={link.tenantAware}
              className="px-4 py-2.5 text-sm font-medium text-white/85 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </NavAnchor>
          ))}
        </div>
      </nav>

      {/*
        One panel for every menu, not one panel each. Its height animates to
        whichever section is showing and the sections cross-fade through each
        other, which is what makes moving along the nav read as the same box
        gliding rather than two boxes swapping.

        Deliberately not `relative` — the header above is the containing block,
        which is what lets this span the viewport instead of the content column.
      */}
      <div
        className="absolute inset-x-0 top-full hidden overflow-hidden border-t border-black/5 bg-white shadow-[0_18px_40px_-12px_rgba(5,10,46,0.25)] transition-[height,opacity] ease-out motion-reduce:transition-none lg:block"
        style={{
          height,
          opacity: active ? 1 : 0,
          // Visibility rather than display, so the panes keep a measurable
          // height while the panel is shut.
          visibility: active ? "visible" : "hidden",
          pointerEvents: active ? "auto" : "none",
          transitionDuration: `${GLIDE_MS}ms`,
        }}
        onMouseEnter={cancelClose}
        onMouseLeave={close}
      >
        {menus.map((menu) => {
          const isOpen = active === menu.key;
          return (
            <div
              key={menu.key}
              ref={(el) => {
                if (el) panes.current.set(menu.key, el);
                else panes.current.delete(menu.key);
              }}
              aria-hidden={!isOpen}
              className="absolute inset-x-0 top-0 transition-[opacity,transform] ease-out motion-reduce:transition-none"
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? "translateX(0)" : `translateX(${direction * 28}px)`,
                pointerEvents: isOpen ? "auto" : "none",
                transitionDuration: `${GLIDE_MS}ms`,
              }}
            >
              <Container className="py-10">
                <NavAnchor
                  href={menu.href}
                  tenantAware={menu.tenantAware}
                  onClick={shut}
                  className="group/all inline-flex items-center gap-2 border-b-2 border-brand-blue pb-1.5 font-display text-lg font-bold text-brand-blue"
                >
                  {menu.label}
                  <ArrowRightIcon className="size-4 transition-transform group-hover/all:translate-x-1" />
                </NavAnchor>

                <div className="mt-9 grid gap-x-10 gap-y-10 lg:grid-cols-3">
                  {menu.groups.map((group) => (
                    <div key={group.key} className="flex gap-4">
                      <NavIcon name={group.icon} className="mt-0.5 size-6 shrink-0 text-brand-blue" />
                      <div className="min-w-0">
                        <NavAnchor
                          href={group.href}
                          tenantAware={group.tenantAware}
                          onClick={shut}
                          className="font-display text-lg font-bold text-ink transition-colors hover:text-brand-blue"
                        >
                          {group.label}
                        </NavAnchor>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                          {group.description}
                        </p>

                        {group.links.length > 0 && (
                          <ul className="mt-4 space-y-0.5">
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <NavAnchor
                                  href={link.href}
                                  tenantAware={link.tenantAware}
                                  onClick={shut}
                                  className="-mx-3 block rounded-lg px-3 py-2 text-sm text-ink transition-colors duration-200 hover:bg-brand-blue/[0.07] hover:text-brand-blue"
                                >
                                  {link.label}
                                </NavAnchor>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Container>
            </div>
          );
        })}
      </div>
    </>
  );
}
