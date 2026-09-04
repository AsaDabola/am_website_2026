import type { Field } from "payload";

/**
 * The look of one section, as fields.
 *
 * Every block in the page library carries this group, which is what makes the
 * promise "the colours and the gradients are editable too" hold generally
 * rather than block by block. It is a `group`, so the Postgres adapter puts it
 * on the block's own table as `appearance_*` columns — no extra tables, no
 * extra joins, and one place to add a control that then exists on every
 * section of every page at once.
 *
 * Defaults are all "inherit"/"none", so a block added and left alone looks
 * exactly like the section the design ships. Nothing here has to be filled in.
 */

/**
 * The named grounds the design already uses, so a section can match the site
 * without anyone typing a hex value. These are the tokens from globals.css —
 * changed there, they change here too, which is the point of naming them.
 */
export const BACKGROUND_PRESETS = {
  white: "var(--color-white, #ffffff)",
  paper: "var(--color-paper, #f7f9fb)",
  mist: "var(--color-mist, #e8eef8)",
  brand: "var(--color-brand-blue, #007aff)",
  navy: "var(--color-brand-navy, #2a5eec)",
  night: "var(--color-night, #050a2e)",
} as const;

/** The grounds text has to be set in white over. */
export const DARK_BACKGROUNDS = new Set<string>(["brand", "navy", "night", "image", "gradient"]);

export type BackgroundPreset = keyof typeof BACKGROUND_PRESETS;

const isCustomColour = (_: unknown, siblingData: unknown) =>
  (siblingData as { background?: string } | undefined)?.background === "colour";

const isGradient = (_: unknown, siblingData: unknown) =>
  (siblingData as { background?: string } | undefined)?.background === "gradient";

const isImage = (_: unknown, siblingData: unknown) =>
  (siblingData as { background?: string } | undefined)?.background === "image";

export const appearanceField: Field = {
  name: "appearance",
  type: "group",
  label: "Look",
  admin: {
    description:
      "Optional. Leave everything alone and this section looks the way the site's design draws it.",
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "background",
          type: "select",
          defaultValue: "default",
          options: [
            { label: "As designed", value: "default" },
            { label: "White", value: "white" },
            { label: "Off-white", value: "paper" },
            { label: "Pale blue", value: "mist" },
            { label: "Brand blue", value: "brand" },
            { label: "Deep blue", value: "navy" },
            { label: "Near-black", value: "night" },
            { label: "A colour I choose", value: "colour" },
            { label: "A gradient I choose", value: "gradient" },
            { label: "A photograph", value: "image" },
          ],
          admin: { description: "What sits behind this section." },
        },
        {
          name: "textTheme",
          type: "select",
          defaultValue: "auto",
          options: [
            { label: "Match the background", value: "auto" },
            { label: "Dark text", value: "dark" },
            { label: "Light text", value: "light" },
          ],
          admin: {
            description:
              "Left on \"match\", light text is used over a dark ground and dark text over a pale one.",
          },
        },
      ],
    },
    {
      name: "backgroundColour",
      type: "text",
      admin: {
        condition: isCustomColour,
        description: "A colour, as a hex value — #0b1526, #fff, or a CSS colour name.",
        placeholder: "#0b1526",
      },
    },
    {
      type: "row",
      admin: { condition: isGradient },
      fields: [
        {
          name: "gradientFrom",
          type: "text",
          admin: { description: "Starting colour.", placeholder: "#0b1526" },
        },
        {
          name: "gradientTo",
          type: "text",
          admin: { description: "Ending colour.", placeholder: "#1a56db" },
        },
        {
          name: "gradientAngle",
          type: "number",
          admin: {
            description: "Direction in degrees. 0 runs upward, 90 to the right, 180 downward.",
            placeholder: "135",
          },
        },
      ],
    },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      admin: { condition: isImage },
    },
    {
      type: "row",
      admin: { condition: isImage },
      fields: [
        {
          name: "overlay",
          type: "number",
          min: 0,
          max: 100,
          admin: {
            description:
              "How much the photograph is darkened so text stays readable, 0 to 100. Empty means 45.",
            placeholder: "45",
          },
        },
        {
          name: "overlayColour",
          type: "text",
          admin: { description: "The darkening colour. Empty means near-black.", placeholder: "#0b1526" },
        },
        {
          name: "focalPoint",
          type: "select",
          defaultValue: "center",
          options: [
            { label: "Centre", value: "center" },
            { label: "Top", value: "top" },
            { label: "Bottom", value: "bottom" },
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
          admin: { description: "The part of the photograph to keep in frame when it is cropped." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "paddingTop",
          type: "select",
          defaultValue: "default",
          options: [
            { label: "As designed", value: "default" },
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "Extra large", value: "xl" },
          ],
          admin: { description: "Space above the section." },
        },
        {
          name: "paddingBottom",
          type: "select",
          defaultValue: "default",
          options: [
            { label: "As designed", value: "default" },
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "Extra large", value: "xl" },
          ],
          admin: { description: "Space below the section." },
        },
        {
          name: "width",
          type: "select",
          defaultValue: "default",
          options: [
            { label: "As designed", value: "default" },
            { label: "Narrow — reading width", value: "narrow" },
            { label: "Wide", value: "wide" },
            { label: "Edge to edge", value: "full" },
          ],
          admin: { description: "How wide the content runs." },
        },
        {
          name: "align",
          type: "select",
          defaultValue: "default",
          options: [
            { label: "As designed", value: "default" },
            { label: "Left", value: "left" },
            { label: "Centred", value: "center" },
          ],
          admin: { description: "Where the text sits." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "accentColour",
          type: "text",
          admin: {
            description:
              "Overrides the brand blue used for the small heading above the title, links and buttons in this section.",
            placeholder: "#1a56db",
          },
        },
        {
          name: "anchor",
          type: "text",
          admin: {
            description:
              "An id for linking straight to this section, e.g. \"how-it-works\" makes /page#how-it-works work.",
          },
        },
      ],
    },
    {
      name: "hidden",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Keep this section but stop showing it. Better than deleting when it is coming back.",
      },
    },
  ],
};

/** The shape `appearanceField` produces, for the renderer. */
export type Appearance = {
  background?: "default" | BackgroundPreset | "colour" | "gradient" | "image" | null;
  textTheme?: "auto" | "dark" | "light" | null;
  backgroundColour?: string | null;
  gradientFrom?: string | null;
  gradientTo?: string | null;
  gradientAngle?: number | null;
  backgroundImage?: { url?: string | null } | string | null;
  overlay?: number | null;
  overlayColour?: string | null;
  focalPoint?: "center" | "top" | "bottom" | "left" | "right" | null;
  paddingTop?: "default" | "none" | "sm" | "md" | "lg" | "xl" | null;
  paddingBottom?: "default" | "none" | "sm" | "md" | "lg" | "xl" | null;
  width?: "default" | "narrow" | "wide" | "full" | null;
  align?: "default" | "left" | "center" | null;
  accentColour?: string | null;
  anchor?: string | null;
  hidden?: boolean | null;
};
