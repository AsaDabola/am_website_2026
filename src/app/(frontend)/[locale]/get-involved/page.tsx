import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Get Involved | AM International",
  description:
    "An interdenominational ministry committed to spreading the gospel to the ends of the earth, testifying to the eternal love of the Lord.",
};

const roadmap = [
  { tag: "Connect", items: ["Onsite/Online Bible", "Study Programs"] },
  { tag: "Grow", items: ["Group Activities"] },
  { tag: "Lead", items: ["Volunteer & Internships", "Chapter Leaders"] },
  { tag: "Sent", items: ["Alumni Connect", "Part/Full Time Staff Missionaries", "Bible Teachers"] },
];

export default function GetInvolvedHubPage() {
  return (
    <>
      <AboutHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Get Involved" }]}
        title="Get Involved"
        subtitle="An interdenominational ministry committed to spreading the gospel to the ends of the earth, testifying to the eternal love of the Lord."
      />
      <GetInvolvedSubNav active="/get-involved" />

      <section className="bg-mist py-24">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>AM Roadmap</Eyebrow>
          </div>
          <h2 className="mx-auto max-w-xl font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            What is expected?
          </h2>

          <div className="mt-14 grid gap-8 text-left sm:grid-cols-2 lg:grid-cols-4">
            {roadmap.map((step) => (
              <div key={step.tag} className="border-t-2 border-black/10 pt-6">
                <h3 className="font-display text-base font-bold text-ink">{step.tag}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {step.items.map((item, i) => (
                    <span key={item}>
                      {item}
                      {i < step.items.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[570px_1fr] lg:gap-16">
            <div className="relative aspect-[570/577] overflow-hidden rounded-2xl">
              <Image
                src="/images/get-involved-connect.jpg"
                alt="AM students connecting at a campus outreach table"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 570px, 100vw"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
                Connect
              </h2>

              <div className="mt-8 space-y-8">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    1. Subscribe to Our Websites
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    There are many ways to be connected with AM. You can subscribe to our main
                    website, www.amintl.org, and receive newsletters. Or you can subscribe to our
                    online Bible school website, www.amacademy.org, and receive the latest news
                    and programs. Feel free to browse our vision, activities, and programs
                    through our websites and email us anytime if you have any questions.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    2. Sign up to Meet Our Staff
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    Feel free to{" "}
                    <Link href="/contact" className="text-brand-blue underline underline-offset-2">
                      sign up
                    </Link>{" "}
                    here if you wish to talk to one of our staff and receive counseling on your
                    spiritual journey. You can either set up the appointment or contact our
                    staff. Many of our staff members have experiences in campus life and
                    understand the contexts that college students face. They will help you find
                    the most fitting track for your journey of faith.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    3. Sign up for Bible Study
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    If you are ready to start our Bible study program,{" "}
                    <Link
                      href="/bible-study/join"
                      className="text-brand-blue underline underline-offset-2"
                    >
                      sign up
                    </Link>{" "}
                    on this page. If you don&rsquo;t find the schedule that fits, submit the
                    request form with your preferred course and time!
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    4. Connect with Local Chapter
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    If you wish to be connected in our onsite local chapter office and staff,
                    please{" "}
                    <Link href="/contact" className="text-brand-blue underline underline-offset-2">
                      contact here
                    </Link>
                    . We look forward to meeting you soon!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-mist py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[570px_1fr] lg:gap-16">
            <div className="relative aspect-[570/577] overflow-hidden rounded-2xl">
              <Image
                src="/images/get-involved-grow.jpg"
                alt="AM students growing together in fellowship"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 570px, 100vw"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
                Grow
              </h2>
              <p className="mt-8 text-sm leading-relaxed text-ink-muted">
                Just as we grow and mature through different stages in our childhood, we reach
                key milestones in our spiritual maturity. AM offers numerous programs and tracks
                designed to guide students through each of these three vital stages of spiritual
                growth:
              </p>

              <div className="mt-8 space-y-5">
                <div>
                  <h3 className="font-display text-base font-bold text-ink">1. Reborn</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    We are born again through the atoning sacrifice of Jesus on the Cross.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">1. Mature</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    We grow and mature spiritually by nourishing love and truth from Jesus.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">1. Fruitful</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    We experience the fruitfulness of life through God&rsquo;s blessing,
                    fulfilled in our mature unity with Christ Jesus.
                  </p>
                </div>
              </div>

              <h3 className="mt-8 font-display text-lg font-bold text-ink">
                Navigating Campus Life
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Campus life is exciting and fulfilling, but with so many choices available, it
                can also feel aimless. Through truth and prayer, AM helps you discern God&rsquo;s
                will and find clear guidance for your extraordinary life.
              </p>

              <h3 className="mt-8 font-display text-lg font-bold text-ink">Next Steps</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Continue to engage with our programs—take advantage of diverse opportunities to
                hear the Word, pray together, fellowship with brothers and sisters of faith, and
                serve as you grow in the Gospel.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[570px_1fr] lg:gap-16">
            <div className="relative aspect-[570/577] overflow-hidden rounded-2xl">
              <Image
                src="/images/get-involved-lead.jpg"
                alt="AM leadership retreat"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 570px, 100vw"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
                Lead
              </h2>

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    1. Serving in the Love of Christ
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    As we grow, we desire to serve others who need help to come to Jesus. As we
                    serve, we also grow more deeply in the love of Christ.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    2. The Blessing of Leadership
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    Jesus said, &ldquo;It is more blessed to give than to receive&rdquo; (Acts
                    20:35). Leading and guiding others requires wisdom, prayer, sacrifice, and
                    patience. However, it is a blessed place where the glory of the Cross
                    culminates.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    3. The Blessing of Leadership
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    Although college students are still young, outstanding gifts and skills can
                    be discovered and developed even more powerfully through leadership roles. It
                    is a beautiful process as each student tests and affirms their heavenly gifts
                    through the gracious experience of serving and leading.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    4. Opportunities with AM
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    AM offers diverse opportunities and roles for students to participate in
                    serving and leadership. Join our team of volunteers, Chapter staff, Chapter
                    leaders, Bible teachers, and many others. Discover what Jesus planted in you
                    according to His excellent plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-mist py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[570px_1fr] lg:gap-16">
            <div className="relative aspect-[570/577] overflow-hidden rounded-2xl">
              <Image
                src="/images/get-involved-sent.jpg"
                alt="AM missionaries meeting together"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 570px, 100vw"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
                Sent
              </h2>

              <div className="mt-8 space-y-5 text-sm leading-relaxed text-ink-muted">
                <p>
                  Graduation from college is another significant departure toward the world wide
                  open for us to explore. Some of us may pursue education further or take the
                  career path. Some of us also become AM full-time staff, missionaries, or
                  ministers following the calling from God.
                </p>
                <p>
                  In this crucial step, AM offers programs that you can stay connected and
                  continue to serve the Gospel mission through Alumni Connect. AM also provides
                  training programs and tracks to become professional mission workers and staff
                  in AM World Mission.
                </p>
                <p>
                  Various options are open for you toward a bright future. AM wishes to walk
                  closely with every individual to bring altogether for the Great Commission,
                  &ldquo;Therefore go and make disciples of all nations, baptizing them in the
                  name of the Father and of the Son and of the Holy Spirit (Matthew
                  28:19).&rdquo;
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  { label: "Alumni Connect", href: "/get-involved/alumni-connect" },
                  { label: "Become AM Bible Teachers", href: "/get-involved/bible-teacher-training" },
                  { label: "Become AM Missionaries", href: "/get-involved/internship" },
                  { label: "Full-Time Staff in AM HQ", href: "/contact" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-brand-blue underline underline-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
