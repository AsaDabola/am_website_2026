import TenantLink from "@/components/layout/TenantLink";
import LogoMark from "./LogoMark";

export default function Logo({ dark = false }: { dark?: boolean }) {
  const textColor = dark ? "text-ink" : "text-white";
  return (
    <TenantLink href="/" className={`inline-flex ${textColor}`} aria-label="AM International home">
      <LogoMark className="h-[38px] w-auto" />
    </TenantLink>
  );
}
