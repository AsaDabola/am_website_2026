import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PullQuote from "@/components/about/PullQuote";
import MembershipApplicationForm from "@/components/about/MembershipApplicationForm";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Membership | AM International",
  description: "What it means to belong to the AM network as a chapter or an individual.",
};

const tiers = [
  {
    label: "Newcomer",
    description: "Joins our bible programs, group activities and others.",
    from: "#14b8a6",
    to: "#0f3d3a",
  },
  {
    label: "Registered",
    description: "Joins consistent activities and shares Statement of Faith.",
    from: "#2a5eec",
    to: "#0d1f52",
  },
  {
    label: "Volunteer",
    description: "Actively serves God through ministry activities.",
    from: "#4d8df6",
    to: "#153a7a",
  },
  {
    label: "Staff",
    description: "Passionately seeking God's calling for ministry vocation.",
    from: "#1449c6",
    to: "#0a1a4d",
  },
  {
    label: "Leader",
    description: "Participating in serving leadership.",
    from: "#0a0e26",
    to: "#050a2e",
  },
];

export default async function MembershipPage() {
  const [t, tCommon] = await Promise.all([
    getTranslations("AboutPage"),
    getTranslations("Common"),
  ]);

  return (
    <>
      <AboutHero
        crumbs={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Membership" }]}
        title="Membership"
        subtitle="What it means to belong to the AM network as a chapter or an individual."
        backgroundImage="/images/membership-hero.jpg"
        size="large"
        titleVariant="ghost"
      >
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {tiers.map((tier) => (
            <div
              key={tier.label}
              className="rounded-lg px-4 py-3"
              style={{ backgroundImage: `linear-gradient(160deg, ${tier.from}, ${tier.to})` }}
            >
              <p className="font-display text-xs font-bold uppercase tracking-[0.08em] text-white">
                {tier.label}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-white/75">{tier.description}</p>
            </div>
          ))}
        </div>
      </AboutHero>
      <AboutSubNav active="/about/membership" />

      <article className="bg-white py-20">
        <Container className="max-w-[720px]">
          <p className="text-base leading-relaxed text-ink-muted">
            Qualifications for membership includes being over the age of 18 and regularly
            attending Bible programs for at least one month at your local AM chapter. Membership
            is open primarily to current students of the university, but also to university
            alumni, faculty, and staff. Becoming a member indicates that you share and agree with
            the AM Statement of Faith and Mission Statement. A member is also one who wishes to
            uphold the values of the Christian faith in their lives and support the work of
            God&rsquo;s Kingdom here on earth. Current students must be registered to their
            university chapter by filling out the application and having it signed by their
            chapter leader. AM members benefit from full access to the AM resources and
            facilities. They can also join AM leadership meetings, conventions, and retreats.
            Members of AM are recommended to give a monthly offering to their chapters. The
            amount of the offering is of their choice. 100% of the donations go towards
            supporting the local chapter&rsquo;s operations and activities.
          </p>

          <div className="my-10">
            <PullQuote>
              John 20:21 says, &ldquo;Again Jesus said, &lsquo;Peace be with you! As the Father
              has sent me, I am sending you.&rsquo;&rdquo; (NIV)
            </PullQuote>
          </div>
        </Container>
      </article>

      <section className="bg-mist py-20">
        <Container className="max-w-[800px]">
          <MembershipApplicationForm />
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container className="max-w-[720px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              href="/about/statement-of-faith"
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <Image
                src="/images/about-statement-faith-card.jpg"
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute left-6 top-6 font-display text-lg font-bold text-white">
                {t("cardStatementOfFaithTitle")}
              </span>
              <span className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] text-white">
                {tCommon("learnMore")}
                <ArrowRightIcon />
              </span>
            </Link>
            <Link
              href="/about/mission"
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <Image
                src="/images/about-mission-card.jpg"
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute left-6 top-6 font-display text-lg font-bold text-white">
                {t("cardMissionStatementTitle")}
              </span>
              <span className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] text-white">
                {tCommon("learnMore")}
                <ArrowRightIcon />
              </span>
            </Link>
          </div>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
