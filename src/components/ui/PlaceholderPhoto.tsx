/**
 * Figma-referenced photography could not be exported into this repo (asset
 * hosts are unreachable from this environment), so sections that show real
 * photos render this gradient placeholder instead. Swap the `src` prop in
 * each section for AM's actual photography when it's available.
 */
export default function PlaceholderPhoto({
  className = "",
  from = "#1449c6",
  to = "#050a2e",
  label,
}: {
  className?: string;
  from?: string;
  to?: string;
  label?: string;
}) {
  const position = className.includes("absolute") ? "" : "relative";

  return (
    <div
      className={`${position} flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.12), transparent 50%)",
        }}
      />
      {label && (
        <span className="relative text-xs font-medium uppercase tracking-[0.2em] text-white/50">
          {label}
        </span>
      )}
    </div>
  );
}
