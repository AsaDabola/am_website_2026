import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { Link } from "@/i18n/navigation";
import {
  PeopleIcon,
  BookIcon,
  MonitorIcon,
  PaletteIcon,
  HeartIcon,
} from "@/components/ui/icons";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import VolunteerApplicationForm from "@/components/get-involved/VolunteerApplicationForm";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Get Involved | AM International",
  description:
    "AM is always happy to welcome family in Christ interested in volunteering in our mission.",
};

const categories = [
  {
    title: "Chapter Volunteer",
    Icon: PeopleIcon,
    href: "/get-involved/volunteer#apply",
    description:
      "Serve alongside a local AM chapter — hosting Bible studies, organizing events, and walking with students on campus.",
  },
  {
    title: "Bible Teacher",
    Icon: BookIcon,
    href: "/get-involved/volunteer#apply",
    description:
      "Teach and lead Bible study groups, helping students grow in Scripture and in their walk with Christ.",
  },
  {
    title: "Online Content Developers",
    Icon: MonitorIcon,
    href: "/get-involved/volunteer#apply",
    description:
      "Help build and maintain AM's digital presence — website, social media, and online resources.",
  },
  {
    title: "IT & Design",
    Icon: PaletteIcon,
    href: "/get-involved/volunteer#apply",
    description: "Support AM's technology and creative needs, from systems to graphic design.",
  },
  {
    title: "Your Gift",
    Icon: HeartIcon,
    href: "/get-involved/donate",
    description: "Give financially to fuel Bible study, training, and sending students out.",
  },
];

export default function VolunteerPage() {
  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved", href: "/get-involved" },
          { label: "Volunteer" },
        ]}
        title="Get Involved"
        subtitle="An interdenominational ministry committed to spreading the gospel to the ends of the earth, testifying to the eternal love of the Lord."
      />
      <GetInvolvedSubNav active="/get-involved/volunteer" />

      <section className="bg-mist py-20">
        <Container className="max-w-[900px] text-center">
          <div className="flex justify-center">
            <Eyebrow>What we do</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Volunteer
          </h1>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              "/images/get-involved-bible-studies.png",
              "/images/get-involved-volunteer.png",
              "/images/get-involved-internship.png",
            ].map((src) => (
              <div
                key={src}
                className="relative aspect-square overflow-hidden rounded-xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.1)]"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-[733px] text-base leading-relaxed text-ink-muted">
            AM is always happy to welcome family in Christ interested in volunteering in our
            mission for a period of time. We believe that God has given unique gifts to each
            person and they can be used preciously for the glory of God.
          </p>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container>
          <div className="mx-auto grid max-w-[813px] gap-x-10 gap-y-14 sm:grid-cols-2">
            {categories.map(({ title, Icon, href, description }) => (
              <Link key={title} href={href} className="group text-center">
                <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-mist text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                  <Icon className="size-8" />
                </span>
                <h3 className="mt-6 font-display text-lg font-bold tracking-[-0.02em] text-ink">
                  {title}
                </h3>
                <p className="mx-auto mt-3 max-w-[348px] text-sm leading-relaxed text-ink-muted">
                  {description}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section id="apply" className="bg-mist py-24">
        <Container className="mx-auto max-w-[887px]">
          <VolunteerApplicationForm />
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
