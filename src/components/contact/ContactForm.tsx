"use client";

import { useState, type FormEvent } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone") || undefined,
      subject: data.get("subject"),
      message: data.get("message") || undefined,
    };

    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-mist p-10 text-center">
        <h3 className="font-display text-2xl font-semibold text-ink">Message sent!</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Thanks for reaching out — we&rsquo;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-blue">
        Contact us
      </p>
      <div className="mt-4 border-t border-black/10 pt-6">
        <h3 className="text-sm font-semibold text-ink">Your Information</h3>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink">Name</label>
          <input name="name" required placeholder="First &amp; Last Name" className={inputClass} />
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink">Email</label>
          <input type="email" name="email" required placeholder="Email Address" className={inputClass} />
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink">Phone</label>
          <input type="tel" name="phone" placeholder="Phone Number" className={inputClass} />
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink">
            Subject<span className="ms-0.5 text-brand-blue">*</span>
          </label>
          <input name="subject" required placeholder="What's this about?" className={inputClass} />
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink">Message</label>
          <textarea
            name="message"
            rows={4}
            placeholder="Tell us how we can help you"
            className={inputClass}
          />
        </div>
      </div>

      {status === "error" && (
        <p className="mt-4 text-sm text-red-600">
          Something went wrong sending your message. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-8 py-4 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-brand-navy disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
        <ArrowRightIcon />
      </button>
    </form>
  );
}
