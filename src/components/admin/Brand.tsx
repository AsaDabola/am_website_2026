import LogoMark from "@/components/ui/LogoMark";

/**
 * The AM artwork, where Payload draws its own.
 *
 * `AdminLogo` is the mark on the login screen and `AdminIcon` the small one in
 * the header, so signing in to the admin looks like signing in to this
 * organisation rather than to a CMS.
 *
 * They are not the same drawing. The login screen has room for the wordmark
 * the website uses, "INTERNATIONAL" and all; the header slot is eighteen
 * pixels tall, where that line would be an unreadable smear, so the header
 * gets the letterforms alone — the same two shapes as the site's favicon,
 * cropped to themselves so nothing is wasted on empty margin.
 *
 * Both size themselves off `className`, and the site passes Tailwind classes
 * for that. The admin has no Tailwind, so the sizing lives in
 * app/(payload)/custom.css instead.
 */

export function AdminLogo() {
  return <LogoMark className="am-brand am-brand--logo" />;
}

export function AdminIcon() {
  return (
    <svg
      aria-hidden="true"
      className="am-brand am-brand--icon"
      fill="currentColor"
      // The artwork sits at x 14–484, y 139–353 of the favicon's 512 square.
      viewBox="14 139 470 214"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M35.7,303.9l72.9-164.1h39.6l94.6,212.7h-125l-21.3-48.7h70.2l-38-85.6-59.8,134.3H14" />
      <path d="M484.1,352.6h-48.9v-96.3l-50.4,96.3h-30.5l-50.4-96.3v96.3h-48.9v-212.7h48.9l65.6,130.7,65.7-130.7h48.9v212.7Z" />
    </svg>
  );
}
