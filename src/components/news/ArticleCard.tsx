import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRightIcon } from "@/components/ui/icons";

export default function ArticleCard({
  href,
  image,
  tag,
  title,
  date,
}: {
  href: string;
  image?: string;
  tag: string;
  title: string;
  date?: string;
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0px_10px_30px_0px_rgba(27,29,52,0.06)] transition-shadow hover:shadow-[0px_14px_36px_0px_rgba(27,29,52,0.12)]"
    >
      <div className="relative aspect-[300/212] w-full overflow-hidden bg-mist">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundImage: "linear-gradient(135deg, #2a5eec, #0d1f52)" }}
          />
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue">
          {tag}
          {date ? <span className="text-ink-muted"> · {date}</span> : null}
        </p>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink">{title}</h3>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue">
          Read
          <ArrowRightIcon className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
