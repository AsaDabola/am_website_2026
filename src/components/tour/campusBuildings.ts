/**
 * The four buildings on the Trenton campus, and where each one sits on the
 * aerial photograph.
 *
 * `shape` is the roofline traced over the photo and `leader` the line joining
 * that roofline to the name tag below it. Both are in the photo's own
 * 1920x1080 coordinate space, so they only line up against
 * /images/tour/campus-aerial.jpg at that aspect ratio — swapping in a
 * differently framed photo means re-tracing these.
 */
export type CampusBuilding = {
  id: string;
  name: string;
  tag: string;
  text: string;
  /** Captions for the photos that belong in this building's gallery. */
  gallery: string[];
  /** Roofline traced over the aerial, in the photo's 1920x1080 space. */
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
    shape:
      "M233.8,399.4 L172.3,532.7 L199.4,619.7 L320.8,613.5 L331.0,588.6 L362.0,588.0 L381.2,539.9 L368.2,493.2 L363.1,493.7 L369.9,476.8 L353.5,399.4 L233.8,399.4 Z",
    leader: { x1: 270, y1: 470, x2: 95, y2: 480 },
    pin: { left: "4.95%", top: "44.44%" },
    photo: "/images/tour/dormitory.jpg",
  },
  {
    id: "seminary",
    name: "Immanuel Theological Seminary",
    tag: "Academics",
    text: "The largest building on campus, holding classrooms, offices and study space for Immanuel Theological Seminary and AM Academy coursework.",
    gallery: ["Classroom wing", "Main entrance", "Study hall"],
    shape:
      "M634.2,471.7 L617.3,549.6 L625.7,634.3 L1166.2,634.3 L1178.6,540.0 L1178.6,513.5 L1168.4,509.5 L1156.0,417.5 L1109.7,417.5 L1111.9,433.3 L881.5,436.7 L881.5,417.5 L814.9,417.5 L811.5,469.5 L634.2,471.7 Z",
    leader: { x1: 950, y1: 480, x2: 880, y2: 770 },
    pin: { left: "45.83%", top: "71.30%" },
    photo: "/images/tour/seminary.jpg",
  },
  {
    id: "office",
    name: "General Office",
    tag: "Administration",
    text: "The Tudor-style house between the seminary building and the chapel, home to AM's administrative staff and the front door for visitors to the campus.",
    gallery: ["Reception", "Staff offices", "Exterior porch"],
    shape:
      "M1235.1,455.9 L1253.1,553.0 L1290.4,553.0 L1290.4,576.7 L1345.7,576.7 L1404.5,576.7 L1411.2,461.5 L1370.6,461.5 L1364.9,442.3 L1335.6,442.3 L1333.3,424.3 L1310.7,424.3 L1311.9,400.6 L1293.8,400.6 L1292.7,424.3 L1270.1,424.3 L1271.2,435.6 L1250.9,436.7 L1255.4,455.9 L1235.1,455.9 Z",
    leader: { x1: 1300, y1: 500, x2: 1300, y2: 770 },
    pin: { left: "67.71%", top: "71.30%" },
    photo: "/images/tour/office.jpg",
  },
  {
    id: "chapel",
    name: "Chapel",
    tag: "Worship",
    text: "The sanctuary at the east end of the campus, used for chapel services, worship gatherings and larger ministry events.",
    gallery: ["Sanctuary", "Entrance doors", "Fellowship hall"],
    shape:
      "M1378.5,263.9l-4.5,22.6,84.7,239.4,48.6,36.1,31.6,10.2v20.3s23.7,18.1,18.1,16.9,54.2,0,54.2,0v-11.3s83.6-14.7,88.1-40.7l-33.9-9,39.5-137.8-7.9-15.8,12.4-10.2v-22.6h-10.2l-13.6-12.4-10.2,4.5-13.6,9,2.3,18.1-14.7,4.5-2.3,14.7-55.3-122-22.6-26-15.8-10.2-6.8-19.2-31.6-16.9-33.9,6.8-15.8,13.6-2.3,21.5-10.2,4.5-7.9,10.2-66.6,1.1Z",
    leader: { x1: 1550, y1: 420, x2: 1690, y2: 770 },
    pin: { left: "88.02%", top: "71.30%" },
    photo: "/images/tour/chapel.jpg",
  },
];
