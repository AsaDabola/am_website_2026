/**
 * The four buildings on the Trenton campus, and where each one sits on the
 * aerial photograph.
 *
 * `shape` is the roofline traced over the photo and `leader` the line joining
 * that roofline to the name tag below it. Both are in a 1200x603 space that
 * matches public/images/hero-slide-campus-aerial.webp, so they line up against
 * that photograph and no other — a differently framed or differently cropped
 * aerial means re-tracing all four.
 *
 * That is why the tour names the file directly rather than reading the same
 * image key the home banner does: swapping the banner photograph in /admin
 * should not silently slide these outlines off the buildings they label.
 */
export type CampusBuilding = {
  id: string;
  name: string;
  tag: string;
  text: string;
  /** Captions for the photos that belong in this building's gallery. */
  gallery: string[];
  /** Roofline traced over the aerial, in the photo's 1200x603 space. */
  shape: string;
  /** The line from the roofline to the name tag, same coordinate space. */
  leader: { x1: number; y1: number; x2: number; y2: number };
  /** The name tag's position, as a percentage of the photo. */
  pin: { left: string; top: string };
  /** The building's own photograph, once AM supplies it. */
  photo: string;
};

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: "dormitory",
    name: "Dormitory",
    tag: "Housing",
    text: "Housing for resident students and staff, set slightly apart from the seminary building, the general office and the chapel.",
    gallery: ["Common room", "Hallway", "A resident room"],
    shape: "M0,95 L98,84 L134,90 L140,110 L132,150 L95,163 L93,178 L32,175 L0,167 Z",
    leader: { x1: 70, y1: 150, x2: 70, y2: 205 },
    pin: { left: "5.83%", top: "35.65%" },
    photo: "/images/tour/dormitory.jpg",
  },
  {
    id: "seminary",
    name: "Immanuel Theological Seminary",
    tag: "Academics",
    text: "The largest building on campus, holding classrooms, offices and study space for Immanuel Theological Seminary and AM Academy coursework.",
    gallery: ["Classroom wing", "Main entrance", "Study hall"],
    shape: "M101,163 L300,129 L384,180 L497,165 L501,242 L482,288 L425,332 L351,322 L99,225 Z",
    leader: { x1: 250, y1: 270, x2: 250, y2: 370 },
    pin: { left: "20.83%", top: "63.02%" },
    photo: "/images/tour/seminary.jpg",
  },
  {
    id: "office",
    name: "General Office",
    tag: "Administration",
    text: "The Tudor-style house between the seminary building and the chapel, home to AM's administrative staff and the front door for visitors to the campus.",
    gallery: ["Reception", "Staff offices", "Exterior porch"],
    shape:
      "M541,197 L656,227 L691,238 L683,305 L667,315 L608,318 L496,315 L489,278 L505,250 Z",
    leader: { x1: 590, y1: 290, x2: 590, y2: 370 },
    pin: { left: "49.17%", top: "63.02%" },
    photo: "/images/tour/office.jpg",
  },
  {
    id: "chapel",
    name: "Chapel",
    tag: "Worship",
    text: "The sanctuary at the east end of the campus, used for chapel services, worship gatherings and larger ministry events.",
    gallery: ["Sanctuary", "Entrance doors", "Fellowship hall"],
    shape:
      "M775,410 L770,268 L861,239 L923,187 L958,156 L1053,229 L1051,327 L1008,412 L964,451 L857,440 Z",
    leader: { x1: 930, y1: 400, x2: 935, y2: 495 },
    pin: { left: "77.92%", top: "83.75%" },
    photo: "/images/tour/chapel.jpg",
  },
];
