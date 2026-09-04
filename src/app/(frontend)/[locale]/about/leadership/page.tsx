import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import LeadershipHero from "@/components/about/LeadershipHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import { ArrowRightIcon } from "@/components/ui/icons";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import withPageLayout from "@/components/pages/BuiltInPage";

// Sixty seconds, so a section added to this page in /admin appears without a
// deploy. Without it the page is fully static and the authored layout would be
// whatever it was at build time — see components/pages/BuiltInPage.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Leadership | AM International",
  description: "Servants, sent and given — the people who steer AM's mission worldwide.",
};

/**
 * Everyone on one grid, in the order the design lays them out: the executive
 * director, then the regional coordinators west to east, then headquarters
 * staff. The earlier version of this page split the same people across three
 * sections with three different treatments — a wide row with a biography, a
 * four-up card with a biography and an email, and a small five-up tile — which
 * read as three ranks. The design collapses them into one tile so the page
 * shows a team rather than a hierarchy.
 */
const people: {
  name: string;
  role: string;
  image: string;
  /** Force this person to open a new row at the five-column width. */
  startsRow?: boolean;
}[] = [
  { name: "Rani Reid", role: "Executive Director", image: "/images/leader-reid.webp" },

  { name: "Andrea Rico", role: "South America", image: "/images/coord-andrea-rico.webp" },
  { name: "Joel Lee", role: "Asia Pacific", image: "/images/coord-joel-lee.webp" },
  { name: "Mara Onyeama", role: "Europe", image: "/images/coord-mara-onyeama.webp" },
  { name: "Jonathan Xie", role: "China", image: "/images/coord-jonathan-xie.webp" },
  { name: "Priya Vaya", role: "South Asia", image: "/images/coord-priya-vaya.webp" },
  { name: "Samuel Kwizera", role: "Africa", image: "/images/coord-samuel-kwizera.webp" },
  { name: "Khiaghie Koropa", role: "Oceania", image: "/images/coord-khiaghie-koropa.webp" },

  // Headquarters starts its own row in the design rather than running on from
  // the coordinators, which is the only thing separating the two groups now
  // that they share a tile. Only at the five-column width — below that the
  // grid rewraps anyway and a forced break would leave a hole.
  {
    name: "Asa Daboh",
    role: "HQ Staff",
    image: "/images/hq-asa-daboh.webp",
    startsRow: true,
  },
  { name: "Ruth Jigmedsuren", role: "HQ Staff", image: "/images/hq-ruth-jigmedsuren.webp" },
  {
    name: "Can Liu",
    role: "Director of Chinese Mission in USA",
    image: "/images/hq-can-liu.webp",
  },
  {
    name: "Vanessa Eusebio",
    role: "Online Evangelism Coordinator",
    image: "/images/hq-vanessa-eusebio.webp",
  },
];

/**
 * Kept out of the grid on purpose: the design gives this one person a wide
 * row with a portrait at 258px and room for a paragraph, below a rule. It is
 * the only biography left on the page.
 */
const advisors = [
  {
    name: "Rev. Dr. Paul DeVries",
    title: "Senior Leader and Advisor",
    bio: "Dr. DeVries provides profound wisdom and spiritual guidance for our mission in many areas. Dr. Paul is also President of the New York Divinity School, and has over 25 years of leadership experience in Christian higher education administration, including at Wheaton College, Northern Baptist Theological Seminary and the Seminary of the East.",
    image: "/images/leader-paul-devries.webp",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * Every portrait on this page is the same tile: square, 8px corners, over a
 * pale blue gradient that shows through as the person's initials when no
 * photograph has been supplied. One tile for the grid and for the advisor row
 * alike — the design gives neither its own crop.
 */
function Portrait({
  image,
  name,
  sizes,
  className = "",
  initialsClassName = "text-[34px]",
}: {
  image?: string | null;
  name: string;
  sizes: string;
  className?: string;
  initialsClassName?: string;
}) {
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-[8px] ${className}`}
      style={{ backgroundImage: "linear-gradient(127deg, #e5edf6 0%, #cddbee 71%)" }}
    >
      {image ? (
        <Image src={image} alt={name} fill className="object-cover" sizes={sizes} />
      ) : (
        <span
          className={`flex size-full items-center justify-center font-display font-extrabold text-[#93a7be] ${initialsClassName}`}
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}

const leaderKinds = [
  {
    number: "01",
    title: "Chapter Leaders",
    description:
      "Students who register AM at their university, open the first Bible study, and carry the chapter through each academic year.",
  },
  {
    number: "02",
    title: "Field Missionaries",
    description:
      "Sent to cities where no chapter exists yet, planting the work from the first conversation onward.",
  },
  {
    number: "03",
    title: "Bible Teachers",
    description:
      "Walking students through the five-phase programme one study at a time, on the student's schedule.",
  },
  {
    number: "04",
    title: "Local Staff",
    description:
      "Holding the practical work of each chapter — rooms, resources, events and the people who keep coming back.",
  },
];

function LeadershipPage() {
  return (
    <>
      <LeadershipHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Who We Are", href: "/about" },
          { label: "Leadership" },
        ]}
        eyebrow="Our Leadership"
        title="Servants, sent and given."
      >
        Our mission is possible through God-given servants who join our team from all across
        the world. We work in unity with{" "}
        {/* The four roles are set in white medium against the paragraph's
            softer white — they are the list the page then walks through. */}
        <span className="font-medium text-white">
          chapter leaders, field missionaries, Bible teachers and local staff
        </span>{" "}
        &mdash; and we are glad to introduce those who carry that leadership for the Gospel
        movement.
      </LeadershipHero>
      <AboutSubNav active="/about/leadership" />

      <section className="bg-white py-20">
        <Container className="max-w-[1104px]">
          <Eyebrow>Headquarters &amp; Field</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            The people behind the sending.
          </h2>

          {/* Five across at the design's 1104px container, where a 201.6px
              tile and a 24px gutter come out exact. Two across on a phone so
              a face stays large enough to recognise. */}
          <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-11 sm:grid-cols-3 lg:grid-cols-5">
            {people.map((person) => (
              <div
                key={`${person.name}-${person.role}`}
                className={`flex flex-col text-center ${person.startsRow ? "lg:col-start-1" : ""}`}
              >
                <Portrait
                  image={person.image}
                  name={person.name}
                  sizes="(min-width: 1024px) 202px, (min-width: 640px) 30vw, 45vw"
                  initialsClassName="text-2xl"
                />
                <p className="pt-4 font-display text-base font-extrabold leading-5 tracking-[-0.025em] text-ink">
                  {person.name}
                </p>
                <p className="pt-[5px] text-sm leading-5 text-ink-muted">{person.role}</p>
              </div>
            ))}
          </div>

          {/* The one biography the design keeps, under a rule: a wide row
              rather than a tile, because the paragraph needs the width. */}
          <div className="mt-20">
            {advisors.map((leader) => (
              <div
                key={leader.name}
                className="flex flex-col gap-10 border-t border-ink/[0.12] pt-9 sm:flex-row"
              >
                <Portrait
                  image={leader.image}
                  name={leader.name}
                  sizes="258px"
                  className="w-full shrink-0 sm:w-[258px]"
                />
                <div className="flex flex-col gap-[7px] pt-1">
                  <p className="font-display text-[23px] font-extrabold leading-[24.38px] tracking-[-0.035em] text-ink">
                    {leader.name}
                  </p>
                  <p className="text-[14.5px] font-semibold leading-6 text-brand-blue">
                    {leader.title}
                  </p>
                  <p className="max-w-[760px] text-[14.5px] leading-[23.9px] text-ink-muted">
                    {leader.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* The design runs the whole page white below the hero — no alternating
          mist bands — so the rules and the rows carry the separation. */}
      <section className="bg-white py-20">
        <Container className="max-w-[1104px]">
          <Eyebrow>Across the Network</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Four kinds of leaders, one movement.
          </h2>

          <div className="mt-10 divide-y divide-black/10 rounded-2xl bg-white px-6">
            {leaderKinds.map((kind) => (
              <div
                key={kind.number}
                className="flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:gap-8"
              >
                <div className="flex items-baseline gap-4 sm:w-[304px] sm:shrink-0">
                  <span className="font-display text-sm font-extrabold text-brand-blue">
                    {kind.number}
                  </span>
                  <p className="font-display text-xl font-extrabold tracking-[-0.02em] text-ink">
                    {kind.title}
                  </p>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-ink-muted">
                  {kind.description}
                </p>
                <span className="hidden size-[42px] shrink-0 items-center justify-center rounded-full border border-black/10 text-ink sm:flex">
                  <ArrowRightIcon />
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/about/leadership", LeadershipPage);
