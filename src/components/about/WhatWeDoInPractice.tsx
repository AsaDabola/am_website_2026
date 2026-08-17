import { getTranslations } from "next-intl/server";

export default async function WhatWeDoInPractice() {
  const t = await getTranslations("InPractice");
  const items = [
    { title: t("bibleStudyTag"), description: t("bibleStudyDescription"), bg: "#0f766e" },
    { title: t("leadershipTrainingTag"), description: t("leadershipTrainingDescription"), bg: "#0d1f52" },
    { title: t("onlineEducationTag"), description: t("onlineEducationDescription"), bg: "#0d1f52" },
    { title: t("internshipsTripsTag"), description: t("internshipsTripsDescription"), bg: "#0d1f52" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.title} className="rounded-xl p-6" style={{ backgroundColor: item.bg }}>
          <h3 className="font-display text-base font-bold tracking-[-0.02em] text-white">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-white/75">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
