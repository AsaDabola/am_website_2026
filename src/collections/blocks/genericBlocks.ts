import type { Block, Field } from "payload";

/**
 * A reusable block library any Page's `genericSections` can draw from,
 * alongside the home page's bespoke `sections` blocks (homeBlocks.ts). Ports
 * the same library already shipped on the YEF site
 * (src/payload/blocks/generic.ts there) so editing any page here has the
 * same amount of editability — text, cards, gallery, image+text, quote,
 * timeline, stats, list, feature panel, icon cards, link cards, journey, and
 * a photo grid, each with a constrained brand-safe background choice.
 */

/** Every generic block's section background, constrained to the site's own
 *  brand tokens and gradients — never a free-form color/gradient picker. */
const backgroundField: Field = {
  name: "background",
  type: "select",
  defaultValue: "white",
  options: [
    { label: "White (default)", value: "white" },
    { label: "Paper (light)", value: "paper" },
    { label: "Night (dark navy)", value: "night" },
    { label: "Brand blue", value: "blue" },
    { label: "Gradient — night to blue", value: "gradient-night-blue" },
    { label: "Gradient — blue to navy", value: "gradient-blue-navy" },
  ],
  admin: { description: "Section background — picks from the site's brand colors." },
};

export const GenericTextBlock: Block = {
  slug: "genericText",
  labels: { singular: "Text section", plural: "Text sections" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    {
      name: "paragraphs",
      type: "array",
      minRows: 1,
      admin: { description: "Shown one after another, in this order." },
      fields: [{ name: "body", type: "textarea", required: true }],
    },
  ],
};

export const GenericCardsBlock: Block = {
  slug: "genericCards",
  labels: { singular: "Cards grid", plural: "Cards grids" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    {
      name: "cards",
      type: "array",
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
        {
          name: "quote",
          type: "textarea",
          admin: { description: "Optional — an italic pull-quote under the card body." },
        },
      ],
    },
  ],
};

export const GenericImageTextBlock: Block = {
  slug: "genericImageText",
  labels: { singular: "Image + text panel", plural: "Image + text panels" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "imageAlt", type: "text" },
    {
      name: "imageSide",
      type: "select",
      defaultValue: "left",
      options: [
        { label: "Image on the left", value: "left" },
        { label: "Image on the right", value: "right" },
      ],
    },
    { name: "heading", type: "text", required: true },
    { name: "body", type: "textarea", required: true },
    {
      type: "row",
      fields: [
        {
          name: "buttonLabel",
          type: "text",
          admin: { width: "50%", description: "Optional — leave both empty for no button." },
        },
        { name: "buttonHref", type: "text", admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "buttonLabel2",
          type: "text",
          admin: { width: "50%", description: "Optional second button, shown after the first." },
        },
        { name: "buttonHref2", type: "text", admin: { width: "50%" } },
      ],
    },
  ],
};

export const GenericGalleryBlock: Block = {
  slug: "genericGallery",
  labels: { singular: "Gallery mosaic", plural: "Gallery mosaics" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    {
      name: "images",
      type: "array",
      minRows: 3,
      maxRows: 3,
      admin: { description: "Exactly three photos: one large, two stacked beside it." },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "alt", type: "text" },
      ],
    },
  ],
};

export const GenericStatsBlock: Block = {
  slug: "genericStats",
  labels: { singular: "Stats row", plural: "Stats rows" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    {
      name: "stats",
      type: "array",
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          type: "row",
          fields: [
            { name: "value", type: "text", required: true, admin: { width: "50%" } },
            { name: "label", type: "text", required: true, admin: { width: "50%" } },
          ],
        },
      ],
    },
  ],
};

export const GenericTimelineBlock: Block = {
  slug: "genericTimeline",
  labels: { singular: "Timeline", plural: "Timelines" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    {
      name: "items",
      type: "array",
      minRows: 1,
      fields: [
        {
          type: "row",
          fields: [
            { name: "year", type: "text", required: true, admin: { width: "30%" } },
            {
              name: "title",
              type: "text",
              admin: {
                width: "70%",
                description: "Optional — leave empty for a plain time/date-and-body entry.",
              },
            },
          ],
        },
        { name: "body", type: "textarea", required: true },
      ],
    },
  ],
};

export const GenericCtaBlock: Block = {
  slug: "genericCta",
  labels: { singular: "Call to action", plural: "Calls to action" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "heading", type: "text", required: true },
    { name: "body", type: "textarea" },
    {
      type: "row",
      fields: [
        { name: "buttonLabel", type: "text", required: true, admin: { width: "50%" } },
        { name: "buttonHref", type: "text", required: true, admin: { width: "50%" } },
      ],
    },
  ],
};

export const GenericQuoteBlock: Block = {
  slug: "genericQuote",
  labels: { singular: "Pull quote", plural: "Pull quotes" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "quote", type: "textarea", required: true },
    { name: "reference", type: "text" },
  ],
};

export const GenericListBlock: Block = {
  slug: "genericList",
  labels: { singular: "Bullet list", plural: "Bullet lists" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    {
      name: "items",
      type: "array",
      minRows: 1,
      fields: [{ name: "body", type: "text", required: true }],
    },
  ],
};

export const GenericFeatureBlock: Block = {
  slug: "genericFeature",
  labels: { singular: "Feature panel", plural: "Feature panels" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "heading", type: "text", required: true },
    { name: "intro", type: "textarea", required: true },
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "imageAlt", type: "text" },
    {
      name: "items",
      type: "array",
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: "icon", type: "upload", relationTo: "media" },
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "buttonLabel",
          type: "text",
          admin: { width: "50%", description: "Optional — leave both empty for no link." },
        },
        { name: "buttonHref", type: "text", admin: { width: "50%" } },
      ],
    },
  ],
};

export const GenericIconCardsBlock: Block = {
  slug: "genericIconCards",
  labels: { singular: "Icon cards row", plural: "Icon cards rows" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    {
      name: "cards",
      type: "array",
      minRows: 1,
      fields: [
        { name: "icon", type: "upload", relationTo: "media" },
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
      ],
    },
  ],
};

export const GenericLinkCardsBlock: Block = {
  slug: "genericLinkCards",
  labels: { singular: "Link cards", plural: "Link cards" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    {
      name: "cards",
      type: "array",
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "imageAlt", type: "text" },
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea" },
        { name: "href", type: "text", required: true },
      ],
    },
  ],
};

const JOURNEY_STAGE_COLORS = [
  { label: "Brand blue", value: "#007AFF" },
  { label: "Navy", value: "#2A5EEC" },
  { label: "Deep navy", value: "#1449C6" },
  { label: "Navy light", value: "#4D8DF6" },
  { label: "Night", value: "#050A2E" },
];

export const GenericJourneyBlock: Block = {
  slug: "genericJourney",
  labels: { singular: "Journey timeline", plural: "Journey timelines" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    {
      name: "stages",
      type: "array",
      minRows: 1,
      maxRows: 8,
      fields: [
        {
          type: "row",
          fields: [
            { name: "label", type: "text", required: true, admin: { width: "50%" } },
            {
              name: "color",
              type: "select",
              defaultValue: JOURNEY_STAGE_COLORS[0]?.value,
              options: JOURNEY_STAGE_COLORS,
              admin: { width: "50%" },
            },
          ],
        },
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
        {
          name: "href",
          type: "text",
          admin: { description: "Optional — an in-page anchor like #grow, or a link." },
        },
      ],
    },
  ],
};

export const GenericPhotoGridBlock: Block = {
  slug: "genericPhotoGrid",
  labels: { singular: "Photo grid", plural: "Photo grids" },
  admin: { group: "Generic sections" },
  fields: [
    backgroundField,
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    {
      name: "people",
      type: "array",
      minRows: 1,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "name", type: "text", required: true },
        { name: "title", type: "text" },
      ],
    },
  ],
};

export const genericBlocks: Block[] = [
  GenericTextBlock,
  GenericCardsBlock,
  GenericImageTextBlock,
  GenericGalleryBlock,
  GenericStatsBlock,
  GenericTimelineBlock,
  GenericCtaBlock,
  GenericQuoteBlock,
  GenericListBlock,
  GenericFeatureBlock,
  GenericIconCardsBlock,
  GenericLinkCardsBlock,
  GenericJourneyBlock,
  GenericPhotoGridBlock,
];
