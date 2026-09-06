/**
 * The built-in pages' own content, as data — so the page editor opens on what
 * the page actually says.
 *
 * The home page was the first of these (see homeDefaults) and this is the same
 * idea for the rest of the site. A page listed here is seeded into its Page
 * record's `layout`, and the coded page renders that instead of its own body
 * through `components/pages/PageBody`. What stays coded is the page's chrome:
 * its hero, its sub-navigation, and the two bands every page closes with. What
 * becomes editable is the part an editor means when they say "this page".
 *
 * ## Writing an entry
 *
 * Prose goes in as markdown — `{ markdown: "…" }` — because the field behind
 * it stores a Lexical document, and a Lexical document written by hand is
 * hundreds of lines of nested nodes nobody can proofread. The seeder converts
 * it with scripts/lib/markdownToLexical.
 *
 * Photographs go in as the paths the components already use. The seeder turns
 * each into a Media record, because an upload field holds a record.
 *
 * ## What a converted page must keep
 *
 * The blocks chosen for a page should draw it as it is drawn now. That is the
 * bar: an editor opening the page finds its content, and a visitor sees the
 * page they saw yesterday. Where a page's body cannot be expressed in the
 * blocks — a form, a map, a listing that queries the database — it is not
 * listed here, and its body stays coded. Half-converting one would put an
 * editable copy of a form's heading above a form that ignores it.
 */

/** Markdown the seeder turns into a rich text document. */
export type Markdown = { markdown: string };

export const isMarkdown = (value: unknown): value is Markdown =>
  typeof value === "object" && value !== null && "markdown" in value;

export type PageBlockSeed = { blockType: string } & Record<string, unknown>;

export type PageSeed = {
  /**
   * How the authored sections sit against the coded body. `replace` is the
   * usual answer for a converted page: the body is now these blocks.
   */
  mode: "replace" | "before" | "after";
  blocks: PageBlockSeed[];
};

export const PAGE_DEFAULTS: Record<string, PageSeed> = {
  "/about/statement-of-faith": {
    mode: "replace",
    blocks: [
      {
        blockType: "prose",
        heading: "Statement of Faith",
        // The eleven articles, numbered. The numbering is the point — they are
        // cited individually, and a chapter signing the statement needs to
        // point at one by number.
        body: {
          markdown: [
            "1. We believe that the Bible, consisting of Old and New Testaments only, is verbally inspired by the Holy Spirit, is inerrant in the original manuscripts, and is the infallible and authoritative words from the Lord.",
            "2. We believe that there is one God, eternally existent in three Persons: Father, Son, and Holy Spirit.",
            "3. We believe that Adam, created in the image of God, was tempted by Satan, the devil, and fell. Because of Adam’s sin, all men have guilt imputed.",
            "4. We believe in the deity of our Lord Jesus Christ, in His virgin birth, in His sinless life, in His miracles, in His vicarious and atoning death through His shed blood, in His bodily resurrection, in His ascension to the right hand of the Father, and in His personal return in power and glory.",
            "5. We believe that for the salvation of lost and sinful man, regeneration by the Holy Spirit is absolutely essential.",
            "6. We believe that salvation consists in the remission of sins, the imputation of Christ’s righteousness, and the gift of eternal life received by faith alone, apart from works.",
            "7. We believe in the present ministry of the Holy Spirit by whose indwelling the Christian is enabled to live a godly life.",
            "8. We believe that the Church, the body of Christ, consists only of those who are born again, who are baptized by the Holy Spirit into Christ at the time of regeneration, for whom He now makes intercession in heaven and for whom He will come again.",
            "9. We believe in the spiritual unity of believers in our Lord Jesus Christ.",
            "10. We believe that Christ instructed the Church to go into the entire world and preach the Gospel to every person, baptizing and teaching those who believe.",
            "11. We believe that the return of Jesus Christ is imminent, and that it will be visible and personal.",
          ].join("\n"),
        },
        appearance: { width: "narrow" },
      },
    ],
  },

  "/about/chairman": {
    mode: "replace",
    blocks: [
      {
        blockType: "imageText",
        heading: "Our First Chairman",
        image: "/images/chairman-photo-1.webp",
        imageSide: "right",
        imageShape: "landscape",
        body: {
          markdown:
            "Apostolos Mission International is proudly continuing the legacy of world evangelization as established by American missiologist, Ralph D. Winter. Ralph D. Winter was an accomplished missiologist and missionary who opened a new paradigm regarding the role of churches, mission structures, and outreach among unreached people groups. His strategies and approach to mission were a watershed transition that opened the door for the world to know the Gospel.\n\n" +
            "Dr. Winter aimed to overcome cultural and linguistic hurdles in world mission so that all people could hear the truth. Dr. Winter was recognized by many because of his influence in world mission strategies. He was even acknowledged by Time magazine in 2005 as being one of the 25 Most Influential Evangelicals in America.",
        },
      },
      {
        blockType: "imageText",
        image: "/images/chairman-photo-2.webp",
        imageSide: "right",
        imageShape: "landscape",
        body: {
          markdown:
            "Overall, Dr. Winter was a man who was praised for his creative approach in mission according to the world they were in. He was a revolutionary thinker who continually worked hard to foresee the best strategy that best fit the scene.\n\n" +
            "AM International was blessed to have Dr. Winter serve as the organization’s first chairman and received his blessing to embody the same heart, creativity, and passion for world missions. As the ones who are “sent,” AM desires to fuel the heart of the youth with a drive for sharing the Word. Their dream is to give hope to those who are weary and burdened. May AM deliver the Gospel, sharing the freedom that only the truth can bring.",
        },
        appearance: { paddingTop: "none" },
      },
    ],
  },
  "/get-involved/alumni-connect": {
    mode: "replace",
    blocks: [
      {
        blockType: "gallery",
        eyebrow: "Get involved",
        heading: "Alumni Connect",
        columns: "3",
        imageShape: "square",
        images: [
          { image: "/images/alumni-1.webp" },
          { image: "/images/alumni-2.webp" },
          { image: "/images/alumni-3.webp" },
        ],
        appearance: { background: "mist", align: "center" },
      },
      {
        blockType: "cta",
        description:
          "AM is blessed with numerous alumni members who continued to support our mission after graduation. If you want to continue to help, support and serve AM, join our Alumni Connect to stay connected. No matter where you are or what career you have, our Lord Jesus calls you to keep working together to advance the Gospel mission. Find the most fitting role in your work schedule and family life to help AM mission thrive all across the world.",
        buttons: [{ label: "Click here", href: "/contact", style: "primary" }],
        appearance: { background: "mist", paddingTop: "none" },
      },
    ],
  },

  "/get-involved/chapter-staff": {
    mode: "replace",
    blocks: [
      {
        blockType: "gallery",
        eyebrow: "Get involved",
        heading: "Chapter Staff",
        columns: "3",
        imageShape: "square",
        images: [
          { image: "/images/chapter-volunteer-1.webp" },
          { image: "/images/chapter-volunteer-2.webp" },
          { image: "/images/chapter-volunteer-3.webp" },
        ],
        appearance: { background: "mist", align: "center" },
      },
      {
        blockType: "cta",
        description:
          "Being a Chapter leader and a staff throughout college life is one of the most rewarding experiences that students can have as followers of Christ. It is spirit-filled roles and positions that help and guide many other students who wish to know Jesus. Our Chapter leaders and staff go through resourceful and empowering training at the onsite venues where they can learn how to lead local programs and hold gatherings and meetings. Chapter leaders and staff share unforgettable memories of participating in the Gospel mission in their college years. We invite you to join our Chapter Staff team.",
        buttons: [{ label: "Apply here", href: "/get-involved/volunteer#apply", style: "primary" }],
        appearance: { background: "mist", paddingTop: "none" },
      },
    ],
  },

  "/get-involved/online-bible-study": {
    mode: "replace",
    blocks: [
      {
        blockType: "gallery",
        eyebrow: "What we do",
        heading: "Online Bible Study",
        columns: "3",
        imageShape: "square",
        images: [
          { image: "/images/online-bible-study-1.webp" },
          { image: "/images/online-bible-study-2.webp" },
          { image: "/images/online-bible-study-3.webp" },
        ],
        appearance: { background: "mist", align: "center" },
      },
      {
        blockType: "cta",
        heading: "In-depth Bible study for anyone, anywhere.",
        description:
          "Apostolos Mission chapters offer online Bible studies for those who are unable to connect with our physical campus or local ministry locations. If you are not near one of our physical chapters, we would love to help you get connected with an online Bible study in your area or time zone. Fill out the form below, and our team will contact you with more information.",
        buttons: [{ label: "Click here", href: "/contact", style: "primary" }],
      },
    ],
  },
};

/** The routes whose body is now editable. */
export const CONVERTED_ROUTES = Object.keys(PAGE_DEFAULTS);
