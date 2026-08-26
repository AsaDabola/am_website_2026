"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";

const inputClass =
  "h-12 w-full rounded-lg border border-black/[0.12] bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-brand-navy-deep focus:ring-2 focus:ring-brand-navy-deep/20";

const textareaClass =
  "min-h-[120px] w-full rounded-lg border border-black/[0.12] bg-white p-3.5 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-brand-navy-deep focus:ring-2 focus:ring-brand-navy-deep/20";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h3 className="border-b border-black/[0.12] pb-3 font-display text-base font-bold tracking-[-0.01em] text-ink">
        {title}
      </h3>
      <div className="mt-6 grid gap-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label} <span className="text-brand-navy-deep">*</span>
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/** One referee: the same four questions asked twice, so it is written once. */
function Reference({ index, label }: { index: 1 | 2; label: string }) {
  const key = `reference${index}`;
  return (
    <fieldset className="rounded-lg border border-black/[0.12] p-4 sm:p-5">
      <legend className="px-1 text-sm font-medium text-ink">{label}</legend>
      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Name" name={`${key}-name`}>
          <input
            id={`${key}-name`}
            name={`${key}.name`}
            required
            className={inputClass}
            placeholder="Enter name"
          />
        </Field>
        <Field label="Email" name={`${key}-email`}>
          <input
            id={`${key}-email`}
            name={`${key}.email`}
            type="email"
            required
            className={inputClass}
            placeholder="name@example.com"
          />
        </Field>
        <Field label="Phone" name={`${key}-phone`}>
          <input
            id={`${key}-phone`}
            name={`${key}.phone`}
            type="tel"
            required
            className={inputClass}
            placeholder="+1 (555) 000-0000"
          />
        </Field>
      </div>
      <div className="mt-6">
        <Field label="Relationship" name={`${key}-relationship`}>
          <input
            id={`${key}-relationship`}
            name={`${key}.relationship`}
            required
            className={inputClass}
            placeholder="e.g., pastor, mentor, supervisor"
          />
        </Field>
      </div>
    </fieldset>
  );
}

/**
 * The internship application. Posts to Payload's REST endpoint for the
 * internship-applications collection, which is what the collection's public
 * `create` access exists for.
 *
 * Field names carry the shape rather than the form doing it: a name like
 * `reference1.name` is expanded into a nested object before sending, because
 * the two referees are groups in the collection and a flat key would be
 * dropped on the way in.
 */
export default function InternshipApplicationForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const payload: Record<string, unknown> = {};

    for (const [key, raw] of new FormData(form).entries()) {
      const value = typeof raw === "string" ? raw : "";
      if (value === "") continue;

      const [group, child] = key.split(".");
      if (child) {
        const nested = (payload[group] ??= {}) as Record<string, unknown>;
        nested[child] = value;
      } else {
        // The two agreements arrive as "on" from a checked box; the
        // collection wants booleans.
        payload[key] = value === "on" ? true : value;
      }
    }

    try {
      const res = await fetch("/api/internship-applications", {
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
        <h3 className="font-display text-2xl font-semibold text-ink">Application received</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          Thank you. Our team will read it and come back to you about an interview and next
          steps.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-[0px_10px_30px_0px_rgba(27,29,52,0.08)] sm:p-10"
    >
      <h2 className="font-display text-[28px] font-bold tracking-[-0.02em] text-ink">
        Apply Now
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Please complete the form below. Fields marked with an asterisk (*) are required.
      </p>

      <Section title="Personal Information">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="First Name" name="firstName">
            <input id="firstName" name="firstName" required className={inputClass} placeholder="Enter first name" />
          </Field>
          <Field label="Last Name" name="lastName">
            <input id="lastName" name="lastName" required className={inputClass} placeholder="Enter last name" />
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Email Address" name="email">
            <input id="email" name="email" type="email" required className={inputClass} placeholder="name@example.com" />
          </Field>
          <Field label="Phone Number" name="phone">
            <input id="phone" name="phone" type="tel" required className={inputClass} placeholder="+1 (555) 000-0000" />
          </Field>
        </div>
        <Field label="Street Address" name="streetAddress">
          <input id="streetAddress" name="streetAddress" required className={inputClass} placeholder="Enter street address" />
        </Field>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="City" name="city">
            <input id="city" name="city" required className={inputClass} placeholder="City" />
          </Field>
          <Field label="State/Province" name="stateProvince">
            <input id="stateProvince" name="stateProvince" required className={inputClass} placeholder="State/Province" />
          </Field>
          <Field label="Zip Code" name="zipCode">
            <input id="zipCode" name="zipCode" required className={inputClass} placeholder="Zip" />
          </Field>
        </div>
        <Field label="Country" name="country">
          <input id="country" name="country" required className={inputClass} placeholder="Country" />
        </Field>
        <Field label="Date of Birth" name="dateOfBirth">
          <input id="dateOfBirth" name="dateOfBirth" required className={inputClass} placeholder="MM / DD / YYYY" />
        </Field>
      </Section>

      <Section title="Program Information">
        <Field label="Program Applying For" name="program">
          <select id="program" name="program" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select program
            </option>
            <option value="summer">Summer Internship</option>
            <option value="short-term">Short-term Internship</option>
            <option value="long-term">Long-term Internship</option>
          </select>
        </Field>
        <Field label="Preferred Start Date" name="preferredStartDate">
          <input id="preferredStartDate" name="preferredStartDate" required className={inputClass} placeholder="MM / YYYY" />
        </Field>
        <Field label="How did you hear about us?" name="howDidYouHear">
          <input id="howDidYouHear" name="howDidYouHear" required className={inputClass} placeholder="e.g., social media, friend, church" />
        </Field>
      </Section>

      <Section title="Background">
        <Field label="Education Level" name="educationLevel">
          <select id="educationLevel" name="educationLevel" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select education level
            </option>
            <option value="high-school">High school</option>
            <option value="some-college">Some college</option>
            <option value="undergraduate">Undergraduate degree</option>
            <option value="postgraduate">Postgraduate degree</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Church/Organization Name" name="churchName">
          <input id="churchName" name="churchName" required className={inputClass} placeholder="Enter church/organization" />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Pastor/Leader Name" name="leaderName">
            <input id="leaderName" name="leaderName" required className={inputClass} placeholder="Enter name" />
          </Field>
          <Field label="Pastor/Leader Contact" name="leaderContact">
            <input id="leaderContact" name="leaderContact" required className={inputClass} placeholder="Email or phone" />
          </Field>
        </div>
        <Field label="Brief statement about your faith journey" name="faithJourney">
          <textarea
            id="faithJourney"
            name="faithJourney"
            required
            className={textareaClass}
            placeholder="Tell us a little about your faith journey and what motivates you to serve."
          />
        </Field>
        <Field label="Why do you want to join this program?" name="whyThisProgram">
          <textarea
            id="whyThisProgram"
            name="whyThisProgram"
            required
            className={textareaClass}
            placeholder="What draws you to this program, and what do you hope to learn or accomplish?"
          />
        </Field>
      </Section>

      <Section title="References">
        <Reference index={1} label="Reference 1" />
        <Reference index={2} label="Reference 2" />
      </Section>

      <Section title="Agreement">
        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
          <input
            type="checkbox"
            name="confirmsAccurate"
            required
            className="mt-1 size-[18px] shrink-0 accent-brand-navy-deep"
          />
          I confirm that all information provided is accurate and complete.
        </label>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
          <input
            type="checkbox"
            name="agreesToTerms"
            required
            className="mt-1 size-[18px] shrink-0 accent-brand-navy-deep"
          />
          I agree to the terms and conditions and privacy policy.
        </label>
      </Section>

      {status === "error" && (
        <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          That did not send. Please check your connection and try again — nothing you have
          typed has been lost.
        </p>
      )}

      <div className="mt-10 flex items-center gap-6 border-t border-black/[0.12] pt-6">
        <span className="hidden flex-1 sm:block" />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-navy-deep px-7 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-brand-navy disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Submit Application"}
          <ArrowRightIcon />
        </button>
      </div>
    </form>
  );
}
