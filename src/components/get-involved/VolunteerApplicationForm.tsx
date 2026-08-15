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

function YesNoQuestion({
  number,
  question,
  followUp,
  fieldName,
}: {
  number: number;
  question: string;
  followUp: string;
  fieldName: string;
}) {
  return (
    <div className="border-t border-black/10 pt-6 first:border-t-0 first:pt-0">
      <p className="text-sm text-ink">
        <span className="font-semibold">{number}.</span> {question}
      </p>
      <div className="mt-3 flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="radio" name={`${fieldName}`} value="Yes" required className="accent-brand-blue" />
          Yes
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="radio" name={`${fieldName}`} value="No" required className="accent-brand-blue" />
          No
        </label>
      </div>
      <p className="mt-3 text-xs text-ink-muted">{followUp}</p>
      <textarea name={`${fieldName}Explanation`} rows={2} className={`${inputClass} mt-2`} />
    </div>
  );
}

export default function VolunteerApplicationForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(
      Array.from(data.entries()).filter(([, value]) => value !== ""),
    );

    try {
      const res = await fetch("/api/volunteer-applications", {
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
          Your application has been received. Our team will review it and follow up with next
          steps.
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
        Volunteer Application
      </h2>
      <p className="mt-2 text-sm text-ink-muted">Local Mission Teammate</p>

      <div className="mt-8 border-t border-black/10 pt-8">
        <h3 className="text-sm font-semibold text-ink">Basic Program Description</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          A mission teammate is faithful for participating in and planning evangelistic methods
          that align with the chapter&rsquo;s goal for growth. They will strategize various
          methods to reach the student body effectively. Their focus will be to foster an
          environment of spiritual growth and discipleship among college students. The team is a
          community of believers centered on the Word and fellowship with a heart to spread the
          Gospel across university campuses worldwide.
        </p>
      </div>

      <div className="mt-8 border-t border-black/10 pt-8">
        <h3 className="text-sm font-semibold text-ink">Personal Qualifications</h3>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
          Spiritual Standard
        </p>
        <div className="mt-3 space-y-2">
          <label className="flex items-start gap-2.5 text-sm text-ink">
            <input type="checkbox" required className="mt-0.5 accent-brand-blue" />
            Must affirm the Apostolos Missions International Statement of Faith and support the
            vision and mission of the ministry.
          </label>
          <label className="flex items-start gap-2.5 text-sm text-ink">
            <input type="checkbox" required className="mt-0.5 accent-brand-blue" />
            Must indicate firm faith and basic understanding of Biblical doctrine.
          </label>
        </div>
      </div>

      <div className="mt-8 border-t border-black/10 pt-8">
        <h3 className="text-sm font-semibold text-ink">Personal Information</h3>

        <div className="mt-4">
          <Label required>Full Name</Label>
          <input name="fullName" required className={inputClass} />
        </div>
        <div className="mt-4">
          <Label required>Address</Label>
          <input name="address" required className={inputClass} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>City</Label>
            <input name="city" required className={inputClass} />
          </div>
          <div>
            <Label required>State/Province</Label>
            <input name="stateProvince" required className={inputClass} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Country</Label>
            <input name="country" required className={inputClass} />
          </div>
          <div>
            <Label required>Zip Code</Label>
            <input name="zipCode" required className={inputClass} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Telephone</Label>
            <input type="tel" name="telephone" required className={inputClass} />
          </div>
          <div>
            <Label required>Email</Label>
            <input type="email" name="email" required className={inputClass} />
          </div>
        </div>
        <div className="mt-4">
          <Label required>Availability</Label>
          <input name="availability" required className={inputClass} />
        </div>

        <div className="mt-6">
          <Label required>Why would you like to be involved as an AM Volunteer?</Label>
          <textarea name="whyVolunteer" required rows={3} className={inputClass} />
        </div>
        <div className="mt-4">
          <Label required>Share your testimony.</Label>
          <textarea name="testimony" required rows={3} className={inputClass} />
        </div>
        <div className="mt-4">
          <Label required>What do you believe are your gifts and talents?</Label>
          <textarea name="giftsAndTalents" required rows={3} className={inputClass} />
        </div>
      </div>

      <div className="mt-8 border-t border-black/10 pt-8">
        <h3 className="text-sm font-semibold text-ink">Volunteer Terms and Conditions</h3>
        <p className="mt-3 text-sm text-ink-muted">
          As a registered volunteer for Apostolos Missions International&rsquo;s local chapter at:
        </p>
        <div className="mt-3">
          <Label required>Name of Church/Organization</Label>
          <input name="churchOrgName" required className={inputClass} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          and for all volunteer related events and activities, you do hereby discharge Apostolos
          Missions International, the event site, their management, officers, board members,
          employees, members, volunteers, representatives and their successors, and all
          cooperating organizations, from all claims of damages, demands, actions and causes
          whatsoever in any manner arising from or growing out of your participation in an
          Apostolos Missions International activity or event. As a volunteer, you agree to
          indemnify and hold Apostolos Missions International harmless for all fines, penalties,
          fees and expenses incurred as a result of or related to any breach of contractual
          obligation to the participant. By completing and submitting this form to Apostolos
          Missions International you understand and agree to the following:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-muted">
          <li>
            I will conduct all volunteer activities with high standards and professionalism, and
            will do nothing to cause detriment to the reputation or goodwill of Apostolos Missions
            International (AM).
          </li>
          <li>I agree and support the AM Mission Statement and Statement of Faith.</li>
          <li>
            I declare the information provided by me in this Application is true, correct and
            complete, and intend to be legally bound by its terms.
          </li>
        </ul>
        <p className="mt-4 text-sm font-semibold text-ink">By My Signature Below, I:</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">Understand:</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-muted">
          <li>
            That Apostolos Missions International is an equal-opportunity employer and does not
            discriminate on the basis of any protected classification (race, gender, national
            origin, citizenship, age, marital status, disability).
          </li>
          <li>
            That the offer I have received for a position with Apostolos Missions International
            (volunteer) is conditional on the completion and review of the information provided.
          </li>
        </ul>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">Agree to:</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-muted">
          <li>Furnish the following background information (see next section).</li>
        </ul>
      </div>

      <div className="mt-8 border-t border-black/10 pt-8">
        <h3 className="text-sm font-semibold text-ink">Background Information</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          If you live in a state whose law exempts you from answering any of questions 1 through 6
          below, you need not answer such question(s). For example, in certain states such as
          Colorado, Illinois, Ohio, Oklahoma or Rhode Island, if you are the subject of a
          conviction or an arrest contained in a sealed or expunged record, you may respond
          &ldquo;no&rdquo; to question 1 as to such a conviction or arrest. Also, if you lived in a
          state which exempts you from providing arrest information, such as Michigan, Illinois,
          New York, Rhode Island, Washington or Wisconsin, do not answer question 2.
        </p>

        <div className="mt-6 space-y-6">
          <YesNoQuestion
            number={1}
            fieldName="q1Convicted"
            question="Have you ever been convicted of a criminal offense (felony or misdemeanor, except for minor traffic violations)? This includes plea agreements, deferred sentences, or deferred judgment arrangements."
            followUp="If yes, attach a statement including the nature of the offense, date, court where conviction was entered, and any other relevant information."
          />
          <YesNoQuestion
            number={2}
            fieldName="q2SexualOffense"
            question="Have you ever been charged with a sexual offense, crime of violence, or offense relating to children?"
            followUp="If yes, attach a statement including the name of the offense charged, date, law enforcement agency making the charge, and any other relevant information."
          />
          <YesNoQuestion
            number={3}
            fieldName="q3ReportedAgency"
            question="Have you ever been reported to a social services agency, law enforcement authority, child abuse registry, or similar organization regarding abuse or misconduct involving children?"
            followUp="If so, describe the circumstances and the name and address of the entity receiving the report."
          />
          <YesNoQuestion
            number={4}
            fieldName="q4ChurchDiscipline"
            question="Have you ever been subjected to expulsion, reprimand, or other discipline by a church, denomination, or other religious organization, including Apostolos Missions International?"
            followUp="If so, describe the circumstances and provide the name and address of the church, denomination, or religious organization involved."
          />
          <YesNoQuestion
            number={5}
            fieldName="q5DismissedEmployment"
            question="Have you ever been dismissed from employment by any employer, including Apostolos Missions International and/or other charitable and religious organizations, following an allegation of sexual misconduct or other immoral or inappropriate behavior or conduct?"
            followUp="If so, describe the circumstances and provide the name and address of the employer."
          />
          <YesNoQuestion
            number={6}
            fieldName="q6Investigation"
            question="Have you ever been the subject of an investigation or allegation of sexual misconduct, sexual harassment, or other immoral behavior or conduct involving adults or children?"
            followUp="If so, describe the circumstances and provide the name and address of the employer, educational institution, church, or other organization where the investigation, review, or complaint occurred."
          />
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink-muted">
          If you checked &ldquo;yes&rdquo; to any question above, please provide a complete
          explanation of the circumstances, including any extenuating circumstances such as your
          age at the time. You may attach additional pages if needed. Apostolos Missions
          International will evaluate your response and may conduct a background screening, which
          could include a National Criminal Database check, Social Security search, National Sex
          Offenders Registry check, and Motor Vehicle Records check. A &ldquo;yes&rdquo; answer
          does not result in automatic disqualification, but AM reserves the right to determine,
          at its discretion, what action should be taken. Untruthful or inaccurate responses may
          disqualify you from association with the ministry.
        </p>
      </div>

      <div className="mt-8 border-t border-black/10 pt-8">
        <h3 className="text-sm font-semibold text-ink">Agreement and Signature</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          By signing below, you agree that if you become an employee or volunteer of Apostolos
          Missions International, and become involved in criminal proceedings or other
          circumstances that would change your answers to any of the questions above, you will
          immediately notify the Director of Human Resources of Apostolos Missions International
          with a complete description of the circumstances. To serve with Apostolos Missions
          International, it is required that you sign below indicating your agreement with the
          Consent and Release. You must also sign the Statement of Agreement, which includes
          Apostolos Missions International&rsquo;s Purpose and Doctrinal Basis. Mail the signed
          hard copies with your application, or sign using the electronic signature format
          outlined at the beginning of the application.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Signature</Label>
            <input name="signature" required className={inputClass} />
          </div>
          <div>
            <Label required>Today&rsquo;s Date (YYYY-MM-DD)</Label>
            <input name="signatureDate" required placeholder="YYYY-MM-DD" className={inputClass} />
          </div>
        </div>
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
