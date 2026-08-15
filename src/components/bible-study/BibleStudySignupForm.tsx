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

export default function BibleStudySignupForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      age: data.get("age"),
      maritalStatus: data.get("maritalStatus"),
      schoolName: data.get("schoolName") || undefined,
      graduationYear: data.get("graduationYear") || undefined,
      preferredTimes: data.get("preferredTimes"),
      email: data.get("email"),
      phone: data.get("phone"),
      testimony: data.get("testimony"),
      whyStudyBible: data.get("whyStudyBible"),
      howDidYouHear: data.get("howDidYouHear"),
      comments: data.get("comments") || undefined,
    };

    try {
      const res = await fetch("/api/bible-study-signups", {
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
          We&rsquo;ve received your information — one of our teachers will reach out with more
          details soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-8 shadow-[0px_10px_30px_0px_rgba(27,29,52,0.08)] sm:p-14"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-blue">
        Apostolos Missions International
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
        Join our Bible Studies
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        Fill out the form below and one of our teachers will reach out with more information.
      </p>

      <div className="mt-8 border-t border-black/10 pt-8">
        <h3 className="text-sm font-semibold text-ink">Personal Info</h3>

        <div className="mt-4">
          <Label required>Name</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="firstName" required placeholder="First" className={inputClass} />
            <input name="lastName" required placeholder="Last" className={inputClass} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Age</Label>
            <select name="age" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                — Select —
              </option>
              {["Under 18", "18–22", "23–27", "28–34", "35+"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label required>Marital Status</Label>
            <select name="maritalStatus" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                — Select —
              </option>
              {["Single", "Engaged", "Married", "Divorced", "Widowed"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Name of School (If applicable)</Label>
            <input name="schoolName" className={inputClass} />
          </div>
          <div>
            <Label>Graduation Year</Label>
            <input name="graduationYear" className={inputClass} />
          </div>
        </div>

        <div className="mt-4">
          <Label required>Tell us your preferred Bible study times</Label>
          <textarea name="preferredTimes" required rows={2} className={inputClass} />
        </div>
      </div>

      <div className="mt-8 border-t border-black/10 pt-8">
        <h3 className="text-sm font-semibold text-ink">Contact Info</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Email</Label>
            <input type="email" name="email" required className={inputClass} />
          </div>
          <div>
            <Label required>Phone</Label>
            <input type="tel" name="phone" required className={inputClass} />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-black/10 pt-8">
        <h3 className="text-sm font-semibold text-ink">Tell Us a Little Bit About Yourself</h3>

        <div className="mt-4">
          <Label required>Brief Testimony</Label>
          <textarea name="testimony" required rows={3} className={inputClass} />
        </div>

        <div className="mt-4">
          <Label required>Why would you like to study the Bible?</Label>
          <textarea name="whyStudyBible" required rows={3} className={inputClass} />
        </div>

        <div className="mt-4">
          <Label required>How did you hear about us?</Label>
          <select name="howDidYouHear" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              — Select —
            </option>
            {[
              "Friend or classmate",
              "Social media",
              "Campus event",
              "Church",
              "AM Academy",
              "Other",
            ].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <Label>Let us know any questions or comments you may have</Label>
          <textarea name="comments" rows={2} className={inputClass} />
        </div>
      </div>

      {status === "error" && (
        <p className="mt-6 text-sm text-red-600">
          Something went wrong submitting your form. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-8 py-4 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-brand-navy disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Submit"}
        <ArrowRightIcon />
      </button>
    </form>
  );
}
