import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Wraps Payload's local API so the marketing site keeps rendering with its
 * built-in fallback content whenever the CMS isn't reachable yet (no
 * database connected) or a collection is still empty — instead of failing
 * the page or the build.
 */
export async function fetchCollectionSafely<T>(
  run: (payload: Awaited<ReturnType<typeof getPayload>>) => Promise<T[]>,
): Promise<T[] | null> {
  try {
    const payload = await getPayload({ config });
    const docs = await run(payload);
    return docs.length > 0 ? docs : null;
  } catch (error) {
    console.warn("[payload] Falling back to default content:", (error as Error).message);
    return null;
  }
}
