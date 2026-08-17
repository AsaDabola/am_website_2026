const items = [
  {
    title: "Bible study",
    description: "Small and large group study that puts Scripture at the centre of campus life.",
    bg: "#0f766e",
  },
  {
    title: "Leadership training",
    description: "Students are coached to lead their peers, then to send the next group out.",
    bg: "#0d1f52",
  },
  {
    title: "Online education",
    description: "AM Academy courses in Scripture, missiology and cross-cultural ministry.",
    bg: "#0d1f52",
  },
  {
    title: "Internships & trips",
    description: "Short-term missions and internships that turn training into practice.",
    bg: "#0d1f52",
  },
];

export default function WhatWeDoInPractice() {
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
