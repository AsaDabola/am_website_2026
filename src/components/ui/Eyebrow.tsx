export default function Eyebrow({
  children,
  tone = "blue",
}: {
  children: string;
  tone?: "blue" | "light";
}) {
  const toneClass = tone === "blue" ? "text-brand-blue" : "text-white/90";
  const lineClass = tone === "blue" ? "bg-brand-blue/60" : "bg-white/60";

  return (
    <div className="mb-4 flex items-center gap-3">
      <span className={`h-px w-7 ${lineClass}`} />
      <span
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${toneClass}`}
      >
        {children}
      </span>
    </div>
  );
}
