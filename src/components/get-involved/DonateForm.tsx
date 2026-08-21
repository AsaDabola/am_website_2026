"use client";

import { useState, type FormEvent } from "react";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

const frequencies = ["One-Time", "Monthly", "Yearly"] as const;
const amounts = [25, 50, 100, 250, 500, 1000];

export default function DonateForm() {
  const [frequency, setFrequency] = useState<(typeof frequencies)[number]>("One-Time");
  const [amount, setAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const selectedAmount = customAmount ? Number(customAmount) : amount;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAmount || selectedAmount <= 0) return;
    setStatus("submitting");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.get("fullName"),
          email: data.get("email"),
          amount: selectedAmount,
          frequency,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.url) throw new Error(result.error ?? "Request failed");
      window.location.href = result.url;
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-black/10 bg-white p-10">
      <div className="border-b border-black/10 pb-8">
        <p className="text-sm font-semibold text-ink">How often would you like to give?</p>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-mist p-1">
          {frequencies.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFrequency(option)}
              className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                frequency === option ? "bg-brand-blue text-white" : "text-ink-muted hover:text-ink"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-black/10 py-8">
        <p className="text-sm font-semibold text-ink">Choose an amount</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {amounts.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setAmount(value);
                setCustomAmount("");
              }}
              className={`rounded-lg border py-3 text-sm font-semibold transition-colors ${
                amount === value && !customAmount
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-black/10 text-ink hover:border-brand-blue"
              }`}
            >
              ${value.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink">
            Or enter a custom amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
              $
            </span>
            <input
              type="number"
              min="1"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              className={`${inputClass} ps-7`}
            />
          </div>
        </div>
      </div>

      <div className="border-b border-black/10 py-8">
        <p className="text-sm font-semibold text-ink">Your Information</p>
        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-medium text-ink">Full Name</label>
          <input name="fullName" required placeholder="First &amp; Last Name" className={inputClass} />
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink">Email</label>
          <input type="email" name="email" required placeholder="Email Address" className={inputClass} />
        </div>
      </div>

      <div className="py-8">
        <p className="text-sm font-semibold text-ink">Payment Information</p>
        <p className="mt-2 text-xs text-ink-muted">
          You&rsquo;ll be securely redirected to Stripe to complete your card payment. AM
          International never sees or stores your card details.
        </p>
      </div>

      {status === "error" && (
        <p className="mb-4 text-sm text-red-600">
          Something went wrong starting your donation. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || !selectedAmount}
        className="inline-flex w-full items-center justify-center rounded-full bg-brand-blue px-8 py-4 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-brand-navy disabled:opacity-60"
      >
        {status === "submitting"
          ? "Redirecting to secure payment…"
          : `Donate ${selectedAmount ? `$${selectedAmount.toLocaleString()}` : ""}`}
      </button>
    </form>
  );
}
