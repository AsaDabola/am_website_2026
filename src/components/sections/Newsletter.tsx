import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";

export default function Newsletter() {
  return (
    <section className="relative overflow-hidden">
      <PlaceholderPhoto className="absolute inset-0" from="#3a6cd8" to="#0a0e26" />
      <div className="absolute inset-0 bg-gradient-to-r from-night/80 via-night/40 to-transparent" />

      <Container className="relative flex flex-col items-start justify-center gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white">
            Field Notes from the Campuses
          </h2>
          <p className="mt-1 max-w-lg text-sm text-white/75">
            A short monthly letter: what students are seeing, where AM is
            going next, and how to pray.
          </p>
        </div>
        <Button href="https://www.amacademy.org" variant="solidNavy" className="shrink-0">
          AM Academy
        </Button>
      </Container>
    </section>
  );
}
