import Container from "@/components/ui/Container";
import Link from "next/link";

export default function AnnouncementBar() {
  return (
    <div
      className="text-[13px]"
      style={{
        backgroundImage:
          "linear-gradient(185deg, #145ec6 29%, #1449c6 88%)",
      }}
    >
      <Container className="flex h-10 items-center justify-between">
        <p className="truncate text-[11px] uppercase tracking-[0.08em] text-white/90">
          Apostolos · One who is sent on a mission
        </p>
        <Link
          href="https://www.amacademy.org"
          className="hidden shrink-0 text-white/90 hover:text-white sm:block"
        >
          AM Academy
        </Link>
      </Container>
    </div>
  );
}
