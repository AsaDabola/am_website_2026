"use client";

import { useState, type FormEvent } from "react";

type InvoiceDoc = {
  id: string | number;
  status?: string;
  amountDue?: number;
  amountPaid?: number;
  dueDate?: string;
  hostedInvoiceUrl?: string;
  createdAt?: string;
  partner?: { id: string | number; name?: string } | string | number;
};

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

const statusStyles: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  open: "bg-blue-100 text-blue-700",
  void: "bg-gray-100 text-gray-600",
  uncollectible: "bg-red-100 text-red-700",
  draft: "bg-gray-100 text-gray-600",
};

function partnerName(partner: InvoiceDoc["partner"]) {
  if (partner && typeof partner === "object") return partner.name ?? "—";
  return "—";
}

export default function InvoiceManager({
  partners,
  invoices,
}: {
  partners: { id: string; name: string }[];
  invoices: InvoiceDoc[];
}) {
  const [partnerId, setPartnerId] = useState(partners[0]?.id ?? "");
  const [memo, setMemo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lineItems, setLineItems] = useState([{ description: "", amount: "" }]);
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [error, setError] = useState("");

  function updateLineItem(index: number, field: "description" | "amount", value: string) {
    setLineItems((items) =>
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId,
          memo,
          dueDate: dueDate || undefined,
          lineItems: lineItems.map((item) => ({
            description: item.description,
            amount: Number(item.amount),
          })),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Request failed");
      setStatus("success");
      setLineItems([{ description: "", amount: "" }]);
      setMemo("");
      setDueDate("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (partners.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-black/10 bg-white p-6 text-sm text-ink-muted">
        No partners yet — add one in the Partners collection in the admin panel first.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-black/10 bg-white p-8">
        <h2 className="font-display text-xl font-semibold text-ink">New invoice</h2>

        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-medium text-ink">Partner / chapter</label>
          <select
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className={inputClass}
          >
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-medium text-ink">
            Memo (shown to the partner)
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-medium text-ink">Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium text-ink">Line items</p>
          <div className="mt-2 space-y-3">
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_140px] gap-3">
                <input
                  placeholder="Description"
                  required
                  value={item.description}
                  onChange={(e) => updateLineItem(index, "description", e.target.value)}
                  className={inputClass}
                />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount"
                  required
                  value={item.amount}
                  onChange={(e) => updateLineItem(index, "amount", e.target.value)}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLineItems((items) => [...items, { description: "", amount: "" }])}
            className="mt-3 text-sm font-semibold text-brand-blue hover:underline"
          >
            + Add line item
          </button>
        </div>

        {status === "error" && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {status === "success" && (
          <p className="mt-4 text-sm text-green-700">Invoice sent to the partner&rsquo;s email.</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-blue px-8 py-3 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-brand-navy disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Create & send invoice"}
        </button>
      </form>

      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Invoices</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full min-w-[640px] text-start text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount due</th>
                <th className="px-4 py-3">Due date</th>
                <th className="px-4 py-3">Link</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ink-muted">
                    No invoices yet.
                  </td>
                </tr>
              )}
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3">{partnerName(invoice.partner)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[invoice.status ?? "draft"] ?? statusStyles.draft
                      }`}
                    >
                      {invoice.status ?? "draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {typeof invoice.amountDue === "number"
                      ? `$${invoice.amountDue.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {invoice.hostedInvoiceUrl ? (
                      <a
                        href={invoice.hostedInvoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-blue underline"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
