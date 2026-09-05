import type { Metadata } from "next";
import SiteImage from "@/components/ui/SiteImage";
import { getTranslations } from "@/i18n/content";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PullQuote from "@/components/about/PullQuote";
import MembershipApplicationForm from "@/components/about/MembershipApplicationForm";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import withPageLayout from "@/components/pages/BuiltInPage";

// Sixty seconds, so a section added to this page in /admin appears without a
// deploy. Without it the page is fully static and the authored layout would be
// whatever it was at build time — see components/pages/BuiltInPage.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Membership | AM International",
  description: "What it means to belong to the AM network as a chapter or an individual.",
};

/**
 * The five membership tiers, as the design draws them: a solid colour band
 * carrying the name over a darker body carrying the description, rather than
 * the single gradient block these were before. Each tier gets its own trio of
 * hexes — they run from teal at Newcomer to near-black navy at Leader, so the
 * row reads as a progression — and none of them sit in the token palette,
 * which is why they are written out here.
 */
const tiers = [
  {
    label: "Newcomer",
    description: "Joins our bible programs, group activities and others",
    header: "#2abfbf",
    body: "#1a4040",
    text: "#e0f7f7",
  },
  {
    label: "Registered",
    description: "Joins consistent activities and shares Statement of Faith",
    header: "#3b82f6",
    body: "#1a2a4a",
    text: "#dbeafe",
  },
  {
    label: "Volunteer",
    description: "Actively serves God through ministry activities.",
    header: "#4b7aae",
    body: "#1a2535",
    text: "#d1e4f5",
  },
  {
    label: "Staff",
    description: "Passionately seeking God's calling for ministry vocation.",
    header: "#1e3a5f",
    body: "#0f1f35",
    text: "#c8d8ec",
  },
  {
    label: "Leader",
    description: "Participating in serving leadership",
    header: "#052652",
    body: "#0f1f35",
    text: "#c8d8ec",
  },
];

/**
 * The bulleted runs under "applicants must:", "means that you:" and "members
 * receive:". Plain discs at the design's 16px/1.65, with the marker muted so
 * the bullet does not compete with the text.
 */
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc ps-6 marker:text-ink-muted">
      {items.map((item) => (
        <li key={item.slice(0, 48)}>{item}</li>
      ))}
    </ul>
  );
}

async function MembershipPage() {
  const [t, tCommon] = await Promise.all([
    getTranslations("AboutPage"),
    getTranslations("Common"),
  ]);

  return (
    <>
      {/* No breadcrumb and no standfirst: the design gives this hero the same
          treatment as Who-we-are — the full 964px of the photograph, the page
          name in outline over it, and nothing else but the tier row. The
          section tabs immediately below do the wayfinding the breadcrumb was
          doing. The photograph here is the one the design was drawn over, but
          its lawn is bright all the way down where Who-we-are's rock is dark,
          so it takes the deeper wash — the design darkens the bottom of this
          frame hard, and without it the outlined title all but vanishes into
          the grass. */}
      <AboutHero
        title="Membership"
        backgroundImage="/images/membership-hero.webp"
        size="tall"
        wash="deep"
        titleVariant="ghost"
        titleCase="sentence"
      >
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {tiers.map((tier) => (
            <div key={tier.label} className="flex flex-col overflow-hidden rounded-lg">
              <div className="p-5 text-center" style={{ backgroundColor: tier.header }}>
                {/* Inter ExtraBold in the design, not the display face. */}
                <p className="text-xl font-extrabold uppercase text-white">{tier.label}</p>
              </div>
              <div
                className="flex-1 px-5 py-6 text-center"
                style={{ backgroundColor: tier.body }}
              >
                <p className="text-sm leading-[1.6]" style={{ color: tier.text }}>
                  {tier.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AboutHero>
      <AboutSubNav active="/about/membership" />

      {/* Unlike Mission statement and Statement of faith, this design does not
          pull the prose into the 720px measure — it runs the full content
          column, and sets its headings as bold body text rather than the 28px
          display heading those pages use. Broken out of the single block
          paragraph this page carried before, which ran the eligibility rules,
          the benefits and the offering together into one wall. */}
      <article className="bg-white py-20">
        <Container>
          <div className="text-base leading-[1.65] text-ink">
            <h2 className="font-bold">AM Membership Qualifications &amp; Benefits</h2>

            <h3 className="mt-6 font-bold">Eligibility</h3>
            <p>To become an AM member, applicants must:</p>
            <Bullets
              items={[
                "Be 18 years of age or older.",
                "Regularly attend Bible programs at their local AM chapter for at least one month.",
                "Primarily be a current university student, while university alumni, faculty, and staff are also welcome to apply.",
              ]}
            />

            <p className="mt-6 font-bold">Becoming an AM member means that you:</p>
            <Bullets
              items={[
                "Agree with and affirm the AM Statement of Faith and Mission Statement.",
                "Desire to uphold the values of the Christian faith in your daily life.",
                "Desire to support and participate in the work of God’s Kingdom on earth.",
                "Seek to grow spiritually through fellowship, Bible study, service, and participation in AM activities.",
              ]}
            />

            {/* The design leaves this one heading unbolded and prefixed with
                ***, which is the designer marking it to be set like the three
                around it rather than copy to render. */}
            <h3 className="mt-6 font-bold">University Chapter Registration</h3>
            <p>
              Current university students must be registered with their respective AM university
              chapter. Registration requires completing the membership application and obtaining
              the signature of the local chapter leader.
            </p>

            <h3 className="mt-6 font-bold">Membership Benefits</h3>
            <p>AM members receive:</p>
            <Bullets
              items={[
                "Full access to AM resources and facilities.",
                "Opportunities to participate in AM leadership meetings.",
                "Invitations to AM conventions, retreats, and other special events.",
                "Opportunities to serve and participate more actively in the mission and ministry of their local chapter.",
              ]}
            />

            <h3 className="mt-6 font-bold">Monthly Offering</h3>
            <p>
              AM members are encouraged to give a monthly offering to their local chapter as an
              expression of support for its ministry and activities. The amount is entirely
              voluntary and determined by each member.
            </p>
            <p>
              100% of offerings and donations are used to support the operations, ministry, and
              activities of the local AM chapter.
            </p>
          </div>

          <div className="mt-10">
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
        <Container>
          <div className="grid gap-6 lg:grid-cols-[802fr_448fr]">
            <TenantLink
              href="/about/statement-of-faith"
              className="group relative block h-[320px] overflow-hidden rounded-2xl lg:h-[400px]"
            >
              <SiteImage
                src="/images/about-statement-faith-card.webp"
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-[#0d328a]/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <span className="absolute start-6 top-6 font-display text-lg font-bold text-white">
                {t("cardStatementOfFaithTitle")}
              </span>
              <span className="absolute bottom-6 start-6 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] text-white">
                {tCommon("learnMore")}
                <ArrowRightIcon />
              </span>
            </TenantLink>
            <TenantLink
              href="/about/mission"
              className="group relative block h-[320px] overflow-hidden rounded-2xl lg:h-[400px]"
            >
              <SiteImage
                src="/images/about-mission-card.webp"
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-[#0d328a]/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <span className="absolute start-6 top-6 font-display text-lg font-bold text-white">
                {t("cardMissionStatementTitle")}
              </span>
              <span className="absolute bottom-6 start-6 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] text-white">
                {tCommon("learnMore")}
                <ArrowRightIcon />
              </span>
            </TenantLink>
          </div>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/about/membership", MembershipPage);
