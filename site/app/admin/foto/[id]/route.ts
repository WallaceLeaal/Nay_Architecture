import { hasAdminSession } from "../../../../lib/admin-auth";
import { serveStoredImage } from "../../../../lib/project-files";
import { readId } from "../../../../lib/project-input";
import { getImageKey } from "../../../../lib/project-store";

export async function GET(_: Request, { params }: RouteContext<"/admin/foto/[id]">) {
  if (!(await hasAdminSession())) return serveStoredImage(undefined);
  const id = readId((await params).id);
  return serveStoredImage(id ? await getImageKey(id, false) : undefined);
}
