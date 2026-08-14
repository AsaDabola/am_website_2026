import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";

const steps = [
  {
    tag: "Connect",
    title: "Connect with AM",
    description:
      "AM offers various Bible study programs that nurture our spiritual life and relationship with the Lord Jesus Christ.",
    href: "/bible-study",
    from: "#2a5eec",
    to: "#0d1f52",
  },
  {
    tag: "Grow",
    title: "Grow with AM",
    description:
      "Join our Group Activities and mature together in the fellowship of truth. Our Group programs provide high-quality experiences for every student to gain spiritual strength.",
    href: "/ministries",
    from: "#3a6cd8",
    to: "#0d1f52",
  },
  {
    tag: "Lead",
    title: "Lead with AM",
    description:
      "AM is happy to welcome students interested in volunteering and serving through their God given talents in various departments.",
    href: "/get-involved",
    from: "#4d8df6",
    to: "#0d1f52",
  },
  {
    tag: "Sent",
    title: "Sent with AM",
    description:
      "AM will continue to walk with you until your precious calling of “being sent” is fulfilled in your life even after your graduation!",
    href: "/get-involved",
    from: "#1449c6",
    to: "#050a2e",
  },
];

export default function Ministries() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <Eyebrow>Connect · Grow · Lead · Sent</Eyebrow>
            <h2 className="max-w-xl font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
              Four steps, and we walk every one of them with you.
            </h2>
          </div>
          <Button href="/get-involved" variant="ghostDark" className="shrink-0">
            Get involved
          </Button>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.tag} className="flex flex-col">
              <div className="relative overflow-hidden rounded-2xl">
                <PlaceholderPhoto
                  className="aspect-[256/160]"
                  from={step.from}
                  to={step.to}
                />
                <span className="absolute left-3 top-3 rounded-md bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {step.tag}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.02em] text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {step.description}
              </p>
              <Button href={step.href} variant="ghostDark" className="mt-5">
                Learn more
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
