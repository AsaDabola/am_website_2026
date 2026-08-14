"use client";

import { useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/icons";

// PLACEHOLDER campus list — replace with AM's real chapter directory.
const campuses = [
  { name: "AM Harvard", location: "Cambridge, Massachusetts" },
  { name: "AM @ UCLA", location: "Los Angeles, California" },
  { name: "AM Rutgers", location: "New Brunswick, New Jersey" },
  { name: "AM Columbia", location: "New York, New York" },
  { name: "AM NYU", location: "New York, New York" },
  { name: "AM Princeton", location: "Princeton, New Jersey" },
  { name: "AM Berkeley", location: "Berkeley, California" },
  { name: "AM Michigan", location: "Ann Arbor, Michigan" },
  { name: "AM Illinois", location: "Champaign, Illinois" },
  { name: "AM Texas", location: "Austin, Texas" },
  { name: "AM Georgia Tech", location: "Atlanta, Georgia" },
  { name: "AM Washington", location: "Seattle, Washington" },
];

export default function OurNetwork() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return campuses;
    return campuses.filter(
      (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <section
      className="py-24"
      style={{ backgroundImage: "linear-gradient(120deg, #1449c6, #007aff)" }}
    >
      <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="lg:pt-2">
          <Eyebrow tone="light">Our network</Eyebrow>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
            There may already be a fellowship on your campus.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/75">
            Search by school or city. If nothing comes up near you, that is
            an invitation &mdash; we will help you start one.
          </p>
          <Button href="/get-involved/chapter-affiliation" variant="outlineLight" className="mt-9">
            Start a chapter
          </Button>
        </div>

        <div>
          <label className="relative block">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-white/70" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search school or city"
              className="w-full rounded-full border border-white/25 bg-white/10 py-4 pl-12 pr-5 text-sm text-white placeholder:text-white/60 backdrop-blur-sm focus:border-white/50 focus:outline-none"
            />
          </label>

          <ul className="mt-6 max-h-[416px] divide-y divide-white/15 overflow-y-auto rounded-xl border border-white/15 bg-white/5">
            {filtered.map((campus) => (
              <li key={campus.name}>
                <a
                  href="/network"
                  className="flex items-center justify-between gap-4 px-6 py-4 text-sm hover:bg-white/10"
                >
                  <span className="font-semibold text-white">{campus.name}</span>
                  <span className="text-white/60">{campus.location}</span>
                </a>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-6 py-4 text-sm text-white/70">
                No matches yet &mdash; reach out and we&rsquo;ll help you start one.
              </li>
            )}
          </ul>
        </div>
      </Container>
    </section>
  );
}
