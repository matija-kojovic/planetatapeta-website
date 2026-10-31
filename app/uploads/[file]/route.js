import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR, UPLOAD_NAME } from "@/lib/uploads";

// Serves images uploaded through the admin (see lib/uploads.js).

const TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_request, { params }) {
  const { file } = await params;
  const match = UPLOAD_NAME.exec(file);
  if (!match) return new Response("Not found", { status: 404 });
  try {
    const data = fs.readFileSync(path.join(UPLOAD_DIR, file));
    return new Response(data, {
      headers: {
        "Content-Type": TYPES[match[1]],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
