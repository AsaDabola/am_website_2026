/**
 * Every page the site builds in code, as a list.
 *
 * These are not CMS records and cannot be: their layout is React, designed in
 * Figma, and a "page" row in the database could not render one. But they are
 * still the pages of the site, and someone opening Pages in the admin looking
 * for Who We Are should find it there rather than an empty list.
 *
 * So the admin is seeded with one entry per route, marked as built in. Such an
 * entry carries no body of its own — editing its words is done in Page
 * wording, and its layout is changed in code — and the Pages form says so
 * rather than offering fields that would quietly do nothing.
 *
 * `onCountrySites` marks the routes a country site also serves, which is the
 * list in lib/tenantRoutes; those pages exist once per country as well as on
 * amintl.org.
 *
 * Generated from the route files by scripts/seed-built-in-pages.mjs --list.
 */
export type BuiltInPage = {
  /** The address on the main site. A country site serves it under /{country}. */
  route: string;
  title: string;
  onCountrySites: boolean;
};

export const BUILT_IN_PAGES: BuiltInPage[] = [
  { route: "/", title: "Home", onCountrySites: true },
  { route: "/about", title: "Who We Are", onCountrySites: true },
  { route: "/about/chairman", title: "Ralph D. Winter", onCountrySites: true },
  { route: "/about/history", title: "History", onCountrySites: true },
  { route: "/about/leadership", title: "Leadership", onCountrySites: true },
  { route: "/about/membership", title: "Membership", onCountrySites: true },
  { route: "/about/mission", title: "Mission Statement", onCountrySites: true },
  { route: "/about/statement-of-faith", title: "Statement of Faith", onCountrySites: true },
  { route: "/bible-study", title: "Bible Studies", onCountrySites: true },
  { route: "/bible-study/join", title: "Join our Bible Studies", onCountrySites: true },
  { route: "/contact", title: "Contact Us", onCountrySites: true },
  { route: "/events", title: "Events", onCountrySites: true },
  { route: "/get-involved", title: "Get Involved", onCountrySites: true },
  { route: "/get-involved/alumni-connect", title: "Alumni Connect", onCountrySites: true },
  { route: "/get-involved/bible-teacher-training", title: "Bible Teacher Training", onCountrySites: true },
  { route: "/get-involved/chapter-affiliation", title: "Chapter Affiliation", onCountrySites: true },
  { route: "/get-involved/chapter-staff", title: "Chapter Staff", onCountrySites: true },
  { route: "/get-involved/donate", title: "Donate", onCountrySites: true },
  { route: "/get-involved/donate/thank-you", title: "Thank You", onCountrySites: false },
  { route: "/get-involved/group-activities", title: "Group Activities", onCountrySites: true },
  { route: "/get-involved/internship", title: "Internship", onCountrySites: true },
  { route: "/get-involved/online-bible-study", title: "Online Bible Study", onCountrySites: true },
  { route: "/get-involved/volunteer", title: "Volunteer", onCountrySites: true },
  { route: "/network", title: "Our Network", onCountrySites: false },
  { route: "/news", title: "News", onCountrySites: true },
  { route: "/news/editorial", title: "Editorial", onCountrySites: true },
  { route: "/news/photo-news", title: "Photo News", onCountrySites: true },
  { route: "/news/testimony", title: "Testimony", onCountrySites: true },
  { route: "/what-we-do/administration", title: "Administration", onCountrySites: true },
  { route: "/what-we-do/pillars-of-mission", title: "Our Pillars of Mission", onCountrySites: true },
];
