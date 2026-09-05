import type { Block } from "payload";

const stat: Block["fields"] = [
  { name: "value", type: "text", required: true },
  { name: "label", type: "text", required: true },
];

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "headingLine1", type: "text", required: true },
    { name: "headingHighlight1", type: "text", required: true },
    { name: "headingHighlight2", type: "text", required: true },
    { name: "joinBibleStudyLabel", type: "text", required: true },
    { name: "whoWeAreLabel", type: "text", required: true },
    { name: "backgroundImage", type: "upload", relationTo: "media" },
    {
      name: "slides",
      type: "array",
      labels: { singular: "Slide", plural: "Slides" },
      admin: {
        description:
          "The rotating slides behind the headline. Add, remove or reorder them here. Leave a line empty and that slide keeps the wording the site ships, which is translated into every language; type into it and this site says that instead.",
        initCollapsed: false,
      },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        {
          type: "row",
          fields: [
            { name: "line1", type: "text", admin: { description: "First line of the headline." } },
            { name: "line2", type: "text", admin: { description: "Second line, drawn lighter." } },
          ],
        },
      ],
    },
    /**
     * The three figures that used to sit under the buttons — founded, city,
     * reach. The hero no longer draws them: they landed across the middle of
     * the photograph, which is where the faces are.
     *
     * Kept, not deleted, for the reason the Get Involved card description is:
     * the columns already exist on the deployed database, so removing them
     * would be a destructive migration bought for nothing, and the row may
     * come back somewhere the design has space for it. Read-only, so an editor
     * is told rather than left filling in fields that do nothing.
     */
    {
      type: "row",
      admin: { condition: () => false },
      fields: [
        { name: "stat1", type: "group", fields: stat },
        { name: "stat2", type: "group", fields: stat },
        { name: "stat3", type: "group", fields: stat },
      ],
    },
  ],
};

export const BibleStudyProgramBlock: Block = {
  slug: "bibleStudyProgram",
  labels: { singular: "Bible Study Program", plural: "Bible Study Program" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    { name: "ctaLabel", type: "text", required: true },
    { name: "image", type: "upload", relationTo: "media" },
  ],
};

export const QuickLinksBlock: Block = {
  slug: "quickLinks",
  labels: { singular: "Quick Links", plural: "Quick Links" },
  fields: [
    {
      name: "links",
      type: "array",
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          name: "icon",
          type: "select",
          required: true,
          options: ["book", "pin", "people", "heart"],
        },
        { name: "title", type: "text", required: true },
        { name: "description", type: "text", required: true },
        { name: "href", type: "text", required: true },
      ],
    },
  ],
};

export const MinistriesBlock: Block = {
  slug: "ministries",
  labels: { singular: "Four Steps", plural: "Four Steps" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "getInvolvedLabel", type: "text", required: true },
    {
      name: "steps",
      type: "array",
      minRows: 1,
      maxRows: 4,
      fields: [
        { name: "tag", type: "text", required: true },
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
        { name: "href", type: "text", required: true },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
  ],
};

export const OurMissionBlock: Block = {
  slug: "ourMission",
  labels: { singular: "Our Mission", plural: "Our Mission" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "statementPrefix", type: "text", required: true },
    { name: "statementEmphasis", type: "text", required: true },
    { name: "statementSuffix", type: "text", required: true },
    { name: "readFullStatementLabel", type: "text", required: true },
    { name: "nameOrigin", type: "textarea", required: true },
    { name: "history", type: "textarea", required: true },
    { name: "ourHistoryLabel", type: "text", required: true },
  ],
};

export const GetInvolvedBlock: Block = {
  slug: "getInvolved",
  labels: { singular: "Get Involved Cards", plural: "Get Involved Cards" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    {
      name: "cards",
      type: "array",
      minRows: 1,
      maxRows: 3,
      fields: [
        { name: "title", type: "text", required: true },
        /**
         * Not drawn by the current layout, which sets the title over the
         * photograph and has nowhere to put a body. It stays because its
         * column already exists on the deployed database — dropping it would
         * be a destructive migration for no gain — and because the four-card
         * variant that did use it may come back.
         */
        { name: "description", type: "textarea", admin: { readOnly: true, description: "Not shown by the current card design." } },
        { name: "href", type: "text", required: true },
        { name: "image", type: "upload", relationTo: "media", required: true },
      ],
    },
  ],
};

export const MediaBlock: Block = {
  slug: "media",
  labels: { singular: "Media Feed", plural: "Media Feed" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "moreContentsLabel", type: "text", required: true },
    { name: "playVideoLabel", type: "text", required: true },
  ],
};

export const EventsBlock: Block = {
  slug: "events",
  labels: { singular: "Events Feed", plural: "Events Feed" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "allEventsLabel", type: "text", required: true },
  ],
};

export const OurNetworkBlock: Block = {
  slug: "ourNetwork",
  labels: { singular: "Our Network", plural: "Our Network" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    { name: "startChapterLabel", type: "text", required: true },
    { name: "searchPlaceholder", type: "text", required: true },
    { name: "noMatchesLabel", type: "text", required: true },
  ],
};

export const HonoraryChairmanBlock: Block = {
  slug: "honoraryChairman",
  labels: { singular: "Honorary Chairman", plural: "Honorary Chairman" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "followingLegacy", type: "text", required: true },
    { name: "name", type: "text", required: true },
    { name: "quoteLine1", type: "text", required: true },
    { name: "quoteLine2", type: "text", required: true },
    { name: "quoteLine3", type: "text", required: true },
    { name: "quoteReference", type: "text", required: true },
    { name: "image", type: "upload", relationTo: "media" },
  ],
};

export const PartnerWithUsBlock: Block = {
  slug: "partnerWithUs",
  labels: { singular: "Partner With Us", plural: "Partner With Us" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    { name: "giveTodayLabel", type: "text", required: true },
    { name: "talkToUsLabel", type: "text", required: true },
  ],
};

export const NewsletterBlock: Block = {
  slug: "newsletter",
  labels: { singular: "Newsletter Banner", plural: "Newsletter Banner" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    { name: "ctaLabel", type: "text", required: true },
    { name: "backgroundImage", type: "upload", relationTo: "media" },
  ],
};

export const homeBlocks: Block[] = [
  HeroBlock,
  BibleStudyProgramBlock,
  QuickLinksBlock,
  MinistriesBlock,
  OurMissionBlock,
  GetInvolvedBlock,
  MediaBlock,
  EventsBlock,
  OurNetworkBlock,
  HonoraryChairmanBlock,
  PartnerWithUsBlock,
  NewsletterBlock,
];
