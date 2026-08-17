import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import Container from "@/components/ui/Container";
import InvoiceManager from "@/components/internal/InvoiceManager";

export const metadata = { title: "Invoices | AM International" };
export const dynamic = "force-dynamic";

export default async function InternalInvoicesPage() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) {
    redirect("/admin/login?redirect=/internal/invoices");
  }

  const [partners, invoices] = await Promise.all([
    payload.find({ collection: "partners", limit: 200, sort: "name" }),
    payload.find({ collection: "invoices", limit: 100, sort: "-createdAt", depth: 1 }),
  ]);

  return (
    <section className="bg-mist py-16">
      <Container className="max-w-[1000px]">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
          Partner &amp; Chapter Invoices
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Create a Stripe invoice for a partner organization or chapter. It&rsquo;s emailed
          directly to their billing contact — they pay on their own schedule via the link in
          that email. Add new partners first in{" "}
          <a href="/admin/collections/partners" className="underline">
            the Partners collection
          </a>
          .
        </p>

        <InvoiceManager
          partners={partners.docs.map((p) => ({ id: String(p.id), name: p.name as string }))}
          invoices={invoices.docs}
        />
      </Container>
    </section>
  );
}
