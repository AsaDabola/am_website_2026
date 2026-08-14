import Link from "next/link";

export default function Logo({ dark = false }: { dark?: boolean }) {
  const textColor = dark ? "text-ink" : "text-white";
  return (
    <Link href="/" className="inline-flex flex-col leading-none" aria-label="AM International home">
      <span className={`font-display text-[28px] font-extrabold italic tracking-tight ${textColor}`}>
        AM
      </span>
      <span className={`text-[9px] font-semibold uppercase tracking-[0.3em] ${textColor} opacity-90`}>
        International
      </span>
    </Link>
  );
}
