import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run on everything except Payload's admin/API routes, Next internals,
  // and static files.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
