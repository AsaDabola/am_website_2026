import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";
import { ArrowRightIcon } from "@/components/ui/icons";

const cards = [
  { title: "Bible Studies", href: "/bible-study", from: "#3a6cd8", to: "#0d1f52" },
  { title: "Volunteer", href: "/get-involved", from: "#2a5eec", to: "#0a0e26" },
  { title: "Internship", href: "/get-involved", from: "#1449c6", to: "#050a2e" },
];

export default function GetInvolved() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="text-center">
          <div className="flex justify-center">
            <Eyebrow>Get Connected</Eyebrow>
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
            Get Involved
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative block aspect-[416/520] overflow-hidden rounded-2xl"
            >
              <PlaceholderPhoto className="absolute inset-0" from={card.from} to={card.to} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-6 left-6 font-display text-2xl font-bold text-white">
                {card.title}
              </span>
              <span className="absolute bottom-6 right-6 flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-white/25">
                <ArrowRightIcon />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
