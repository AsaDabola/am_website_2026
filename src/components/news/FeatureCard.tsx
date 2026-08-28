import Image from "next/image";
import { Link } from "@/i18n/navigation";

/**
 * The wide card the design opens a listing with: one photograph carrying its
 * own title, twice the width of the cards beside it.
 *
 * It is the same tile as the others in every way that matters — one image, one
 * label, one title — with the text laid over the photograph rather than ruled
 * beneath it, so the first thing on the page reads as the thing to look at.
 * A scrim carries the text, because a photograph cannot be relied on to be
 * dark where the words land.
 */
export default function FeatureCard({
  href,
  image,
  tag,
  title,
}: {
  /** Omitted for a card with nothing to open — see ArticleCard. */
  href?: string;
  image?: string;
  tag: string;
  title: string;
}) {
  const card = (
    <>
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 66vw, 100vw"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(135deg, #2a5eec, #0d1f52)" }}
        />
      )}

      {/* Bottom-weighted, so the top of the photograph stays untouched. */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-6 pt-16 sm:p-8 sm:pt-20">
        <p className="text-[12px] uppercase leading-[18px] tracking-[3px] text-white/80">{tag}</p>
        <h3 className="mt-2 max-w-[22ch] font-display text-[26px] font-semibold leading-[32px] text-white sm:text-[32px] sm:leading-[38px]">
          {title}
        </h3>
      </div>
    </>
  );

  // Square on its own, and filling the row once it sits beside a normal card,
  // so the two line up without either being given a fixed height.
  const shell =
    "group relative block aspect-[300/212] w-full overflow-hidden bg-mist sm:col-span-2 lg:aspect-auto lg:h-full";

  return href ? (
    <Link href={href} className={shell}>
      {card}
    </Link>
  ) : (
    <div className={shell}>{card}</div>
  );
}
