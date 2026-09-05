import Link from "next/link";
import type { ServerProps } from "payload";

import { IconGlobe } from "./Dashboard/icons";

/**
 * The way in to the Leaders overview.
 *
 * Beside Traffic, and for the same reason: the collection is in the sidebar
 * already, but the thing people come for is the count by continent and
 * country, and that is a screen rather than a list.
 */
export function LeadersNavLink({ payload }: ServerProps) {
  const adminRoute = payload?.config?.routes?.admin ?? "/admin";
  return (
    <div className="am-nav-extra">
      <Link className="nav__link am-nav-extra__link" href={`${adminRoute}/leaders`}>
        <IconGlobe className="am-nav-extra__icon" />
        Leaders
      </Link>
    </div>
  );
}

export default LeadersNavLink;
