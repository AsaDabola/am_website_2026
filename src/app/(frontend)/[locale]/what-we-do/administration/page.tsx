import type { Metadata } from "next";
import { getTranslations } from "@/i18n/content";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import withPageLayout from "@/components/pages/BuiltInPage";

// Sixty seconds, so a section added to this page in /admin appears without a
// deploy. Without it the page is fully static and the authored layout would be
// whatever it was at build time — see components/pages/BuiltInPage.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Administration | AM International",
  description:
    "Apostolos Missions being an international ministry with a large network, consists of various departments that specialize in specific areas of the ministry.",
};

const departments = [
  {
    title: "Network",
    description:
      "We are currently serving in 9 regions with ministers, evangelists, and Bible teachers who are passionate about making Christ known to the nations. The staff on this team are committed to supporting our network of mission workers through personal and spiritual development. For this, services and conferences are held on a regular basis to provide guidance and care. The goal is to foster unity while mobilizing the network to perform its day-to-day activities.",
  },
  {
    title: "Outreach & Evangelism",
    description:
      "Evangelism and outreach are a big part of Apostolos Missions and what we do. This department focuses on strategizing new ways for chapters to evangelize in innovative ways. It is all about helping build relationships while reaching others through the gospel involving acts of love and compassion.",
  },
  {
    title: "Event & Planning",
    description:
      "Our event and planning team serves as a catalyst for fellowship programs and activities. They organize and coordinate a variety of social and professional events including fellowship events, retreats, internships, and other special events.",
  },
  {
    title: "Statistics & Database",
    description:
      "In their day-to-day work, the statistics and database team will collect mission data to calculate progress in mission and developments in evangelism and Bible studies. They also create surveys and polls to help the outreach and evangelism team create more dynamic ways of outreach. Not only so, but with such a large network, keeping a database of members worldwide is crucial. The statistics and database staff play a vital role in ensuring that all data is accurate and up-to-date.",
  },
  {
    title: "Chapel & Services",
    description:
      "Our chaplain team arranges and leads weekly services while also ensuring that all members and visitors are being taken care of and provided for their well-being. They also provide spiritual guidance and counseling.",
  },
  {
    title: "Art & Design",
    description:
      "The staff of the art and design team is responsible for the visual part of Apostolos Missions resources, Bible study materials, and website design. In the case of events, the design department also supports the chapters around the world by designing flyers, banners, t-shirts, clothing, and accessories.",
  },
];

const additionalDepartments = [
  {
    title: "Department of Education",
    description:
      "The department of education is made up of a team of experts who have gone through advanced studies in the Bible and/or specific fields of Christianity. The team is committed to creating useful and practical biblical resources that can be used among chapters for evangelism, Bible studies, retreats, and large group activities.",
  },
  {
    title: "Department of Media",
    description:
      "In an era where media and technology is rapidly spreading and the youth is actively using media for mass communication, Apostolos Missions is investing its time and effort to reach its audience through social media. Our fellowship has a group of young professionals that develop Christian content and use social media platforms to share the gospel at a large scale.",
  },
  {
    title: "Department of Finance",
    description:
      "The financial department is responsible for organizing the finance of the ministry while also maintaining the financial health of the organization. The finance staff create financial reports, budgets, and make sure that the organization’s financial records abide by the local, state, and federal regulations.",
  },
  {
    title: "Property Management",
    description:
      "With a large property that’s serving the world mission and that is home to many staff, the AM property management is currently taking care of its headquarters facility. They do so by maintaining the property, contacting vendors in case of renovations or maintenance requests that involve plumbing, electricity, and HVAC.",
  },
  {
    title: "Language Department",
    description:
      "As we are an international ministry, our organization is dedicated to reach all peoples groups with all different languages and backgrounds. One very important aspect of spreading the gospel is the need to do so by language according to the city, country, and region. Our language department works hand in hand with the departments of mission, education, and media in order to ensure that the gospel reaches to all souls across the globe.",
  },
];

async function AdministrationPage() {
  const [t, tHeader] = await Promise.all([
    getTranslations("Common"),
    getTranslations("Header"),
  ]);

  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: tHeader("whatWeDo") },
          { label: "Administration" },
        ]}
        title={tHeader("whatWeDo")}
        subtitle={t("tagline")}
        // The starfield the design puts behind What We Do. Until now this was
        // the last page with no hero of its own, so it was showing the Get
        // Involved seabird from AboutHero's default.
        backgroundImage="/images/administration-hero.webp"
      />

      <section className="bg-mist py-20">
        <Container className="max-w-[900px] text-center">
          <div className="flex justify-center">
            <Eyebrow>What we do</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Administration
          </h1>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {/* The design's order, which is not the order these were in: a
                chapter outdoors, staff working, then someone teaching. The
                middle one is new; the table shot that used to sit third is no
                longer shown, since the row has three places. */}
            {[
              { src: "/images/admin-intro-2.webp", alt: "Students at an AM chapter gathering" },
              { src: "/images/admin-intro-laptop.webp", alt: "AM staff working together at a laptop" },
              { src: "/images/admin-intro-1.webp", alt: "An AM staff member speaking at a lectern" },
            ].map(
              ({ src, alt }) => (
                <div
                  key={src}
                  className="relative aspect-square overflow-hidden rounded-xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.1)]"
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 33vw, 100vw"
                  />
                </div>
              ),
            )}
          </div>

          <p className="mx-auto mt-10 max-w-[733px] text-base leading-relaxed text-ink-muted">
            Apostolos Missions being an international ministry with a large network, consists of
            various departments that specialize in specific areas of the ministry. These
            departments are run by a team of staff who are committed to the successful operations
            of the ministry.
          </p>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>In practice</Eyebrow>
          </div>
          <h2 className="mx-auto max-w-lg font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Department of Mission
          </h2>
          <p className="mx-auto mt-4 max-w-[733px] text-base leading-relaxed text-ink-muted">
            Mission is one of Apostolos Missions&rsquo; top priorities. Our desire is to
            revitalize thriving campus ministries so that all campuses on earth will be filled
            with God&rsquo;s word and that the youth from all nations can have the opportunity to
            listen to the message of the love of God revealed on the cross through our Lord Jesus
            Christ.
          </p>

          <div className="mt-14 grid gap-x-10 gap-y-10 text-start sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <div key={dept.title} className="border-t-2 border-black/10 pt-6">
                <h3 className="font-display text-base font-bold text-ink">{dept.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{dept.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {additionalDepartments.map((dept, index) => (
        <section key={dept.title} className={index % 2 === 0 ? "bg-white py-20" : "bg-mist py-20"}>
          <Container className="max-w-[900px] text-center">
            <div className="flex justify-center">
              <Eyebrow>In practice</Eyebrow>
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
              {dept.title}
            </h2>
            <p className="mx-auto mt-4 max-w-[733px] text-base leading-relaxed text-ink-muted">
              {dept.description}
            </p>
          </Container>
        </section>
      ))}

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/what-we-do/administration", AdministrationPage);
