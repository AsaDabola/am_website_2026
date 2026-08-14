import Link from "next/link";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import { FacebookIcon, InstagramIcon, MailIcon, YoutubeIcon } from "@/components/ui/icons";

const columns = [
  {
    title: "Who we are",
    links: [
      { label: "About AM", href: "/about" },
      { label: "Mission statement", href: "/about/mission" },
      { label: "Statement of faith", href: "/about/statement-of-faith" },
      { label: "Our history", href: "/about/history" },
      { label: "Leadership", href: "/about/leadership" },
    ],
  },
  {
    title: "What we do",
    links: [
      { label: "Bible Study Program", href: "/bible-study" },
      { label: "Four Spiritual Themes", href: "/four-spiritual-themes" },
      { label: "AM Academy", href: "https://www.amacademy.org" },
      { label: "Our ministries", href: "/ministries" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { label: "Connect, Grow, Lead, Sent", href: "/get-involved" },
      { label: "Chapter affiliation", href: "/get-involved/chapter-affiliation" },
      { label: "Our Network", href: "/network" },
      { label: "Events", href: "/events" },
      { label: "Give", href: "/give" },
    ],
  },
  {
    title: "Media",
    links: [
      { label: "News", href: "/news" },
      { label: "Four Spiritual Themes", href: "/four-spiritual-themes" },
      { label: "Legacy of Ralph D. Winter", href: "/ralph-d-winter" },
      { label: "Contact us", href: "/contact" },
    ],
  },
];

const socials = [
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "YouTube", href: "https://youtube.com", Icon: YoutubeIcon },
  { label: "Email", href: "mailto:info@amintl.org", Icon: MailIcon },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-footer text-on-dark">
      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] lg:gap-8">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-6 text-sm leading-relaxed text-on-dark/70">
            An interdenominational ministry committed to spreading the gospel
            to the ends of the earth, testifying to the eternal love of the
            Lord.
          </p>
          <p className="mt-6 text-sm leading-relaxed text-on-dark/70">
            Apostolos Missions International
            <br />
            Trenton, New Jersey, USA
            <br />
            <a href="mailto:info@amintl.org" className="underline underline-offset-2">
              info@amintl.org
            </a>
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex size-[38px] items-center justify-center rounded-full border border-white/[0.12] text-on-dark/80 transition-colors hover:border-white/30 hover:text-white"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-blue">
              {col.title}
            </h3>
            <ul className="mt-6 space-y-4 text-sm text-on-dark/70">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-white/[0.15]">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-[13px] text-on-dark/45 sm:flex-row">
          <p>© 2026 Apostolos Missions International. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about/statement-of-faith" className="hover:text-on-dark/80">
              Statement of faith
            </Link>
            <Link href="/contact" className="hover:text-on-dark/80">
              Contact
            </Link>
            <Link href="/give" className="hover:text-on-dark/80">
              Give
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
