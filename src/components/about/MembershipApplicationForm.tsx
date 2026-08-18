"use client";

import { useState, type FormEvent } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-ink">
      {children}
      {required && <span className="ml-0.5 text-brand-blue">*</span>}
    </label>
  );
}

export default function MembershipApplicationForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      ...Object.fromEntries(Array.from(data.entries()).filter(([, value]) => value !== "")),
      attestation: data.get("attestation") === "on",
    };

    try {
      const res = await fetch("/api/membership-applications", {
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
      <div className="rounded-2xl bg-white p-10 text-center shadow-[0px_10px_30px_0px_rgba(27,29,52,0.08)] sm:p-14">
        <h3 className="font-display text-2xl font-semibold text-ink">Thank you!</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Your membership application has been received. Your local chapter leaders will get in
          touch with you shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-8 shadow-[0px_10px_30px_0px_rgba(27,29,52,0.08)] sm:p-14"
    >
      <h2 className="text-center font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
        Membership Application
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink-muted">
        Fill out the form below to register. Your local chapter leaders will get in touch with
        you shortly.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <Label required>Full Name</Label>
          <input name="fullName" required placeholder="Enter your full name" className={inputClass} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Email Address</Label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@university.edu"
              className={inputClass}
            />
          </div>
          <div>
            <Label required>Phone Number</Label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+1 (555) 000-0000"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>University / Chapter</Label>
            <input
              name="chapter"
              required
              placeholder="e.g. Princeton AM Chapter"
              className={inputClass}
            />
          </div>
          <div>
            <Label required>Desired Membership Tier</Label>
            <select name="membershipTier" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Select your tier (Newcomer, Registered...)
              </option>
              {["Newcomer", "Registered", "Volunteer", "Staff", "Leader"].map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>Statement of Faith Agreement</Label>
          <select name="statementOfFaithAgreement" defaultValue="" className={inputClass}>
            <option value="" disabled>
              I agree and share the AM Statement of Faith
            </option>
            <option value="I agree and share the AM Statement of Faith">
              I agree and share the AM Statement of Faith
            </option>
          </select>
        </div>

        <div>
          <Label>Message / Notes</Label>
          <textarea
            name="message"
            rows={4}
            placeholder="Tell us about yourself, your faith journey, or any questions you have."
            className={inputClass}
          />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-ink">
          <input type="checkbox" name="attestation" required className="mt-0.5 accent-brand-blue" />
          By checking this, I verify that I am over 18 years of age and seek to learn more or
          register as a participant in AM.
        </label>
      </div>

      {status === "error" && (
        <p className="mt-6 text-sm text-red-600">
          Something went wrong submitting your application. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-8 py-4 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-brand-navy disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Submit application"}
        <ArrowRightIcon />
      </button>
    </form>
  );
}
