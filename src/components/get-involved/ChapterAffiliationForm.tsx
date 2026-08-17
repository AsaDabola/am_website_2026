"use client";

import { useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";

type LeaderRow = { name: string; role: string; email: string; phone: string };
type MemberRow = { name: string; email: string };

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

const steps = [
  "Chapter information",
  "Charter status",
  "Student leadership",
  "Current members",
  "Review and submit",
];

function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-ink">
      {children}
      {required && <span className="ml-0.5 text-brand-blue">*</span>}
    </label>
  );
}

function FileField({
  label,
  required,
  file,
  onChange,
}: {
  label: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-black/15 bg-mist px-3.5 py-3 text-sm text-ink-muted transition-colors hover:border-brand-blue">
        <span className="truncate">{file ? file.name : "Choose file…"}</span>
        <span className="ml-3 shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-brand-blue">
          Browse
        </span>
        <input
          type="file"
          required={required}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

async function uploadMedia(file: File, alt: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("alt", alt);
  const res = await fetch("/api/media", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json();
  return json.doc.id as string;
}

export default function ChapterAffiliationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [reference, setReference] = useState("");

  const [applicationType, setApplicationType] = useState("New chapter");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [targetUniversity, setTargetUniversity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [memberCount, setMemberCount] = useState("");

  const [chartered, setChartered] = useState<"Yes" | "No" | "">("");
  const [charterLetter, setCharterLetter] = useState<File | null>(null);
  const [constitutionFile, setConstitutionFile] = useState<File | null>(null);
  const [delayReason, setDelayReason] = useState("");

  const [leaderName, setLeaderName] = useState("");
  const [leaderRole, setLeaderRole] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [additionalLeaders, setAdditionalLeaders] = useState<LeaderRow[]>([]);
  const [leadershipChanges, setLeadershipChanges] = useState("");
  const [attestation, setAttestation] = useState(false);

  const [memberListFile, setMemberListFile] = useState<File | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);

  function goNext() {
    if (formRef.current?.reportValidity()) setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }
  function goTo(index: number) {
    setStep(index);
  }

  function updateLeader(index: number, patch: Partial<LeaderRow>) {
    setAdditionalLeaders((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function updateMember(index: number, patch: Partial<MemberRow>) {
    setMembers((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  async function handleSubmit() {
    setStatus("submitting");
    try {
      const [charterLetterId, constitutionId, memberListId] = await Promise.all([
        chartered === "Yes" && charterLetter
          ? uploadMedia(charterLetter, `${city} charter letter`)
          : Promise.resolve(undefined),
        chartered === "Yes" && constitutionFile
          ? uploadMedia(constitutionFile, `${city} chapter constitution`)
          : Promise.resolve(undefined),
        memberListFile
          ? uploadMedia(memberListFile, `${city} member list`)
          : Promise.resolve(undefined),
      ]);

      const res = await fetch("/api/chapter-affiliations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationType,
          city,
          country,
          targetUniversity,
          startDate,
          memberCount,
          chartered,
          charterLetter: charterLetterId,
          constitutionFile: constitutionId,
          delayReason,
          leaderName,
          leaderRole,
          leaderEmail,
          leaderPhone,
          additionalLeaders,
          leadershipChanges,
          attestation,
          memberListFile: memberListId,
          members,
        }),
      });
      if (!res.ok) throw new Error("Request failed");

      setReference(`AM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-[0px_10px_30px_0px_rgba(27,29,52,0.08)] sm:p-14">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
          <svg viewBox="0 0 24 24" fill="none" className="size-7">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold text-ink">
          Application received
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          Thank you for submitting your chapter affiliation application. Our team will review it
          and follow up with next steps.
        </p>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue">
          Reference {reference}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <ol className="space-y-1">
          {steps.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => (index < step ? goTo(index) : undefined)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  index === step
                    ? "bg-brand-blue text-white"
                    : index < step
                      ? "cursor-pointer text-ink hover:bg-mist"
                      : "text-ink-muted"
                }`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    index === step
                      ? "bg-white text-brand-blue"
                      : index < step
                        ? "bg-brand-blue text-white"
                        : "bg-mist text-ink-muted"
                  }`}
                >
                  {index < step ? "✓" : index + 1}
                </span>
                <span className="font-medium">{label}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-mist">
          <div
            className="h-full rounded-full bg-brand-blue transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="mt-6 rounded-xl bg-mist p-4 text-xs leading-relaxed text-ink-muted">
          Need help? Reach us at{" "}
          <a href="mailto:mission@amintl.org" className="font-semibold text-brand-blue">
            mission@amintl.org
          </a>
        </div>
      </aside>

      <form
        ref={formRef}
        onSubmit={(e) => e.preventDefault()}
        className="rounded-2xl bg-white p-8 shadow-[0px_10px_30px_0px_rgba(27,29,52,0.08)] sm:p-10"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-blue">
          Step {step + 1} of {steps.length}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
          {steps[step]}
        </h2>

        {step === 0 && (
          <div className="mt-8 space-y-5">
            <div>
              <Label required>Application type</Label>
              <div className="mt-1 flex gap-6">
                {["Annual reaffirmation", "New chapter"].map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="radio"
                      name="applicationType"
                      required
                      value={option}
                      checked={applicationType === option}
                      onChange={() => setApplicationType(option)}
                      className="accent-brand-blue"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label required>City</Label>
                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <Label required>Country</Label>
                <input
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <Label required>Target university</Label>
              <input
                required
                value={targetUniversity}
                onChange={(e) => setTargetUniversity(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label required>Chapter start date</Label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <Label required>Current member count</Label>
                <input
                  required
                  value={memberCount}
                  onChange={(e) => setMemberCount(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-8 space-y-5">
            <div>
              <Label required>Is the chapter chartered with the university?</Label>
              <div className="mt-1 flex gap-6">
                {["Yes", "No"].map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="radio"
                      name="chartered"
                      required
                      value={option}
                      checked={chartered === option}
                      onChange={() => setChartered(option as "Yes" | "No")}
                      className="accent-brand-blue"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {chartered === "Yes" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FileField
                  label="Letter of university acknowledgment"
                  required
                  file={charterLetter}
                  onChange={setCharterLetter}
                />
                <FileField
                  label="Chapter constitution"
                  required
                  file={constitutionFile}
                  onChange={setConstitutionFile}
                />
              </div>
            )}

            {chartered === "No" && (
              <div>
                <Label required>Why is the charter still pending?</Label>
                <textarea
                  required
                  rows={3}
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-ink">Chapter leader</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label required>Name</Label>
                  <input
                    required
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label required>Role</Label>
                  <input
                    required
                    value={leaderRole}
                    onChange={(e) => setLeaderRole(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label required>Email</Label>
                  <input
                    type="email"
                    required
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label required>Phone</Label>
                  <input
                    type="tel"
                    required
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-black/10 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Additional student leaders</h3>
                <button
                  type="button"
                  onClick={() =>
                    setAdditionalLeaders((rows) => [
                      ...rows,
                      { name: "", role: "", email: "", phone: "" },
                    ])
                  }
                  className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-blue"
                >
                  + Add another leader
                </button>
              </div>
              {additionalLeaders.map((row, index) => (
                <div key={index} className="grid gap-3 rounded-lg bg-mist p-4 sm:grid-cols-2">
                  <input
                    placeholder="Name"
                    value={row.name}
                    onChange={(e) => updateLeader(index, { name: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    placeholder="Role"
                    value={row.role}
                    onChange={(e) => updateLeader(index, { role: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    placeholder="Email"
                    value={row.email}
                    onChange={(e) => updateLeader(index, { email: e.target.value })}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <input
                      placeholder="Phone"
                      value={row.phone}
                      onChange={(e) => updateLeader(index, { phone: e.target.value })}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAdditionalLeaders((rows) => rows.filter((_, i) => i !== index))
                      }
                      className="shrink-0 text-xs font-semibold text-ink-muted hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Label>Changes in leadership since last affiliation</Label>
              <textarea
                rows={3}
                value={leadershipChanges}
                onChange={(e) => setLeadershipChanges(e.target.value)}
                className={inputClass}
              />
            </div>

            <label className="flex items-start gap-2.5 border-t border-black/10 pt-6 text-sm text-ink">
              <input
                type="checkbox"
                required
                checked={attestation}
                onChange={(e) => setAttestation(e.target.checked)}
                className="mt-0.5 accent-brand-blue"
              />
              I affirm that our chapter leadership agrees with and upholds the AM Statement of
              Faith and Mission Statement.
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 space-y-6">
            <FileField
              label="Current member list (CSV or XLSX, optional)"
              file={memberListFile}
              onChange={setMemberListFile}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Members</h3>
                <button
                  type="button"
                  onClick={() => setMembers((rows) => [...rows, { name: "", email: "" }])}
                  className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-blue"
                >
                  + Add member
                </button>
              </div>
              {members.length === 0 && (
                <p className="text-sm text-ink-muted">
                  Add members individually, or upload a list above.
                </p>
              )}
              {members.map((row, index) => (
                <div key={index} className="grid gap-3 rounded-lg bg-mist p-4 sm:grid-cols-2">
                  <input
                    placeholder="Name"
                    value={row.name}
                    onChange={(e) => updateMember(index, { name: e.target.value })}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <input
                      placeholder="Email"
                      value={row.email}
                      onChange={(e) => updateMember(index, { email: e.target.value })}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setMembers((rows) => rows.filter((_, i) => i !== index))}
                      className="shrink-0 text-xs font-semibold text-ink-muted hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-8 space-y-6">
            {[
              {
                heading: "Chapter information",
                stepIndex: 0,
                rows: [
                  ["Application type", applicationType],
                  ["City", city],
                  ["Country", country],
                  ["Target university", targetUniversity],
                  ["Start date", startDate],
                  ["Member count", memberCount],
                ],
              },
              {
                heading: "Charter status",
                stepIndex: 1,
                rows:
                  chartered === "Yes"
                    ? [
                        ["Chartered", chartered],
                        ["Letter of acknowledgment", charterLetter?.name ?? "—"],
                        ["Chapter constitution", constitutionFile?.name ?? "—"],
                      ]
                    : [
                        ["Chartered", chartered || "—"],
                        ["Reason for delay", delayReason || "—"],
                      ],
              },
              {
                heading: "Student leadership",
                stepIndex: 2,
                rows: [
                  ["Leader", `${leaderName} (${leaderRole})`],
                  ["Leader email", leaderEmail],
                  ["Leader phone", leaderPhone],
                  ["Additional leaders", String(additionalLeaders.length)],
                ],
              },
              {
                heading: "Current members",
                stepIndex: 3,
                rows: [
                  ["Member list file", memberListFile?.name ?? "—"],
                  ["Members listed", String(members.length)],
                ],
              },
            ].map(({ heading, stepIndex, rows }) => (
              <div key={heading} className="rounded-xl border border-black/10 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">{heading}</h3>
                  <button
                    type="button"
                    onClick={() => goTo(stepIndex)}
                    className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-blue"
                  >
                    Edit
                  </button>
                </div>
                <dl className="mt-3 space-y-1.5 text-sm">
                  {rows.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-ink-muted">{label}</dt>
                      <dd className="text-right text-ink">{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}

            {status === "error" && (
              <p className="text-sm text-red-600">
                Something went wrong submitting your application. Please try again.
              </p>
            )}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="text-sm font-semibold text-ink-muted disabled:opacity-0"
          >
            Back
          </button>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-brand-navy"
            >
              Continue
              <ArrowRightIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === "submitting"}
              className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-brand-navy disabled:opacity-60"
            >
              {status === "submitting" ? "Submitting…" : "Submit application"}
              <ArrowRightIcon />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
