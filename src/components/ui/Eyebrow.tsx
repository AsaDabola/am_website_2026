export default function Eyebrow({
  children,
  tone = "blue",
}: {
  children: string;
  /**
   * "onBlue" is for the eyebrow sitting on a saturated blue field, where the
   * brand blue disappears into the background and plain white is louder than
   * the heading it introduces — the designs set it in the lighter #4d8df6.
   */
  tone?: "blue" | "light" | "onBlue";
}) {
  const toneClass = {
    blue: "text-brand-blue",
    light: "text-white/90",
    onBlue: "text-[#4d8df6]",
  }[tone];
  const lineClass = {
    blue: "bg-brand-blue/60",
    light: "bg-white/60",
    onBlue: "bg-[#4d8df6]/60",
  }[tone];

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
