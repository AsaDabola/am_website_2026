import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";

const stats = [
  { value: "2003", label: "Sending since" },
  { value: "Trenton", label: "New Jersey, USA" },
  { value: "Global", label: "Campus network" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-night">
      <PlaceholderPhoto
        className="absolute inset-0 opacity-90"
        from="#1c3f8c"
        to="#050a2e"
        label="AM campus photography"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-transparent" />

      <Container className="relative flex min-h-[720px] flex-col justify-center py-24">
        <Eyebrow tone="light">Apostolos — one who is sent</Eyebrow>

        <h1 className="max-w-2xl font-display text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-white [text-shadow:0px_4px_14px_rgba(0,0,0,0.4)] sm:text-6xl lg:text-[80px]">
          Future Begins <span className="text-[#c5ddff]">from Where</span>
          <br />
          <span className="text-[#c5ddff]">We Are</span>.
        </h1>

        <div className="mt-9 flex flex-wrap gap-4">
          <Button href="/bible-study" variant="solidNavy">
            Join our Bible Study
          </Button>
          <Button href="/about" variant="outlineLight" icon={false}>
            Who we are
          </Button>
        </div>

        <div className="mt-16 flex max-w-xl divide-x divide-white/30 border-t border-white/30 pt-6">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 first:pl-0">
              <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-[13px] text-on-dark">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>

      <p className="absolute bottom-8 right-6 hidden text-[11px] uppercase tracking-[0.15em] text-on-dark/45 lg:right-10 lg:block">
        Drag to explore
      </p>
    </section>
  );
}
