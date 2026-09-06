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

  "/about/history": {
    mode: "replace",
    blocks: [
      {
        blockType: "prose",
        eyebrow: "History",
        heading: "A Brief History of Apostolos Missions International",
        body: { markdown: "From a grassroots campus effort to a global mission organization." },
        appearance: { align: "center" },
      },
      {
        blockType: "prose",
        body: {
          markdown: [
            "## The vision behind the movement",
            "Apostolos Campus Ministries (ACM) developed with the focus of reaching out to university students who are thirsty for the Word of God and desiring to continue God’s mission. The early pioneers believed strongly that today’s universities shape tomorrow’s leaders, and their dream was to transform the world by helping to guide students on their spiritual journey to pursue goals that closely resemble the Kingdom of God. What started as a grassroots campus effort quickly grew into a deep discipleship movement committed to reaching nations.",
            "## A new name, a key mentor",
            "ACM officially became Apostolos Missions International (AMI) in December 2003. Missiologist Dr. Ralph Winter served as the first honorary chairman of AMI. Dr. Winter and the staff of the U.S. Center for World Missions graciously advised the AMI student board on how to develop mission around the world. Winter was known for his creative approach to missions and his strategies to overcome cultural and societal barriers to delivering the Gospel of Jesus Christ. AMI sought to continue that legacy to reach the unreached youth of today.",
            "## Growing beyond campus",
            "AMI’s tradition of Word, fellowship, and service spread to numerous prestigious U.S. schools over the years, including Harvard University, Columbia University, UC Berkeley, UCLA, Wesleyan University, Northwestern University, and many more. As students graduated and went out as missionaries, the network developed globally, establishing ministries in Canada, Cambodia, South Korea, India, Laos, Kenya, Vietnam, Japan, Uganda, Zimbabwe, Rwanda, Tanzania, Egypt, and beyond.",
            "## Setting up a home base",
            "To support this rapidly expanding global network, AMI moved its headquarters from the West Coast to Dover, New York in 2015. This allowed the scope of the mission to expand, including not only university students but also young adults in urban societies and developing countries. In 2020, AMI relocated its headquarters office to Trenton, New Jersey, serving as a vital resource hub and training ground for young missionaries to evangelize, teach the Bible, and develop localized mission strategies.",
            "## Where AMI stands today",
            "Today, Apostolos Missions International is a vibrant worldwide sending community. It continues to expand its reach, steadfast in its commitment to the great commission. AMI is presently an active member of both the World Olivet Assembly and the World Evangelical Alliance, collaborating globally to testify to the eternal love of Jesus Christ.",
          ].join("\n\n"),
        },
        appearance: { width: "narrow", paddingTop: "none" },
      },
      {
        blockType: "timeline",
        eyebrow: "Timeline",
        heading: "Our History at a Glance",
        milestones: [
          {
            tag: "Founding",
            title: "Apostolos Campus Ministries begins",
            description:
              "ACM starts as a grassroots campus effort reaching university students, dedicated to guiding them on their spiritual journey toward the Kingdom of God.",
          },
          {
            tag: "Early years",
            title: "Guided by Dr. Ralph Winter",
            description:
              "Renowned missiologist Dr. Ralph Winter of the U.S. Center for World Missions serves as the first honorary chairman, advising on global mission strategy.",
          },
          {
            tag: "December 2003",
            title: "ACM becomes AMI",
            description:
              "Apostolos Campus Ministries is officially renamed to Apostolos Missions International to reflect its expanding global calling and vision.",
          },
          {
            tag: "Expansion",
            title: "Campus and global growth",
            description:
              "AMI spreads to top U.S. campuses including Harvard, Columbia, Berkeley, and UCLA, while establishing networks across 14+ nations globally.",
          },
          {
            tag: "2015",
            title: "Headquarters moves to Dover, NY",
            description:
              "AMI relocates its main office to Dover, NY, broadening its focus to serve young adults in urban societies and developing countries.",
          },
          {
            tag: "2020",
            title: "Headquarters moves to Trenton, NJ",
            description:
              "AMI moves its hub to Trenton, NJ, establishing a centralized resource center and training ground for active field missionaries.",
          },
          {
            tag: "Today",
            title: "A global network",
            description:
              "AMI operates as a worldwide sending community and is an active member of both the World Olivet Assembly and the World Evangelical Alliance.",
          },
        ],
        appearance: { background: "mist", align: "center", paddingTop: "xl", paddingBottom: "xl" },
      },
      {
        blockType: "cta",
        description: "Preach the gospel · Make disciples · Equip leaders · Send them out",
        appearance: {
          background: "white",
          align: "center",
          paddingTop: "sm",
          paddingBottom: "sm",
        },
      },
    ],
  },

  // The pages that carry a form. Only the prose above the form is listed —
  // the form itself stays coded, because an editable copy of a form's heading
  // above a form that ignores it is worse than not converting the page. The
  // address, the deadline and the appeal are what a country needs to change.
  "/contact": {
    mode: "replace",
    blocks: [
      {
        blockType: "cta",
        eyebrow: "We’d love to hear from you",
        heading: "Contact us",
        appearance: { background: "mist", align: "center" },
      },
      {
        blockType: "prose",
        body: {
          // One paragraph, four lines: two trailing spaces is markdown's hard
          // line break, and an address set as four paragraphs reads as four
          // separate facts.
          markdown:
            "**AM International Headquarters**  \n" +
            "**716 Bellevue Ave., Trenton, NJ 08618**  \n" +
            "[**mission@amintl.org**](mailto:mission@amintl.org)  \n" +
            "**+1 (917) 569-9073**",
        },
        appearance: {
          background: "mist",
          align: "center",
          width: "narrow",
          paddingTop: "none",
        },
      },
    ],
  },

  "/get-involved/donate": {
    mode: "replace",
    blocks: [
      {
        blockType: "gallery",
        eyebrow: "Get involved",
        heading: "Donate",
        columns: "1",
        imageShape: "natural",
        images: [{ image: "/images/donate-offering.webp" }],
        appearance: { background: "mist", align: "center" },
      },
      {
        blockType: "cta",
        description:
          "AM International is a non-profit organization supported by our loving staff, and by the contributions of the Christian community. With your ongoing support, we can continue to keep AM International going on strong, reaching out to the communities, the nation, and the world. Your donations, your participation, and your prayers allow us to be more effective in spreading the good news of Jesus Christ, establishing centers for students to gather and rejoice in Christ, setting up programs for those less fortunate, and strengthen the Christian leaders of tomorrow. By supporting AM International, you will not only be showing your support for one organization. But you will be showing your support for the expansion of God’s Kingdom. Any support that you can offer is greatly appreciated.",
        buttons: [{ label: "Click here", href: "#donate-form", style: "primary" }],
        appearance: { background: "mist", paddingTop: "none" },
      },
    ],
  },

  "/get-involved/chapter-affiliation": {
    mode: "replace",
    blocks: [
      {
        blockType: "prose",
        body: {
          markdown:
            "Qualifications for membership includes being over the age of 18 and regularly attending Bible programs for at least one month at your local AM chapter. Membership is open primarily to current students of the university, but also to university alumni, faculty, and staff. Becoming a member indicates that you share and agree with the AM Statement of Faith and Mission Statement. A member is also one who wishes to uphold the values of the Christian faith in their lives and support the work of God’s Kingdom here on earth. Current students must be registered to their university chapter by filling out the application and having it signed by their chapter leader. AM members benefit from full access to the AM resources and facilities. They can also join AM leadership meetings, conventions, and retreats. Members of AM are recommended to give a monthly offering to their chapters. The amount of the offering is of their choice. 100% of the donations go towards supporting the local chapter’s operations and activities.",
        },
        appearance: { paddingBottom: "none" },
      },
      {
        blockType: "notice",
        tone: "warning",
        body: {
          markdown:
            "Existing chapters must reaffirm their affiliation **annually by September 1**. Chapters that miss the deadline may have their membership revoked. New chapters may apply anytime between **June and December** of the current calendar year.",
        },
      },
    ],
  },

  "/get-involved/bible-teacher-training": {
    mode: "replace",
    blocks: [
      {
        blockType: "gallery",
        eyebrow: "AM Academy",
        heading: "How To Become A Bible Teacher",
        columns: "1",
        imageShape: "natural",
        images: [{ image: "/images/bible-teacher-called-to-serve.webp" }],
        appearance: { background: "mist", align: "center" },
      },
      {
        blockType: "cta",
        description:
          "Are you interested in becoming a Bible Teacher? AM offers diverse training courses for you to be equipped to teach Bible to different age groups. Contact us with your story. We will help you find the most fitting track to share the Gospel. You can also visit AM Academy website (www.amacademy.org), our Online Bible School.",
        appearance: { background: "mist", paddingTop: "none" },
      },
      {
        blockType: "steps",
        eyebrow: "Join our Bible Studies!",
        heading: "Steps to Become Bible Teacher",
        steps: [
          {
            title: "Finish 5-Phase Bible Study Curriculum.",
            description:
              "You will receive the proof account when you have completed our Bible Study course. Click through to sign up for the Bible Study Curriculum.",
            href: "/bible-study/join",
          },
          {
            title: "Apply for Bible Teacher Training",
            description:
              "You will receive the Bible Teacher Certificate when you have finished the course. Find more information about our Bible Teacher Certificate in our online bible school website.",
            href: "https://www.amacademy.org",
          },
          {
            title: "Activate Your Bible Teacher Account",
            description: "In AM Academy, to share the Gospel with many souls.",
          },
          {
            title:
              "Continue to join resourceful, educational biblical programs to fulfill your calling!",
          },
        ],
        stepsLayout: "columns",
        appearance: {
          background: "colour",
          backgroundColour: "#f1f3f7",
          align: "center",
          headingSize: "xl",
          paddingTop: "xl",
          paddingBottom: "xl",
        },
      },
      {
        blockType: "gallery",
        columns: "1",
        imageShape: "natural",
        images: [{ image: "/images/bible-teacher-called-to-be.webp" }],
        appearance: { paddingTop: "none" },
      },
    ],
  },

  "/bible-study": {
    mode: "replace",
    blocks: [
      {
        blockType: "cta",
        eyebrow: "Sign up for our Bible studies today",
        heading: "Bible Studies",
        description:
          "Apostolos Missions offers various Bible study programs that will nurture your spiritual life and relationship with the Lord Jesus. These Bible studies were created to guide each person to mature in faith and truth so that everyone can be equipped to serve Jesus and His Kingdom. We are currently offering six tracks of Bible Study Programs: Phase 1 the Book of Romans, Phase 2 Bible Core, Phase 3(1) The Ancestors of Faith, Phase 3(2) Basics of Christian Life, Phase 4 Only Jesus, and Phase 5 the Discipleship Track. Sign up for our Bible studies today by filling out the request form and our teachers will contact you with further information.",
        buttons: [
          {
            label: "Click here to Join our Bible Studies Today!",
            href: "/bible-study/join",
            style: "primary",
          },
        ],
        appearance: { background: "mist" },
      },
      // The six tracks, in order. Each is its own section so a country can
      // reorder them, hide one it does not run, or put its own photograph on
      // it. They run picture-right throughout, as the design draws them, and
      // only the first carries the space above — the rest sit against the one
      // before, which is the eighty pixels the coded page had between them.
      ...[
        {
          title: "Phase 1 — Book of Romans, chapters 1–8",
          image: "/images/bible-study-sola-fide.webp",
          description:
            "Sola Fide — “faith alone” — lays the foundation of the gospel: who Jesus is, what He did on the cross, and what it means to trust in Him alone for salvation.",
        },
        {
          title: "Phase 2 — Bible Core: the Four Spiritual Laws",
          image: "/images/bible-study-bible-core.webp",
          description:
            "Bible Core builds a working foundation in Scripture — how the Bible fits together as one story, and how to read and study it for yourself.",
        },
        {
          title: "Phase 3(1) — The Ancestors of Faith",
          image: "/images/bible-study-faith.webp",
          description:
            "Traces the faith of the Old Testament patriarchs and prophets, showing how God’s promises to His people carried forward to Christ.",
        },
        {
          title: "Phase 3(2) — Basics of Christian Life",
          image: "/images/bible-study-christian-life.webp",
          description:
            "A practical study of prayer, community, and discipleship — the everyday habits and disciplines of following Jesus.",
        },
        {
          title: "Phase 4 — Only Jesus: Gospel Studies",
          image: "/images/bible-study-only-jesus.webp",
          description:
            "A deeper look at the person and work of Christ, preparing students to understand and articulate what they believe, and why.",
        },
        {
          title: "Phase 5 — Discipleship Track",
          image: "/images/bible-study-discipleship-track.webp",
          description:
            "For students ready to disciple others — equipping them to pass on what they’ve learned to the next generation of leaders.",
        },
      ].map((track, index) => ({
        blockType: "imageText",
        heading: track.title,
        image: track.image,
        imageSide: "right",
        imageShape: "landscape",
        body: { markdown: track.description },
        appearance: {
          headingSize: "md",
          ...(index === 0 ? {} : { paddingTop: "none" }),
        },
      })),
    ],
  },

  "/about/leadership": {
    mode: "replace",
    blocks: [
      {
        blockType: "people",
        eyebrow: "Headquarters & Field",
        heading: "The people behind the sending.",
        columns: "4",
        people: [
          {
            name: "Rev. Dr. Paul DeVries",
            role: "Senior Leader and Advisor",
            bio: "Dr. DeVries provides profound wisdom and spiritual guidance for our mission in many areas. Dr. Paul is also President of the New York Divinity School, and has over 25 years of leadership experience in Christian higher education administration, including at Wheaton College, Northern Baptist Theological Seminary and the Seminary of the East.",
            photo: "/images/leader-paul-devries.webp",
            featured: true,
          },
          // The order is deliberate: the executive director and headquarters
          // first, then the regional coordinators west to east.
          { name: "Rani Reid", role: "Executive Director", photo: "/images/leader-reid.webp" },
          { name: "Asa Daboh", role: "HQ Staff", photo: "/images/hq-asa-daboh.webp" },
          {
            name: "Ruth Jigmedsuren",
            role: "HQ Staff",
            photo: "/images/hq-ruth-jigmedsuren.webp",
          },
          { name: "Andrea Rico", role: "South America", photo: "/images/coord-andrea-rico.webp" },
          { name: "Joel Lee", role: "Asia Pacific", photo: "/images/coord-joel-lee.webp" },
          { name: "Mara Onyeama", role: "Europe", photo: "/images/coord-mara-onyeama.webp" },
          { name: "Jonathan Xie", role: "China", photo: "/images/coord-jonathan-xie.webp" },
          { name: "Priya Vaya", role: "South Asia", photo: "/images/coord-priya-vaya.webp" },
          { name: "Samuel Kwizera", role: "Africa", photo: "/images/coord-samuel-kwizera.webp" },
          {
            name: "Khiaghie Koropa",
            role: "Oceania",
            photo: "/images/coord-khiaghie-koropa.webp",
          },
          {
            name: "Can Liu",
            role: "Director of Chinese Mission in USA",
            photo: "/images/hq-can-liu.webp",
          },
        ],
      },
      {
        blockType: "steps",
        eyebrow: "Across the Network",
        heading: "Four kinds of leaders, one movement.",
        steps: [
          {
            title: "Chapter Leaders",
            description:
              "Students who register AM at their university, open the first Bible study, and carry the chapter through each academic year.",
          },
          {
            title: "Field Missionaries",
            description:
              "Sent to cities where no chapter exists yet, planting the work from the first conversation onward.",
          },
          {
            title: "Bible Teachers",
            description:
              "Walking students through the five-phase programme one study at a time, on the student’s schedule.",
          },
          {
            title: "Local Staff",
            description:
              "Holding the practical work of each chapter — rooms, resources, events and the people who keep coming back.",
          },
        ],
      },
    ],
  },

  "/what-we-do/administration": {
    mode: "replace",
    blocks: [
      {
        blockType: "gallery",
        eyebrow: "What we do",
        heading: "Administration",
        columns: "3",
        imageShape: "square",
        images: [
          { image: "/images/admin-intro-2.webp" },
          { image: "/images/admin-intro-laptop.webp" },
          { image: "/images/admin-intro-1.webp" },
        ],
        appearance: { background: "mist", align: "center" },
      },
      {
        blockType: "cta",
        description:
          "Apostolos Missions being an international ministry with a large network, consists of various departments that specialize in specific areas of the ministry. These departments are run by a team of staff who are committed to the successful operations of the ministry.",
        appearance: { background: "mist", align: "center", paddingTop: "none" },
      },
      {
        blockType: "cards",
        eyebrow: "In practice",
        heading: "Department of Mission",
        intro:
          "Mission is one of Apostolos Missions’ top priorities. Our desire is to revitalize thriving campus ministries so that all campuses on earth will be filled with God’s word and that the youth from all nations can have the opportunity to listen to the message of the love of God revealed on the cross through our Lord Jesus Christ.",
        columns: "3",
        layout: "ruled",
        cards: [
          {
            title: "Network",
            description:
              "We are currently serving in 9 regions with ministers, evangelists, and Bible teachers who are passionate about making Christ known to the nations. The staff on this team are committed to supporting our network of mission workers through personal and spiritual development. For this, services and conferences are held on a regular basis to provide guidance and care. The goal is to foster unity while mobilizing the network to perform its day-to-day activities.",
          },
          {
            title: "Outreach & Evangelism",
            description:
              "Evangelism and outreach are a big part of Apostolos Missions and what we do. This department focuses on strategizing new ways for chapters to evangelize in innovative ways. It is all about helping build relationships while reaching others through the gospel involving acts of love and compassion.",
          },
          {
            title: "Event & Planning",
            description:
              "Our event and planning team serves as a catalyst for fellowship programs and activities. They organize and coordinate a variety of social and professional events including fellowship events, retreats, internships, and other special events.",
          },
          {
            title: "Statistics & Database",
            description:
              "In their day-to-day work, the statistics and database team will collect mission data to calculate progress in mission and developments in evangelism and Bible studies. They also create surveys and polls to help the outreach and evangelism team create more dynamic ways of outreach. Not only so, but with such a large network, keeping a database of members worldwide is crucial. The statistics and database staff play a vital role in ensuring that all data is accurate and up-to-date.",
          },
          {
            title: "Chapel & Services",
            description:
              "Our chaplain team arranges and leads weekly services while also ensuring that all members and visitors are being taken care of and provided for their well-being. They also provide spiritual guidance and counseling.",
          },
          {
            title: "Art & Design",
            description:
              "The staff of the art and design team is responsible for the visual part of Apostolos Missions resources, Bible study materials, and website design. In the case of events, the design department also supports the chapters around the world by designing flyers, banners, t-shirts, clothing, and accessories.",
          },
        ],
        appearance: { align: "center", paddingTop: "xl", paddingBottom: "xl" },
      },
      // The five remaining departments, each its own band alternating white and
      // mist — the design gives them a section apiece rather than a column,
      // and an editor can reorder or hide one without touching the others.
      {
        blockType: "cta",
        eyebrow: "In practice",
        heading: "Department of Education",
        description:
          "The department of education is made up of a team of experts who have gone through advanced studies in the Bible and/or specific fields of Christianity. The team is committed to creating useful and practical biblical resources that can be used among chapters for evangelism, Bible studies, retreats, and large group activities.",
        appearance: { background: "white", align: "center", headingSize: "md" },
      },
      {
        blockType: "cta",
        eyebrow: "In practice",
        heading: "Department of Media",
        description:
          "In an era where media and technology is rapidly spreading and the youth is actively using media for mass communication, Apostolos Missions is investing its time and effort to reach its audience through social media. Our fellowship has a group of young professionals that develop Christian content and use social media platforms to share the gospel at a large scale.",
        appearance: { background: "mist", align: "center", headingSize: "md" },
      },
      {
        blockType: "cta",
        eyebrow: "In practice",
        heading: "Department of Finance",
        description:
          "The financial department is responsible for organizing the finance of the ministry while also maintaining the financial health of the organization. The finance staff create financial reports, budgets, and make sure that the organization’s financial records abide by the local, state, and federal regulations.",
        appearance: { background: "white", align: "center", headingSize: "md" },
      },
      {
        blockType: "cta",
        eyebrow: "In practice",
        heading: "Property Management",
        description:
          "With a large property that’s serving the world mission and that is home to many staff, the AM property management is currently taking care of its headquarters facility. They do so by maintaining the property, contacting vendors in case of renovations or maintenance requests that involve plumbing, electricity, and HVAC.",
        appearance: { background: "mist", align: "center", headingSize: "md" },
      },
      {
        blockType: "cta",
        eyebrow: "In practice",
        heading: "Language Department",
        description:
          "As we are an international ministry, our organization is dedicated to reach all peoples groups with all different languages and backgrounds. One very important aspect of spreading the gospel is the need to do so by language according to the city, country, and region. Our language department works hand in hand with the departments of mission, education, and media in order to ensure that the gospel reaches to all souls across the globe.",
        appearance: { background: "white", align: "center", headingSize: "md" },
      },
    ],
  },

  "/get-involved/group-activities": {
    mode: "replace",
    blocks: [
      {
        blockType: "prose",
        heading: "Group Activities",
        appearance: { paddingBottom: "none", headingSize: "xl" },
      },
      {
        blockType: "imageText",
        eyebrow: "Campus Daily Devotional",
        heading: "Sustain Your Spirit with <hl>Morning QT</hl>",
        image: "/images/group-activities-morning-qt.webp",
        imageSide: "right",
        imageShape: "landscape",
        body: {
          markdown:
            "Campus life is often drawn to night culture, losing the freshness of the morning. God called His people to seek His truth and pray in the morning. Just as Israelites collected manna (bread) in the morning and quail (meat) in the evening, Jesus provides profound grace and renewing strength when we come to him in the morning, hear His Word, and pray in the evening.\n\n" +
            "Morning QT (Quiet Time) of the Word and prayer sustains our spiritual life on campus, full of His power and truth.",
        },
        appearance: { headingSize: "lg" },
      },
      {
        blockType: "imageText",
        eyebrow: "Deeper Understanding",
        heading: "Gather and Share at <hl>Group Bible Study</hl>",
        image: "/images/group-activities-bible-study.webp",
        imageSide: "left",
        imageShape: "landscape",
        body: {
          markdown:
            "Group Bible Study allows students to gather and share the Word and prayer. Each study session is comprised of a series of bible studies according to the theme continuing for a set period of time.\n\n" +
            "Stay tuned for the news and announcement from your chapter about upcoming Group Bible Study programs.",
        },
        appearance: { background: "paper", headingSize: "lg" },
      },
      {
        blockType: "imageText",
        eyebrow: "Weekly Gatherings",
        heading: "Experience Power in <hl>Large Group Fellowship</hl>",
        image: "/images/group-activities-fellowship.webp",
        imageSide: "right",
        imageShape: "landscape",
        body: {
          markdown:
            "When the chapter grows increasingly in number AM local chapters start to host a Large Group Fellowship every week with worship music, Bible messages, prayer, and fellowship.",
        },
        appearance: { headingSize: "lg" },
      },
      {
        blockType: "imageText",
        eyebrow: "Friday Gatherings",
        heading: "Sincere Hearts at <hl>Friday Prayer Meeting</hl>",
        image: "/images/group-activities-prayer.webp",
        imageSide: "left",
        imageShape: "landscape",
        body: {
          markdown:
            "We all have many topics to pray for. AM holds a prayer gathering every Friday. We pray for the world mission, our countries and cities, our campus, and our personal topics.\n\n" +
            "“The prayer of a righteous person is powerful and effective” (James 5:16). Praying in a group is more impactful and strengthening!",
        },
        appearance: { background: "paper", headingSize: "lg" },
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
