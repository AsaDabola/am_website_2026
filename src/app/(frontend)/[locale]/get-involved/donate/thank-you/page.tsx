import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import AboutHero from "@/components/about/AboutHero";
import { getStripe } from "@/lib/stripe";
import withPageLayout from "@/components/pages/BuiltInPage";

// Sixty seconds, so a section added to this page in /admin appears without a
// deploy. Without it the page is fully static and the authored layout would be
// whatever it was at build time — see components/pages/BuiltInPage.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Thank You | AM International",
};

async function DonateThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  let amount: number | null = null;
  let frequency: string | null = null;

  if (sessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" || session.status === "complete") {
        amount = session.amount_total ? session.amount_total / 100 : null;
        frequency = (session.metadata?.frequency as string) ?? null;
      }
    } catch {
      // Fall through to the generic thank-you message below.
    }
  }

  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved", href: "/get-involved" },
          { label: "Donate", href: "/get-involved/donate" },
          { label: "Thank You" },
        ]}
        title="Thank You"
        subtitle="Your generosity is changing lives."
        backgroundImage="/images/donate-hero.webp"
      />

      <section className="bg-white py-24">
        <Container className="max-w-[700px] text-center">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Thank you for your gift!
          </h1>
          <p className="mx-auto mt-6 max-w-[560px] text-base leading-relaxed text-ink-muted">
            {amount
              ? `We've received your ${frequency?.toLowerCase() ?? ""} gift of $${amount.toLocaleString()}. `
              : "We've received your gift. "}
            A receipt has been sent to your email. Your support helps us spread the gospel and
            equip Christian leaders around the world — we&rsquo;re deeply grateful.
          </p>
          <Button href="/" variant="solid" className="mt-9">
            Return home
          </Button>
        </Container>
      </section>
    </>
  );
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/get-involved/donate/thank-you", DonateThankYouPage);
