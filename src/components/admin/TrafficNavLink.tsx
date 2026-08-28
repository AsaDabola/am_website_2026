import Link from "next/link";
import type { ServerProps } from "payload";

import { IconChart } from "./Dashboard/icons";

/**
 * The way in to the Traffic screen.
 *
 * Payload's sidebar lists collections, and Traffic is not one — it is a screen
 * over counters nobody edits. This puts it at the top of the sidebar, above
 * the collections, so it reads as somewhere to go rather than something to
 * open.
 */
export function TrafficNavLink({ payload }: ServerProps) {
  const adminRoute = payload?.config?.routes?.admin ?? "/admin";
  return (
    <div className="am-nav-extra">
      <Link className="nav__link am-nav-extra__link" href={`${adminRoute}/traffic`}>
        <IconChart className="am-nav-extra__icon" />
        Traffic
      </Link>
    </div>
  );
}

export default TrafficNavLink;
