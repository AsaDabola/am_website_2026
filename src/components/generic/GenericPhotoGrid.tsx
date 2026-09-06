import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericPhotoGrid({
  eyebrow,
  heading,
  people,
  background,
}: {
  eyebrow?: string;
  heading?: string;
  people: { image: string; name: string; title?: string }[];
  background?: BackgroundValue;
}) {
  const bg = backgroundClasses(background);
  return (
    <section className={`${bg.section} py-16 lg:py-20`}>
      <Container>
        {eyebrow ? <Eyebrow tone={bg.eyebrowTone}>{eyebrow}</Eyebrow> : null}
        {heading ? (
          <h2 className={`font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl ${bg.heading}`}>
            {heading}
          </h2>
        ) : null}
        <div className={`grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 ${heading || eyebrow ? "mt-10" : ""}`}>
          {people.map((person) => (
            <div key={person.name}>
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-paper">
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  sizes="(min-width: 1024px) 300px, (min-width: 640px) 30vw, 45vw"
                  className="object-cover"
                />
              </div>
              <p className={`mt-4 font-semibold ${bg.heading}`}>{person.name}</p>
              {person.title ? <p className={`italic ${bg.body}`}>{person.title}</p> : null}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
