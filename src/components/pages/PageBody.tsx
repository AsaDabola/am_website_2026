import type { ReactNode } from "react";
import { PageSections } from "@/lib/renderPageBlocks";
import { getRouteLayout } from "@/lib/pageLayout";

/**
 * The editable middle of a page built in code.
 *
 * A page is not one thing. It is a hero, a sub-navigation, the body, and the
 * two bands every page ends with — and only the body is what an editor means
 * when they say they want to change the page. Wrapping the whole page and
 * replacing it drops the sub-nav and the closing bands with it, which is a
 * regression dressed up as a feature.
 *
 * So a converted page keeps its chrome and puts this around its body. The
 * sections authored in the admin fill it; with none authored, the coded body
 * renders exactly as it always did.
 *
 * A page using this must not also be wrapped in `withPageLayout` — both read
 * the same record, and the sections would be drawn twice.
 */
export default async function PageBody({
  route,
  children,
}: {
  route: string;
  children: ReactNode;
}) {
  const layout = await getRouteLayout(route);
  if (!layout) return <>{children}</>;

  const authored = <PageSections sections={layout.sections} revealFirst />;

  if (layout.mode === "replace") return authored;

  return layout.mode === "before" ? (
    <>
      {authored}
      {children}
    </>
  ) : (
    <>
      {children}
      {authored}
    </>
  );
}
