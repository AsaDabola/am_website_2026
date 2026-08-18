import { ReactNode } from "react";
import TenantLink from "@/components/layout/TenantLink";
import { ArrowRightIcon } from "./icons";

type Variant = "solid" | "solidNavy" | "outlineLight" | "outlineBlue" | "ghostLight" | "ghostDark";

const variantClasses: Record<Variant, string> = {
  solid: "bg-brand-blue text-white hover:bg-brand-navy",
  solidNavy: "bg-brand-navy text-white hover:bg-brand-blue",
  outlineLight:
    "border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
  outlineBlue: "border border-brand-blue/40 text-brand-blue hover:bg-brand-blue/5",
  ghostLight: "text-white/90 hover:text-white",
  ghostDark: "text-brand-blue hover:text-brand-navy",
};

export default function Button({
  href,
  children,
  variant = "solid",
  icon = true,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  icon?: boolean;
  className?: string;
}) {
  const isGhost = variant === "ghostLight" || variant === "ghostDark";

  if (isGhost) {
    return (
      <TenantLink
        href={href}
        className={`inline-flex items-center gap-2 text-sm font-semibold ${variantClasses[variant]} ${className}`}
      >
        {children}
        {icon && <ArrowRightIcon />}
      </TenantLink>
    );
  }

  return (
    <TenantLink
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-[0.04em] transition-colors ${variantClasses[variant]} ${className}`}
    >
      {children}
      {icon && <ArrowRightIcon />}
    </TenantLink>
  );
}
