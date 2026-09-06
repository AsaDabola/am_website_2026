import type { Block, Field } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { appearanceField } from "./appearance";

/**
 * The general-purpose sections any page can be built from.
 *
 * Distinct from `homeBlocks`, which are the homepage's own named sections —
 * "Our Network", "Honorary Chairman" — each with its own bespoke layout and
 * its own fields. These are the shapes that recur across the rest of the site:
 * a band of prose, a picture beside text, a grid of cards, a row of numbers, a
 * list of people. Between them they cover what the built-in pages actually do,
 * so a page can be rebuilt out of them without a deploy.
 *
 * Every one of them carries `appearanceField`, so the background, gradient,
 * colours, spacing, width and alignment of each section are editable, and the
 * blocks field they live in is drag-reorderable — which is the "organisation
 * of parts" half of editable.
 *
 * There is deliberately no raw-HTML block. This CMS is shared by ~68 country
 * editors; a block that runs whatever markup is typed into it would let any
 * one of them put script on their site, and the honest answer is an Embed
 * block that takes an address instead.
 *
 * Text typed into a block **is** translated, the same way an article is: the
 * page_translations table holds one row per page per language, filled by
 * scripts/translate-pages.mts and read by src/lib/pageTranslations.ts, which
 * the page builder already calls. A page with nothing stored for the language
 * being read shows the words it was written in, so a country site is never
 * broken by a page nobody has translated yet.
 *
 * That means a field added here becomes translatable by being a text,
 * textarea or richText field — the translator reads these definitions to know
 * what counts as prose, rather than keeping its own list. A text field that is
 * *not* prose (an address, an anchor, a colour) has to be named in that
 * script's NOT_PROSE set, or it will be translated and stop working.
 */

/** A link, styled as a button. Used by several blocks, so it lives once here. */
const buttons: Field = {
  name: "buttons",
  type: "array",
  labels: { singular: "Button", plural: "Buttons" },
  maxRows: 3,
  admin: { description: "Optional. Up to three." },
  fields: [
    {
      type: "row",
      fields: [
        { name: "label", type: "text", required: true },
        {
          name: "href",
          type: "text",
          required: true,
          admin: { description: 'A path on this site, e.g. "/get-involved", or a full web address.' },
        },
        {
          name: "style",
          type: "select",
          defaultValue: "primary",
          options: [
            { label: "Solid", value: "primary" },
            { label: "Outlined", value: "secondary" },
            { label: "Plain link", value: "link" },
          ],
        },
      ],
    },
  ],
};

/** The small line above a heading, plus the heading itself. */
const headingFields: Field[] = [
  {
    type: "row",
    fields: [
      {
        name: "eyebrow",
        type: "text",
        admin: { description: "The small line above the heading. Optional." },
      },
      { name: "heading", type: "text" },
    ],
  },
];

const columns: Field = {
  name: "columns",
  type: "select",
  defaultValue: "3",
  options: [
    // One across is a single picture at the section's width — a banner, a
    // scanned poster, the one photograph a page opens on.
    { label: "One across", value: "1" },
    { label: "Two across", value: "2" },
    { label: "Three across", value: "3" },
    { label: "Four across", value: "4" },
    { label: "Five across", value: "5" },
  ],
  admin: { description: "On a wide screen. Narrower screens rewrap on their own." },
};

export const BannerBlock: Block = {
  slug: "banner",
  labels: { singular: "Banner", plural: "Banners" },
  admin: {
    // Shown under the block's name in the editor's picker, so the list of
    // fifteen reads as a menu of shapes rather than fifteen slugs.
    group: "Page sections",
  },
  fields: [
    ...headingFields,
    { name: "subheading", type: "textarea" },
    {
      name: "showBreadcrumbs",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Show the trail of links back to the home page." },
    },
    {
      name: "height",
      type: "select",
      defaultValue: "md",
      options: [
        { label: "Short", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Tall", value: "lg" },
        { label: "Full screen", value: "full" },
      ],
    },
    buttons,
    appearanceField,
  ],
};

export const ProseBlock: Block = {
  slug: "prose",
  labels: { singular: "Text", plural: "Text" },
  admin: { group: "Page sections" },
  fields: [
    ...headingFields,
    {
      name: "layout",
      type: "select",
      defaultValue: "stacked",
      options: [
        { label: "Heading above the text", value: "stacked" },
        { label: "Heading beside the text", value: "aside" },
      ],
      admin: {
        description:
          "Beside sets the title in a narrow column on the left with the text alongside it, under a short blue rule — how the internship tracks are drawn.",
      },
    },
    {
      name: "body",
      type: "richText",
      editor: lexicalEditor(),
      admin: { description: "Headings, paragraphs, lists and links." },
    },
    buttons,
    appearanceField,
  ],
};

export const ImageTextBlock: Block = {
  slug: "imageText",
  labels: { singular: "Picture beside text", plural: "Picture beside text" },
  admin: { group: "Page sections" },
  fields: [
    ...headingFields,
    { name: "body", type: "richText", editor: lexicalEditor() },
    { name: "image", type: "upload", relationTo: "media" },
    {
      type: "row",
      fields: [
        {
          name: "imageSide",
          type: "select",
          defaultValue: "right",
          options: [
            { label: "Picture on the left", value: "left" },
            { label: "Picture on the right", value: "right" },
          ],
        },
        {
          name: "imageShape",
          type: "select",
          defaultValue: "landscape",
          options: [
            { label: "Landscape", value: "landscape" },
            { label: "Square", value: "square" },
            { label: "Portrait", value: "portrait" },
            { label: "Its own shape", value: "natural" },
          ],
        },
        {
          name: "imageRounded",
          type: "checkbox",
          defaultValue: true,
          admin: { description: "Rounded corners." },
        },
        {
          name: "imageSize",
          type: "select",
          defaultValue: "full",
          options: [
            { label: "Fills its half", value: "full" },
            { label: "Medium", value: "medium" },
            { label: "Small", value: "small" },
          ],
          admin: {
            description:
              "How much of its half the picture takes. The pillars of mission hold theirs to a small square rather than letting it fill the column.",
          },
        },
      ],
    },
    buttons,
    appearanceField,
  ],
};

export const CardsBlock: Block = {
  slug: "cards",
  labels: { singular: "Cards", plural: "Cards" },
  admin: { group: "Page sections" },
  fields: [
    ...headingFields,
    { name: "intro", type: "textarea" },
    columns,
    {
      name: "layout",
      type: "select",
      defaultValue: "card",
      options: [
        { label: "Cards", value: "card" },
        { label: "Columns under a rule", value: "ruled" },
      ],
      admin: {
        description:
          "Cards carry a picture and lift off the page. Columns under a rule are text only, each under a short line — what the departments and the pillars are set as.",
      },
    },
    {
      name: "cards",
      type: "array",
      minRows: 1,
      admin: { initCollapsed: false },
      fields: [
        { name: "image", type: "upload", relationTo: "media" },
        {
          name: "icon",
          type: "select",
          options: [
            { label: "None", value: "" },
            { label: "Heart", value: "heart" },
            { label: "Book", value: "book" },
            { label: "Screen", value: "monitor" },
            { label: "Palette", value: "palette" },
            { label: "People", value: "people" },
            { label: "Map pin", value: "pin" },
            { label: "Calendar", value: "calendar" },
            { label: "Newspaper", value: "newspaper" },
            { label: "Graduation cap", value: "graduation" },
            { label: "Gift", value: "gift" },
          ],
          admin: {
            description:
              "Drawn in a pale circle above the title, in place of a picture. What the ways to volunteer are set with.",
          },
        },
        {
          type: "row",
          fields: [
            { name: "tag", type: "text", admin: { description: "A small label on the card. Optional." } },
            { name: "title", type: "text", required: true },
          ],
        },
        { name: "description", type: "textarea" },
        {
          type: "row",
          fields: [
            { name: "href", type: "text", admin: { description: "Where the card goes when clicked. Optional." } },
            { name: "linkLabel", type: "text", admin: { description: 'Defaults to "Learn more".' } },
          ],
        },
      ],
    },
    appearanceField,
  ],
};

export const PeopleBlock: Block = {
  slug: "people",
  labels: { singular: "People", plural: "People" },
  admin: { group: "Page sections" },
  fields: [
    ...headingFields,
    columns,
    {
      name: "people",
      type: "array",
      minRows: 1,
      labels: { singular: "Person", plural: "People" },
      admin: {
        initCollapsed: true,
        description:
          "Drag to reorder. Someone with no photograph shows their initials on the design's pale blue tile.",
      },
      fields: [
        { name: "photo", type: "upload", relationTo: "media" },
        {
          name: "photoPath",
          type: "text",
          admin: {
            readOnly: true,
            description:
              "A portrait that ships with the site, put here when this page was imported. Choose a picture above to replace it.",
          },
        },
        {
          type: "row",
          fields: [
            { name: "name", type: "text", required: true },
            { name: "role", type: "text" },
          ],
        },
        { name: "bio", type: "textarea", admin: { description: "Optional. Shown under the role." } },
        {
          type: "row",
          fields: [
            { name: "email", type: "email" },
            {
              name: "startsRow",
              type: "checkbox",
              defaultValue: false,
              admin: { description: "Start a new row here, to separate one group from the next." },
            },
            {
              name: "featured",
              type: "checkbox",
              defaultValue: false,
              admin: {
                description:
                  "Show above the others in a wide row, with room for the paragraph. For the one or two people whose story is on the page.",
              },
            },
          ],
        },
      ],
    },
    appearanceField,
  ],
};

export const StatsBlock: Block = {
  slug: "stats",
  labels: { singular: "Numbers", plural: "Numbers" },
  admin: { group: "Page sections" },
  fields: [
    ...headingFields,
    {
      name: "stats",
      type: "array",
      minRows: 1,
      maxRows: 6,
      admin: { initCollapsed: false },
      fields: [
        {
          type: "row",
          fields: [
            { name: "value", type: "text", required: true, admin: { description: 'e.g. "68" or "1,200+"' } },
            { name: "label", type: "text", required: true },
          ],
        },
      ],
    },
    appearanceField,
  ],
};

export const StepsBlock: Block = {
  slug: "steps",
  labels: { singular: "Numbered list", plural: "Numbered lists" },
  admin: { group: "Page sections" },
  fields: [
    ...headingFields,
    {
      name: "stepsLayout",
      type: "select",
      defaultValue: "list",
      options: [
        { label: "A list, one per row", value: "list" },
        { label: "Columns, each under a rule", value: "columns" },
      ],
      admin: {
        description:
          "A list reads down the page with the number small beside each title. Columns set the number large and pale behind it, side by side — how the steps to becoming a Bible teacher are drawn.",
      },
    },
    {
      name: "steps",
      type: "array",
      minRows: 1,
      admin: {
        initCollapsed: false,
        description: "Numbered automatically in the order they sit in — drag to renumber.",
      },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "href", type: "text", admin: { description: "Optional link for the row." } },
      ],
    },
    appearanceField,
  ],
};

export const NoticeBlock: Block = {
  slug: "notice",
  labels: { singular: "Notice", plural: "Notices" },
  admin: { group: "Page sections" },
  fields: [
    {
      name: "tone",
      type: "select",
      defaultValue: "warning",
      options: [
        { label: "Deadline or warning", value: "warning" },
        { label: "Something to know", value: "info" },
        { label: "Good news", value: "success" },
      ],
      admin: { description: "Sets the colour of the rule down its side." },
    },
    {
      name: "body",
      type: "richText",
      editor: lexicalEditor(),
      admin: { description: "Short. A notice that runs long stops being read as one." },
    },
    appearanceField,
  ],
};

export const TimelineBlock: Block = {
  slug: "timeline",
  labels: { singular: "Timeline", plural: "Timelines" },
  admin: { group: "Page sections" },
  fields: [
    ...headingFields,
    {
      name: "milestones",
      type: "array",
      minRows: 1,
      labels: { singular: "Milestone", plural: "Milestones" },
      admin: {
        initCollapsed: false,
        description: "In the order they happened. The rail fills as a reader opens them.",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "tag",
              type: "text",
              required: true,
              admin: { description: "The year, or a word for the period — \"2015\", \"Founding\"." },
            },
            { name: "title", type: "text", required: true },
          ],
        },
        { name: "description", type: "textarea" },
      ],
    },
    appearanceField,
  ],
};

export const AccordionBlock: Block = {
  slug: "accordion",
  labels: { singular: "Questions & answers", plural: "Questions & answers" },
  admin: { group: "Page sections" },
  fields: [
    ...headingFields,
    {
      name: "items",
      type: "array",
      minRows: 1,
      labels: { singular: "Question", plural: "Questions" },
      admin: { initCollapsed: false },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "richText", editor: lexicalEditor() },
      ],
    },
    appearanceField,
  ],
};

export const QuoteBlock: Block = {
  slug: "quote",
  labels: { singular: "Quotation", plural: "Quotations" },
  admin: { group: "Page sections" },
  fields: [
    {
      name: "style",
      type: "select",
      defaultValue: "feature",
      options: [
        { label: "Large, with quotation marks", value: "feature" },
        { label: "Ruled down the side", value: "rule" },
      ],
      admin: {
        description:
          "Ruled is the shorter one the About, Mission statement and Statement of faith pages set a verse in — a blue rule down the leading side, no quotation marks added.",
      },
    },
    { name: "quote", type: "textarea", required: true },
    {
      type: "row",
      fields: [
        { name: "attribution", type: "text", admin: { description: "Who said it." } },
        { name: "role", type: "text", admin: { description: "Their role, shown smaller underneath." } },
      ],
    },
    { name: "image", type: "upload", relationTo: "media", admin: { description: "Their portrait. Optional." } },
    appearanceField,
  ],
};

export const GalleryBlock: Block = {
  slug: "gallery",
  labels: { singular: "Gallery", plural: "Galleries" },
  admin: { group: "Page sections" },
  fields: [
    ...headingFields,
    columns,
    {
      name: "imageShape",
      type: "select",
      defaultValue: "landscape",
      options: [
        { label: "Landscape", value: "landscape" },
        { label: "Square", value: "square" },
        { label: "Portrait", value: "portrait" },
        { label: "Its own shape", value: "natural" },
      ],
      admin: {
        description:
          "The frame each picture is cropped to. \"Its own shape\" crops nothing — use it for a wide banner or a poster, which a square or landscape frame cuts the ends off.",
      },
    },
    {
      name: "images",
      type: "array",
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text" },
      ],
    },
    appearanceField,
  ],
};

export const CtaBlock: Block = {
  slug: "cta",
  labels: { singular: "Call to action", plural: "Calls to action" },
  admin: { group: "Page sections" },
  fields: [
    ...headingFields,
    { name: "description", type: "textarea" },
    buttons,
    appearanceField,
  ],
};

export const EmbedBlock: Block = {
  slug: "embed",
  labels: { singular: "Video or embed", plural: "Videos and embeds" },
  admin: { group: "Page sections" },
  fields: [
    ...headingFields,
    {
      name: "url",
      type: "text",
      required: true,
      admin: {
        description:
          "A YouTube, Vimeo or Google Maps address. Paste the address from the browser — it does not need to be an embed link.",
      },
    },
    {
      name: "ratio",
      type: "select",
      defaultValue: "16-9",
      options: [
        { label: "Widescreen (16:9)", value: "16-9" },
        { label: "Square (1:1)", value: "1-1" },
        { label: "Portrait (9:16)", value: "9-16" },
        { label: "Wide (21:9)", value: "21-9" },
      ],
    },
    { name: "caption", type: "text" },
    appearanceField,
  ],
};

export const LogosBlock: Block = {
  slug: "logos",
  labels: { singular: "Logo strip", plural: "Logo strips" },
  admin: { group: "Page sections" },
  fields: [
    ...headingFields,
    {
      name: "logos",
      type: "array",
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        {
          type: "row",
          fields: [
            { name: "name", type: "text", admin: { description: "Read aloud by screen readers." } },
            { name: "href", type: "text" },
          ],
        },
      ],
    },
    appearanceField,
  ],
};

export const SpacerBlock: Block = {
  slug: "spacer",
  labels: { singular: "Space or divider", plural: "Spaces and dividers" },
  admin: { group: "Page sections" },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "height",
          type: "select",
          defaultValue: "md",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "Extra large", value: "xl" },
          ],
        },
        {
          name: "rule",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Draw a line across the middle of the space." },
        },
      ],
    },
    appearanceField,
  ],
};

/**
 * The blocks any page can be assembled from.
 *
 * Order is the order they appear in the "Add section" menu, so the shapes an
 * editor reaches for most are at the top.
 */
export const pageBlocks: Block[] = [
  BannerBlock,
  ProseBlock,
  ImageTextBlock,
  CardsBlock,
  PeopleBlock,
  StepsBlock,
  StatsBlock,
  TimelineBlock,
  NoticeBlock,
  AccordionBlock,
  QuoteBlock,
  GalleryBlock,
  CtaBlock,
  EmbedBlock,
  LogosBlock,
  SpacerBlock,
];
