import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const items = [
  {
    title: "Bible study",
    description: "Small and large group study that puts Scripture at the centre of campus life.",
  },
  {
    title: "Leadership training",
    description: "Students are coached to lead their peers, then to send the next group out.",
  },
  {
    title: "Online education",
    description: "AM Academy courses in Scripture, missiology and cross-cultural ministry.",
  },
  {
    title: "Internships & trips",
    description: "Short-term missions and internships that turn training into practice.",
  },
];

export default function WhatWeDoInPractice() {
  return (
    <section className="bg-mist py-24">
      <Container>
        <div className="text-center">
          <div className="flex justify-center">
            <Eyebrow>In practice</Eyebrow>
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
            Four things we do everywhere we go.
          </h2>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="border-t-2 border-black/[0.12] pt-6">
              <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
