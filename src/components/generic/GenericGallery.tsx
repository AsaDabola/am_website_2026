import Image from "next/image";
import Container from "@/components/ui/Container";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericGallery({
  images,
  background,
}: {
  images: [
    { src: string; alt: string },
    { src: string; alt: string },
    { src: string; alt: string },
  ];
  background?: BackgroundValue;
}) {
  const bg = backgroundClasses(background);
  const [main, topRight, bottomRight] = images;
  return (
    <section className={`${bg.section} py-10`}>
      <Container>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.78fr_1fr]">
          <div className="relative aspect-[849/637] w-full overflow-hidden rounded-2xl">
            <Image src={main.src} alt={main.alt} fill sizes="(min-width: 640px) 45vw, 90vw" className="object-cover" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[477/311] w-full overflow-hidden rounded-2xl">
              <Image src={topRight.src} alt={topRight.alt} fill sizes="(min-width: 640px) 26vw, 90vw" className="object-cover" />
            </div>
            <div className="relative aspect-[477/311] w-full overflow-hidden rounded-2xl">
              <Image src={bottomRight.src} alt={bottomRight.alt} fill sizes="(min-width: 640px) 26vw, 90vw" className="object-cover" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
