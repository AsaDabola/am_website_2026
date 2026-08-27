import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArticleIcon } from "@/components/ui/icons";

/**
 * The card the design uses everywhere a story is listed — the news listings
 * and the Events & Testimonials row alike.
 *
 * Flat and bordered rather than rounded and floating: a 212px image over a
 * footer ruled on three sides, the category in 12px caps on 3px tracking, the
 * title at 22px on 28px, and a document mark before READ. All of it from
 * node 1025:1106.
 *
 * The design's cards also carry a blurred copy of the photograph behind the
 * sharp one. It is clipped by the frame and the sharp copy covers it exactly,
 * so nothing of it is ever visible — reproducing it would only cost a second
 * request for the same image.
 */
export default function ArticleCard({
  href,
  image,
  tag,
  title,
}: {
  href: string;
  image?: string;
  tag: string;
  title: string;
}) {
  return (
    <Link href={href} className="group block bg-white">
      <div className="relative aspect-[300/212] w-full overflow-hidden bg-mist">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundImage: "linear-gradient(135deg, #2a5eec, #0d1f52)" }}
          />
        )}
      </div>

      {/* Ruled on three sides — the image's own edge closes the top. */}
      <div className="border-x border-b border-[#e6e6e6] px-[18px] pb-[18px] pt-4">
        <p className="text-[12px] uppercase leading-[18px] tracking-[3px] text-[#555]">{tag}</p>
        <h3 className="mt-[13px] text-[22px] leading-[28px] tracking-[0.1px] text-black">
          {title}
        </h3>
        <span className="mt-[18px] flex items-center gap-[7px] text-[12px] uppercase leading-[18px] tracking-[3px] text-black transition-colors group-hover:text-brand-blue">
          <ArticleIcon />
          Read
        </span>
      </div>
    </Link>
  );
}
