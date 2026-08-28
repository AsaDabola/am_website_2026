import type { ReactElement } from "react";

/**
 * The dashboard's icons, drawn inline.
 *
 * The admin is a small handful of screens and this is a small handful of
 * glyphs; pulling an icon package in for them would ship a library into the
 * bundle to draw eight shapes. Each is a 24-unit square so they line up
 * without per-icon nudging.
 */

type Props = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Svg({ className, children }: Props & { children: React.ReactNode }): ReactElement {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" {...stroke}>
      {children}
    </svg>
  );
}

export function IconArticle(props: Props) {
  return (
    <Svg {...props}>
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </Svg>
  );
}

export function IconCalendar(props: Props) {
  return (
    <Svg {...props}>
      <rect height="15" rx="2" width="16" x="4" y="5" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </Svg>
  );
}

export function IconPage(props: Props) {
  return (
    <Svg {...props}>
      <rect height="16" rx="2" width="16" x="4" y="4" />
      <path d="M4 9h16M9 9v11" />
    </Svg>
  );
}

export function IconPin(props: Props) {
  return (
    <Svg {...props}>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

export function IconPhoto(props: Props) {
  return (
    <Svg {...props}>
      <rect height="15" rx="2" width="18" x="3" y="5" />
      <path d="m3 16 5-4 4 3 3-2 6 5" />
      <circle cx="8.5" cy="9.5" r="1.5" />
    </Svg>
  );
}

export function IconGlobe(props: Props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14 0 17M12 3.5c-2.5 2.5-2.5 14 0 17" />
    </Svg>
  );
}

export function IconInbox(props: Props) {
  return (
    <Svg {...props}>
      <path d="M4 13 6 5h12l2 8v6H4z" />
      <path d="M4 13h4l1.5 3h5L16 13h4" />
    </Svg>
  );
}

export function IconArrow(props: Props) {
  return (
    <Svg {...props}>
      <path d="M5 12h13M13 6l6 6-6 6" />
    </Svg>
  );
}

export function IconSpark(props: Props) {
  return (
    <Svg {...props}>
      <path d="M12 3v4M12 17v4M4.9 7.5l3 2M16.1 14.5l3 2M4.9 16.5l3-2M16.1 9.5l3-2" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function IconChart(props: Props) {
  return (
    <Svg {...props}>
      <path d="M4 19V5M4 19h16" />
      <path d="m7 15 4-5 3.5 3L20 7" />
    </Svg>
  );
}

export const CARD_ICON: Record<string, (props: Props) => ReactElement> = {
  posts: IconArticle,
  events: IconCalendar,
  pages: IconPage,
  campuses: IconPin,
  media: IconPhoto,
  wording: IconGlobe,
};
