import { Link } from "@/i18n/navigation";

export default function Logo({
  dark = false,
  internationalLabel = "International",
}: {
  dark?: boolean;
  internationalLabel?: string;
}) {
  const textColor = dark ? "text-ink" : "text-white";
  return (
    <Link href="/" className="inline-flex flex-col leading-none" aria-label="AM International home">
      <span className={`font-display text-[28px] font-extrabold italic tracking-tight ${textColor}`}>
        AM
      </span>
      <span className={`text-[9px] font-semibold uppercase tracking-[0.3em] ${textColor} opacity-90`}>
        {internationalLabel}
      </span>
    </Link>
  );
}
