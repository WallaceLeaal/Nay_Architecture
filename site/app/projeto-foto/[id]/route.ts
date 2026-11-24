import { serveStoredImage } from "../../../lib/project-files";
import { readId } from "../../../lib/project-input";
import { getImageKey } from "../../../lib/project-store";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: RouteContext<"/projeto-foto/[id]">) {
  const id = readId((await params).id);
  return serveStoredImage(id ? await getImageKey(id, true) : undefined);
}
