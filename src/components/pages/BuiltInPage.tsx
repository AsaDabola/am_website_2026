import type { ReactNode } from "react";
import { PageSections } from "@/lib/renderPageBlocks";
import { getRouteLayout } from "@/lib/pageLayout";

/**
 * Lets a page built in code be rearranged from the admin without giving up its
 * design.
 *
 * Each of the site's coded pages is wrapped in this. Normally it renders that
 * page and nothing else — a database round trip that finds no authored layout
 * and gets out of the way. When an editor has added sections to the page and
 * said where they go, it puts them above it, below it, or in place of it.
 *
 * Written as a wrapper around the existing component rather than as a change
 * to it, so converting a page is two lines at the bottom of its file and
 * unconverting it is deleting them. See lib/pageLayout for the modes.
 */
export default function withPageLayout<P extends object>(
  route: string,
  Page: (props: P) => ReactNode | Promise<ReactNode>,
) {
  return async function PageWithLayout(props: P) {
    const layout = await getRouteLayout(route);
    if (!layout) return <Page {...props} />;

    const authored = <PageSections sections={layout.sections} />;

    // `replace` never builds the coded page's element, so the queries it would
    // have made are not made either.
    if (layout.mode === "replace") return authored;

    return layout.mode === "before" ? (
      <>
        {authored}
        <Page {...props} />
      </>
    ) : (
      <>
        <Page {...props} />
        {authored}
      </>
    );
  };
}
