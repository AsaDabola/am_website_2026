import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import { PlayIcon } from "@/components/ui/icons";

const posts = [
  { title: "Four Spiritual Themes – Overview", date: "January 5, 2026" },
  {
    title: "What is Salvation? | Sola Fide Part 1 – AM Academy",
    date: "June 27, 2023",
  },
  {
    title:
      "Era of Social Media Discipleship, Connecting Students to Reality of the Gospel",
    date: "June 3, 2022",
  },
  { title: "God’s Promises For the New Year", date: "January 2, 2022" },
];

export default function Media() {
  return (
    <section
      className="relative overflow-hidden py-24"
      style={{ backgroundImage: "linear-gradient(120deg, #1449c6, #007aff)" }}
    >
      <p
        aria-hidden
        className="pointer-events-none absolute -right-4 top-4 hidden select-none font-display text-[220px] italic text-white/10 lg:block"
      >
        Sent
      </p>

      <Container className="relative">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <Eyebrow tone="light">Media</Eyebrow>
            <h2 className="max-w-md font-display text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
              Teaching, testimony and the Word.
            </h2>
          </div>
          <Button href="/news" variant="ghostLight" className="shrink-0">
            More contents
          </Button>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <button
            type="button"
            aria-label="Play the AM introduction video"
            className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl"
            style={{ backgroundImage: "linear-gradient(160deg, #10245e, #050a2e)" }}
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-brand-navy text-white shadow-lg transition-transform group-hover:scale-105">
              <PlayIcon className="size-6 translate-x-0.5" />
            </span>
          </button>

          <ul className="divide-y divide-white/15">
            {posts.map((post) => (
              <li key={post.title} className="py-5 first:pt-0">
                <Link href="/news" className="block">
                  <p className="font-display text-base font-semibold leading-snug text-white">
                    {post.title}
                  </p>
                  <p className="mt-2 text-xs text-white/60">{post.date}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
