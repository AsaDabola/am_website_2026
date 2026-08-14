import Link from "next/link";
import Container from "@/components/ui/Container";
import { BookIcon, HeartIcon, PeopleIcon, PinIcon } from "@/components/ui/icons";

const links = [
  {
    title: "Join a Bible study",
    description: "The 5-phase online discipleship and Bible education program.",
    href: "/bible-study",
    Icon: BookIcon,
  },
  {
    title: "Find your campus",
    description: "Our network of chapters and fellowships.",
    href: "/network",
    Icon: PinIcon,
  },
  {
    title: "Get involved",
    description: "Connect, grow, lead and be sent with AM.",
    href: "/get-involved",
    Icon: PeopleIcon,
  },
  {
    title: "Support the mission",
    description: "Give, pray and partner with students in the field.",
    href: "/give",
    Icon: HeartIcon,
  },
];

export default function QuickLinks() {
  return (
    <section className="bg-white py-8">
      <Container>
        <div className="grid overflow-hidden rounded-xl border border-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">
          {links.map(({ title, description, href, Icon }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col gap-4 p-8 text-white transition-transform hover:-translate-y-0.5"
              style={{
                backgroundImage: "linear-gradient(180deg, #2a5eec, #4d8df6)",
              }}
            >
              <Icon className="size-8 text-white" />
              <div>
                <p className="font-display text-lg font-bold tracking-[-0.02em]">
                  {title}
                </p>
                <p className="mt-2 text-sm text-on-dark/70">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
