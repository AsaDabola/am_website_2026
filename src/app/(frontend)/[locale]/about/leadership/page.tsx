import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Leadership | AM International",
  description:
    "The people who steer, teach and serve across AM's campuses and offices.",
};

const leaders = [
  {
    name: "Rev. Dr. Paul DeVries",
    title: "Senior Leader and Advisor",
    bio: "Dr. DeVries provides profound wisdom and spiritual guidance for our mission in many areas. Dr. Paul is also President of the New York Divinity School, and has over 25 years of leadership experience in Christian higher education administration, including at Wheaton College, Northern Baptist Theological Seminary and the Seminary of the East.",
    image: "/images/leader-devries.jpg",
  },
  {
    name: "Rani Reid",
    title: "General Secretary",
    bio: "Rani Reid is our General Secretary who steers and leads the administration, mission and operation of AM world mission.",
    email: "rani.r@amintl.org",
    image: "/images/leader-reid.jpg",
  },
  {
    name: "Asa Daboh",
    title: "HQ Staff",
    bio: "Asa Daboh serves as our HQ Staff, overseeing chapter involvement, property management, and assisting with HQ operations.",
    email: "asa.d@amintl.org",
    image: "/images/leader-daboh.jpg",
  },
  {
    name: "Ruth Jigmedsuren",
    title: "HQ Staff",
    bio: "Ruth Jigmedsuren serves as our HQ staff, overseeing on campus chapter involvement, and assisting with HQ operations.",
    image: "/images/leader-jigmedsuren.jpg",
  },
  {
    name: "Can Liu",
    title: "Director of Chinese Mission in USA",
    bio: "Can Liu is our Director of Chinese mission in the United States. He creates edifying, empowering, and nourishing Biblical programs for overseas Chinese students studying in U.S. colleges based on his faith journey from China with many testimonies and stories of grace.",
    email: "can.l@amintl.org",
    image: "/images/leader-liu.jpg",
  },
];

export default function LeadershipPage() {
  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Leadership" },
        ]}
        title="Leadership"
        subtitle="The people who steer, teach and serve across AM's campuses and offices."
      />
      <AboutSubNav active="/about/leadership" />

      <article className="bg-white py-20">
        <Container className="max-w-[720px]">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
            Our Leadership
          </h2>
          <p className="mt-6 text-base leading-relaxed text-ink">
            Our mission is possible through God-given servants who join our team from all across
            the world. We collaborate and work together in unity with Chapter leaders, field
            missionaries, Bible teachers, and many local staff. We are pleased to introduce our
            representative leaders and staff who exert gracious leadership for our Gospel
            movement.
          </p>

          <div className="mt-14 space-y-12">
            {leaders.map((leader) => (
              <div key={leader.name} className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="relative size-[120px] shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-ink">{leader.name}</p>
                  <p className="text-sm font-semibold text-brand-blue">{leader.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{leader.bio}</p>
                  {leader.email && (
                    <Link
                      href={`mailto:${leader.email}`}
                      className="mt-2 inline-block text-sm text-brand-blue underline underline-offset-2"
                    >
                      {leader.email}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </article>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
