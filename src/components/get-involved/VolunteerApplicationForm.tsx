"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangleIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/icons";

/**
 * The application is long — nine personal fields, three essays, six screening
 * questions and a signature — and asking for all of it on one page is what the
 * design set out to fix. It is the same set of answers and the same payload as
 * before; only the pacing changed, so the `volunteer-applications` collection
 * is untouched.
 *
 * Every answer lives in one `values` object rather than in the DOM, because
 * only the active step is mounted: unmounting a step would take its inputs'
 * values with it, and the review step needs all five steps at once.
 */

type Values = Record<string, string>;

const inputClass =
  "h-12 w-full rounded-[10px] border border-black/10 bg-white px-3.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";
const textareaClass =
  "w-full rounded-[10px] border border-black/10 bg-white px-3.5 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-muted/60 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

/** The six screening questions, in the order the paper form asks them. */
const SCREENING = [
  {
    name: "q1Convicted",
    explanation: "q1Explanation",
    question:
      "Have you ever been convicted of a criminal offense (felony or misdemeanor, except for minor traffic violations)? This includes plea agreements, deferred sentences, or deferred judgment arrangements.",
    followUp:
      "If yes, include the nature of the offense, date, court where conviction was entered, and any other relevant information.",
  },
  {
    name: "q2SexualOffense",
    explanation: "q2Explanation",
    question:
      "Have you ever been charged with a sexual offense, crime of violence, or offense relating to children?",
    followUp:
      "If yes, include the name of the offense charged, date, law enforcement agency making the charge, and any other relevant information.",
  },
  {
    name: "q3ReportedAgency",
    explanation: "q3Explanation",
    question:
      "Have you ever been reported to a social services agency, law enforcement authority, child abuse registry, or similar organization regarding abuse or misconduct involving children?",
    followUp: "If so, describe the circumstances and the name and address of the entity receiving the report.",
  },
  {
    name: "q4ChurchDiscipline",
    explanation: "q4Explanation",
    question:
      "Have you ever been subjected to expulsion, reprimand, or other discipline by a church, denomination, or other religious organization, including Apostolos Missions International?",
    followUp:
      "If so, describe the circumstances and provide the name and address of the church, denomination, or religious organization involved.",
  },
  {
    name: "q5DismissedEmployment",
    explanation: "q5Explanation",
    question:
      "Have you ever been dismissed from employment by any employer, including Apostolos Missions International and/or other charitable and religious organizations, following an allegation of sexual misconduct or other immoral or inappropriate behavior or conduct?",
    followUp: "If so, describe the circumstances and provide the name and address of the employer.",
  },
  {
    name: "q6Investigation",
    explanation: "q6Explanation",
    question:
      "Have you ever been the subject of an investigation or allegation of sexual misconduct, sexual harassment, or other immoral behavior or conduct involving adults or children?",
    followUp:
      "If so, describe the circumstances and provide the name and address of the employer, educational institution, church, or other organization where the investigation, review, or complaint occurred.",
  },
] as const;

/**
 * `required` drives three things at once: whether Continue lets you past a
 * step, the tick in the sidebar checklist, and the progress bar. `review` is
 * what the last step reads back. Keeping them on one object is what stops the
 * three from drifting apart as fields are added.
 */
const STEPS = [
  {
    id: "personal",
    tab: "Personal",
    title: "Personal information",
    checklist: "Personal information",
    blurb:
      "Tell us a bit about yourself and how to reach you. This information is kept confidential and used only for volunteer administration.",
    required: ["fullName", "address", "city", "stateProvince", "country", "zipCode", "telephone", "email", "availability"],
    review: [
      ["Full name", "fullName"],
      ["Address", "address"],
      ["City", "city"],
      ["State / Province", "stateProvince"],
      ["Country", "country"],
      ["Zip / Postal code", "zipCode"],
      ["Telephone", "telephone"],
      ["Email", "email"],
      ["Availability", "availability"],
    ],
  },
  {
    id: "calling",
    tab: "Your Calling",
    title: "Your calling",
    checklist: "Your calling",
    blurb:
      "In your own words: why you want to serve, what God has done in your life, and what you bring to a chapter.",
    required: ["whyVolunteer", "testimony", "giftsAndTalents"],
    review: [
      ["Why volunteer", "whyVolunteer"],
      ["Testimony", "testimony"],
      ["Gifts and talents", "giftsAndTalents"],
    ],
  },
  {
    id: "background",
    tab: "Background",
    title: "Background information",
    checklist: "Background information",
    blurb:
      "If you live in a state whose law exempts you from answering any of the questions below, you need not answer it. For example, in Colorado, Illinois, Ohio, Oklahoma or Rhode Island, if you are the subject of a conviction or an arrest contained in a sealed or expunged record, you may answer “no” to question 1 as to that conviction or arrest. If you lived in a state that exempts you from providing arrest information — Michigan, Illinois, New York, Rhode Island, Washington or Wisconsin — do not answer question 2.",
    required: SCREENING.map((q) => q.name),
    review: SCREENING.map((q, index) => [`Question ${index + 1}`, q.name] as [string, string]),
  },
  {
    id: "agreement",
    tab: "Agreement",
    title: "Agreement & signature",
    checklist: "Agreement & signature",
    blurb:
      "Read the terms below, name the chapter you are serving with, and sign to confirm your answers are true and complete.",
    required: ["affirmFaith", "affirmDoctrine", "churchOrgName", "signature", "signatureDate"],
    review: [
      ["Church / organization", "churchOrgName"],
      ["Signature", "signature"],
      ["Date", "signatureDate"],
    ],
  },
  {
    id: "review",
    tab: "Review",
    title: "Review & submit",
    checklist: "Review & submit",
    blurb: "Check your answers. Use Edit to go back to any step — nothing is sent until you submit.",
    required: [],
    review: [],
  },
] as const;

/**
 * The two affirmations gate the form but are not columns on the collection —
 * they always have to be true for an application to exist, so storing them
 * would record the same word against every row.
 */
const NOT_SUBMITTED = new Set(["affirmFaith", "affirmDoctrine"]);

function Label({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
      {children}
      <span className="font-extrabold text-brand-blue">*</span>
    </label>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
  values,
  onChange,
  invalid,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  values: Values;
  onChange: (name: string, value: string) => void;
  invalid: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={values[name] ?? ""}
        onChange={(event) => onChange(name, event.target.value)}
        aria-invalid={invalid || undefined}
        className={`${inputClass} ${invalid ? "border-red-500" : ""}`}
      />
    </div>
  );
}

function TextField({
  name,
  label,
  placeholder,
  rows = 4,
  values,
  onChange,
  invalid,
}: {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  values: Values;
  onChange: (name: string, value: string) => void;
  invalid: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        value={values[name] ?? ""}
        onChange={(event) => onChange(name, event.target.value)}
        aria-invalid={invalid || undefined}
        className={`${textareaClass} ${invalid ? "border-red-500" : ""}`}
      />
    </div>
  );
}

function Affirmation({
  name,
  children,
  values,
  onChange,
  invalid,
}: {
  name: string;
  children: ReactNode;
  values: Values;
  onChange: (name: string, value: string) => void;
  invalid: boolean;
}) {
  return (
    <label className={`flex items-start gap-2.5 text-sm leading-relaxed ${invalid ? "text-red-600" : "text-ink"}`}>
      <input
        type="checkbox"
        checked={values[name] === "yes"}
        onChange={(event) => onChange(name, event.target.checked ? "yes" : "")}
        className="mt-0.5 size-4 shrink-0 accent-brand-blue"
      />
      {children}
    </label>
  );
}

export default function VolunteerApplicationForm() {
  const [values, setValues] = useState<Values>({});
  const [current, setCurrent] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const topRef = useRef<HTMLDivElement>(null);

  const set = (name: string, value: string) => {
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const isComplete = useMemo(
    () => STEPS.map((step) => step.required.every((name) => (values[name] ?? "").trim() !== "")),
    [values],
  );
  // Review has nothing to fill in, so `every` on its empty list is vacuously
  // true. Counting it would put the bar past full before anything was typed.
  const fillable = STEPS.filter((entry) => entry.required.length > 0).length;
  const completedCount = isComplete.filter(
    (complete, index) => complete && STEPS[index].required.length > 0,
  ).length;
  const step = STEPS[current];
  const missing = (name: string) => showErrors && (values[name] ?? "").trim() === "";

  /**
   * Scrolls to the top of the wizard rather than the top of the page: the
   * stepper is the thing that has to be visible after a step change, and the
   * page header above it is a screenful of its own.
   */
  function goTo(index: number, keepErrors = false) {
    setCurrent(index);
    setShowErrors(keepErrors);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleContinue() {
    if (!isComplete[current]) {
      setShowErrors(true);
      return;
    }
    const next = Math.min(current + 1, STEPS.length - 1);
    setFurthest((previous) => Math.max(previous, next));
    goTo(next);
  }

  async function handleSubmit() {
    // Every step, not just the last: a field can be cleared after its step was
    // passed, and the review screen is the only place that would show it.
    const firstIncomplete = isComplete.findIndex((complete) => !complete);
    if (firstIncomplete !== -1) {
      goTo(firstIncomplete, true);
      return;
    }

    setStatus("submitting");
    const payload = Object.fromEntries(
      Object.entries(values).filter(([name, value]) => value !== "" && !NOT_SUBMITTED.has(name)),
    );

    try {
      const res = await fetch("/api/volunteer-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
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
    <div ref={topRef} className="scroll-mt-24">
      {/* Amber rather than the site palette on purpose: this is the one thing
          on the page that has to stop the reader, and neither `mist` nor
          `brand-blue` reads as a caution. No tokens for it — it appears once. */}
      <div className="flex items-start gap-4 border-s-[6px] border-[#b45309] bg-[#fffbeb] px-6 py-4">
        <span className="mt-0.5 shrink-0 text-[#b45309]">
          <AlertTriangleIcon />
        </span>
        <p className="text-sm leading-relaxed text-[#b45309]">
          All positions with AM International, paid or volunteer, are conditional on the completion
          and review of the background information in Step 3. Please have your church or
          organization name on hand before you begin.
        </p>
      </div>

      {/* `min-w-0` on both columns is load-bearing: a grid item's automatic
          minimum size is its content's min-content width, and the stepper's row
          of nowrap labels is ~690px wide. Without it the track — and with it the
          whole page — grows past a phone screen instead of the stepper
          scrolling inside its own box. */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="min-w-0">
          {/* Scrolls sideways rather than wrapping: five numbered steps stacked
              over two lines stop reading as one track. Below `sm` the labels
              come off entirely so all five fit at once — the step's name is
              already the heading of the card directly beneath. */}
          <ol className="flex items-center gap-3 overflow-x-auto pb-1">
            {STEPS.map((entry, index) => {
              const reachable = index <= furthest;
              const active = index === current;
              const done = isComplete[index] && index < current;
              return (
                <li key={entry.id} className="flex flex-1 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => reachable && goTo(index)}
                    disabled={!reachable}
                    aria-current={active ? "step" : undefined}
                    className="flex shrink-0 items-center gap-2.5 disabled:cursor-default"
                  >
                    <span
                      className={`flex size-7 items-center justify-center rounded-full text-[13px] font-extrabold ${
                        active || done
                          ? "bg-brand-blue text-white"
                          : "border border-ink-muted/50 bg-white text-ink-muted/80"
                      }`}
                    >
                      {done ? <CheckIcon /> : index + 1}
                    </span>
                    <span
                      className={`hidden whitespace-nowrap text-[13px] sm:inline ${
                        active ? "font-bold text-ink" : "font-semibold text-ink-muted/80"
                      }`}
                    >
                      {entry.tab}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      // Not `bg-mist`: this section's background is mist, so a
                      // mist connector is invisible and the five circles stop
                      // reading as one track.
                      className={`h-1 min-w-4 flex-1 rounded-full ${
                        index < current ? "bg-brand-blue" : "bg-black/10"
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-5 rounded-2xl border border-black/10 bg-white p-6 shadow-[0px_8px_12px_0px_rgba(0,0,0,0.05)] sm:p-8">
            <h3 className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-ink">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.blurb}</p>

            <div className="mt-6 space-y-4">
              {step.id === "personal" && (
                <>
                  <Field name="fullName" label="Full name" placeholder="First and last name" values={values} onChange={set} invalid={missing("fullName")} />
                  <Field name="address" label="Address" placeholder="Street address" values={values} onChange={set} invalid={missing("address")} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field name="city" label="City" placeholder="City" values={values} onChange={set} invalid={missing("city")} />
                    <Field name="stateProvince" label="State/Province" placeholder="State / Province" values={values} onChange={set} invalid={missing("stateProvince")} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field name="country" label="Country" placeholder="Country" values={values} onChange={set} invalid={missing("country")} />
                    <Field name="zipCode" label="Zip/Postal code" placeholder="Zip / Postal code" values={values} onChange={set} invalid={missing("zipCode")} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field name="telephone" label="Telephone" type="tel" placeholder="Phone number" values={values} onChange={set} invalid={missing("telephone")} />
                    <Field name="email" label="Email" type="email" placeholder="Email address" values={values} onChange={set} invalid={missing("email")} />
                  </div>
                  <TextField name="availability" label="Availability" rows={4} placeholder="Tell us your typical availability (days, hours, frequency)…" values={values} onChange={set} invalid={missing("availability")} />
                </>
              )}

              {step.id === "calling" && (
                <>
                  <TextField name="whyVolunteer" label="Why would you like to be involved as an AM volunteer?" values={values} onChange={set} invalid={missing("whyVolunteer")} />
                  <TextField name="testimony" label="Share your testimony." values={values} onChange={set} invalid={missing("testimony")} />
                  <TextField name="giftsAndTalents" label="What do you believe are your gifts and talents?" values={values} onChange={set} invalid={missing("giftsAndTalents")} />
                </>
              )}

              {step.id === "background" && (
                <>
                  {SCREENING.map((question, index) => (
                    <fieldset
                      key={question.name}
                      className="border-t border-black/10 pt-5 first:border-t-0 first:pt-0"
                    >
                      <legend className="sr-only">Question {index + 1}</legend>
                      <p className={`text-sm leading-relaxed ${missing(question.name) ? "text-red-600" : "text-ink"}`}>
                        <span className="font-semibold">{index + 1}.</span> {question.question}
                      </p>
                      <div className="mt-3 flex gap-6">
                        {["Yes", "No"].map((answer) => (
                          <label key={answer} className="flex items-center gap-2 text-sm text-ink">
                            <input
                              type="radio"
                              name={question.name}
                              value={answer}
                              checked={values[question.name] === answer}
                              onChange={() => set(question.name, answer)}
                              className="size-4 accent-brand-blue"
                            />
                            {answer}
                          </label>
                        ))}
                      </div>
                      {values[question.name] === "Yes" && (
                        <>
                          <p className="mt-3 text-xs leading-relaxed text-ink-muted">{question.followUp}</p>
                          <textarea
                            rows={3}
                            aria-label={`Explanation for question ${index + 1}`}
                            value={values[question.explanation] ?? ""}
                            onChange={(event) => set(question.explanation, event.target.value)}
                            className={`${textareaClass} mt-2`}
                          />
                        </>
                      )}
                    </fieldset>
                  ))}
                  <p className="border-t border-black/10 pt-5 text-xs leading-relaxed text-ink-muted">
                    A “yes” answer does not disqualify you. AM will evaluate your response and may
                    conduct a background screening, which could include a National Criminal
                    Database check, Social Security search, National Sex Offenders Registry check
                    and Motor Vehicle Records check, and reserves the right to determine what
                    action to take. Untruthful or inaccurate responses may disqualify you from
                    association with the ministry.
                  </p>
                </>
              )}

              {step.id === "agreement" && (
                <>
                  <div className="space-y-2.5">
                    <Affirmation name="affirmFaith" values={values} onChange={set} invalid={missing("affirmFaith")}>
                      I affirm the Apostolos Missions International Statement of Faith and support
                      the vision and mission of the ministry.
                    </Affirmation>
                    <Affirmation name="affirmDoctrine" values={values} onChange={set} invalid={missing("affirmDoctrine")}>
                      I indicate firm faith and a basic understanding of Biblical doctrine.
                    </Affirmation>
                  </div>

                  <Field name="churchOrgName" label="Name of church / organization" placeholder="The chapter you are serving with" values={values} onChange={set} invalid={missing("churchOrgName")} />

                  {/* The terms as they stand on the paper form. Scrollable so a
                      long legal block does not push the signature off the
                      bottom of a phone screen. */}
                  <div className="max-h-72 space-y-3 overflow-y-auto rounded-[10px] border border-black/10 bg-paper p-4 text-xs leading-relaxed text-ink-muted">
                    <p>
                      As a registered volunteer for Apostolos Missions International’s local
                      chapter named above, and for all volunteer related events and activities, you
                      do hereby discharge Apostolos Missions International, the event site, their
                      management, officers, board members, employees, members, volunteers,
                      representatives and their successors, and all cooperating organizations, from
                      all claims of damages, demands, actions and causes whatsoever in any manner
                      arising from or growing out of your participation in an Apostolos Missions
                      International activity or event. As a volunteer, you agree to indemnify and
                      hold Apostolos Missions International harmless for all fines, penalties, fees
                      and expenses incurred as a result of or related to any breach of contractual
                      obligation to the participant.
                    </p>
                    <p className="font-semibold text-ink">By submitting this form you agree that:</p>
                    <ul className="list-disc space-y-1.5 ps-5">
                      <li>
                        You will conduct all volunteer activities with high standards and
                        professionalism, and will do nothing to cause detriment to the reputation or
                        goodwill of Apostolos Missions International.
                      </li>
                      <li>You agree with and support the AM Mission Statement and Statement of Faith.</li>
                      <li>
                        The information provided in this application is true, correct and complete,
                        and you intend to be legally bound by its terms.
                      </li>
                    </ul>
                    <p className="font-semibold text-ink">You understand that:</p>
                    <ul className="list-disc space-y-1.5 ps-5">
                      <li>
                        Apostolos Missions International is an equal-opportunity employer and does
                        not discriminate on the basis of any protected classification (race, gender,
                        national origin, citizenship, age, marital status, disability).
                      </li>
                      <li>
                        Any offer of a position, paid or volunteer, is conditional on the completion
                        and review of the information provided.
                      </li>
                      <li>
                        If you later become involved in criminal proceedings or other circumstances
                        that would change any answer above, you will immediately notify the Director
                        of Human Resources with a complete description of the circumstances.
                      </li>
                    </ul>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field name="signature" label="Signature" placeholder="Type your full legal name" values={values} onChange={set} invalid={missing("signature")} />
                    <Field name="signatureDate" label="Today’s date" type="date" values={values} onChange={set} invalid={missing("signatureDate")} />
                  </div>
                </>
              )}

              {step.id === "review" && (
                <div className="space-y-6">
                  {STEPS.slice(0, 4).map((entry, index) => (
                    <div key={entry.id} className="border-t border-black/10 pt-5 first:border-t-0 first:pt-0">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="font-display text-base font-extrabold text-ink">{entry.title}</h4>
                        <button
                          type="button"
                          onClick={() => goTo(index)}
                          className="text-sm font-bold text-brand-blue hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <dl className="mt-3 space-y-2">
                        {entry.review.map(([label, name]) => {
                          // A "yes" on a screening question is only half the
                          // answer; the explanation is the half that matters,
                          // and this is the last chance to check it.
                          const explanation = SCREENING.find((q) => q.name === name)?.explanation;
                          const detail = explanation ? values[explanation]?.trim() : "";
                          return (
                            // Answers are free text: an unbroken email or URL is
                            // one long word, and a grid item's automatic minimum
                            // size is that word's width. `min-w-0` lets the track
                            // stay narrow and `break-words` wraps inside it.
                            <div key={name} className="grid gap-1 sm:grid-cols-[200px_1fr] sm:gap-4">
                              <dt className="min-w-0 text-sm font-semibold text-ink">{label}</dt>
                              <dd className="min-w-0 whitespace-pre-line break-words text-sm leading-relaxed text-ink-muted">
                                {values[name]?.trim() || "—"}
                                {detail && <span className="mt-1 block">{detail}</span>}
                              </dd>
                            </div>
                          );
                        })}
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showErrors && !isComplete[current] && (
              <p className="mt-5 text-sm text-red-600">
                Please complete the fields marked above before continuing.
              </p>
            )}
            {status === "error" && (
              <p className="mt-5 text-sm text-red-600">
                Something went wrong submitting your application. Please try again.
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/10 pt-4">
              <button
                type="button"
                onClick={() => goTo(Math.max(current - 1, 0))}
                disabled={current === 0}
                className="inline-flex h-11 items-center rounded-full border border-black/10 bg-white px-[18px] text-sm font-bold text-ink-muted transition-colors hover:bg-mist disabled:cursor-default disabled:opacity-60 disabled:hover:bg-white"
              >
                &larr; Back
              </button>

              {step.id === "review" ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={status === "submitting"}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-blue px-[22px] text-sm font-extrabold text-white transition-colors hover:bg-brand-navy disabled:opacity-60"
                >
                  {status === "submitting" ? "Submitting…" : "Submit application"}
                  <ArrowRightIcon />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-blue px-[22px] text-sm font-extrabold text-white transition-colors hover:bg-brand-navy"
                >
                  Continue
                  <ArrowRightIcon />
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <h4 className="font-display text-base font-extrabold text-ink">Your progress</h4>
            <div
              className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-mist"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={fillable}
              aria-valuenow={completedCount}
              aria-label="Application progress"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-navy-light transition-[width] duration-300"
                style={{ width: `${(completedCount / fillable) * 100}%` }}
              />
            </div>
            <ul className="mt-3.5 space-y-2.5">
              {STEPS.map((entry, index) => (
                <li key={entry.id} className="flex items-center gap-2.5">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                      isComplete[index] && entry.required.length > 0
                        ? "border-brand-blue bg-brand-blue text-white"
                        : "border-black/10"
                    }`}
                  >
                    {isComplete[index] && entry.required.length > 0 && <CheckIcon className="size-3" />}
                  </span>
                  <span className={`text-sm ${index === current ? "font-semibold text-ink" : "text-ink-muted"}`}>
                    {entry.checklist}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <h4 className="font-display text-base font-extrabold text-ink">Before you begin</h4>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
              Have on hand: your church or organization’s name, and enough detail to answer six
              background screening questions honestly and completely.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <h4 className="font-display text-base font-extrabold text-ink">Need help?</h4>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
              Questions about volunteering can be sent to{" "}
              <a href="mailto:volunteer@amintl.org" className="font-bold text-brand-blue hover:underline">
                volunteer@amintl.org
              </a>
              . Applications submitted through this form do not need to be emailed separately.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
