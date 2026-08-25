import type { Metadata } from "next";
import Image from "next/image";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import LeadershipHero from "@/components/about/LeadershipHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import { ArrowRightIcon } from "@/components/ui/icons";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Leadership | AM International",
  description: "Servants, sent and given — the people who steer AM's mission worldwide.",
};

const featuredLeaders = [
  {
    name: "Rev. Dr. Paul DeVries",
    title: "Senior Leader and Advisor",
    bio: "Dr. DeVries provides profound wisdom and spiritual guidance for our mission in many areas. Dr. Paul is also President of the New York Divinity School, and has over 25 years of leadership experience in Christian higher education administration, including at Wheaton College, Northern Baptist Theological Seminary and the Seminary of the East.",
    image: "/images/leader-paul-devries.jpg",
  },
  {
    name: "Rani Reid",
    title: "Executive Director",
    bio: "Rani Reid is our Executive Director who steers and leads the administration, mission and operation of AM world mission.",
    image: "/images/leader-reid.jpg",
  },
];

const hqStaff = [
  {
    name: "Asa Daboh",
    title: "HQ Staff",
    bio: "Asa Daboh serves as our HQ staff, overseeing chapter involvement, property management, and assisting with HQ operations.",
    email: "asa@amintl.org",
    image: "/images/hq-asa-daboh.jpg",
  },
  {
    name: "Ruth Jigmedsuren",
    title: "HQ Staff",
    bio: "Ruth Jigmedsuren serves as our HQ staff, overseeing on-campus chapter involvement and assisting with HQ operations.",
    email: "ruth@amintl.org",
    image: "/images/hq-ruth-jigmedsuren.jpg",
  },
  {
    name: "Can Liu",
    title: "Director of Chinese Mission in USA",
    bio: "Can Liu is our Director of the Chinese mission in the United States. He creates edifying, empowering, and nourishing Biblical programs for overseas Chinese students studying in US colleges based on his faith journey from China with many testimonies and stories of grace.",
    email: "can@amintl.org",
    image: "/images/hq-can-liu.jpg",
  },
  {
    name: "Vanessa Eusebio",
    title: "Online Evangelism Coordinator",
    bio: "Vanessa Eusebio serves AM as a leader of online evangelism and outreach, using her gift of creativity and IT skills to promote Gospel programs and events in the United States and beyond.",
    email: "vanessa.e@amintl.org",
    image: "/images/hq-vanessa-eusebio.jpg",
  },
];

const coordinators = [
  { name: "Cowin Hodges", region: "USA & Canada", image: "/images/coord-cowin-hodges.jpg" },
  { name: "Andrea Rico", region: "South America", image: "/images/coord-andrea-rico.jpg" },
  { name: "Joel Lee", region: "Asia Pacific", image: "/images/coord-joel-lee.jpg" },
  { name: "Mara Onyeama", region: "Europe", image: "/images/coord-mara-onyeama.jpg" },
  { name: "Jonathan Xie", region: "China", image: "/images/coord-jonathan-xie.jpg" },
  { name: "Priya Vaya", region: "South Asia", image: "/images/coord-priya-vaya.jpg" },
  { name: "Samuel Kwizera", region: "Africa", image: "/images/coord-samuel-kwizera.jpg" },
  { name: "Khiaghie Koropa", region: "Oceania", image: "/images/coord-khiaghie-koropa.jpg" },
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
 * Every portrait on this page is the same tile: square, 10px corners, over a
 * pale blue gradient that shows through as the person's initials when no
 * photograph has been supplied. The design draws it that way in all three
 * sections rather than giving each its own crop.
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
      className={`relative aspect-square overflow-hidden rounded-[10px] ${className}`}
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

export default function LeadershipPage() {
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

          <div className="mt-10">
            {featuredLeaders.map((leader) => (
              <div
                key={leader.name}
                className="flex flex-col gap-10 border-t border-[#11182a]/[0.12] py-9 first:border-t-0 first:pt-0 sm:flex-row"
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

      <section className="bg-white py-20">
        <Container className="max-w-[1104px]">
          <Eyebrow>HQ Staff &amp; Coordinators</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Holding the day to day.
          </h2>

          {/* No card around these in the design — the portrait sits straight
              on the page with its text beneath, the same tile the featured
              rows above use. */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hqStaff.map((person) => (
              <div key={person.name} className="flex flex-col">
                <Portrait
                  image={person.image}
                  name={person.name}
                  sizes="(min-width: 1024px) 258px, (min-width: 640px) 50vw, 100vw"
                />
                <div className="flex flex-col gap-[7px] pt-[18px]">
                  <p className="font-display text-[19px] font-extrabold leading-[22px] tracking-[-0.032em] text-ink">
                    {person.name}
                  </p>
                  <p className="text-[13.5px] font-semibold leading-[19px] text-brand-blue">
                    {person.title}
                  </p>
                  <p className="text-[13.5px] leading-[21.5px] text-ink-muted">{person.bio}</p>
                  <TenantLink
                    href={`mailto:${person.email}`}
                    className="text-[12.5px] font-semibold leading-[19px] text-ink hover:text-brand-blue"
                  >
                    {person.email}
                  </TenantLink>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container className="max-w-[1104px]">
          <Eyebrow>AM Global</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Coordinators, region by region.
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-5">
            {coordinators.map((person) => (
              <div key={person.name} className="text-center">
                <Portrait
                  image={person.image}
                  name={person.name}
                  sizes="(min-width: 1024px) 202px, 40vw"
                  initialsClassName="text-2xl"
                />
                <p className="mt-4 text-sm font-semibold text-ink">{person.name}</p>
                <p className="mt-1 text-xs text-ink-muted">{person.region}</p>
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
