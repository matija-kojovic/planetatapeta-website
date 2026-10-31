import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/uploads";

const MAX_BYTES = 5 * 1024 * 1024;

/** Identifies the image type from its first bytes; the browser-supplied type and name are ignored. */
function sniffImage(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  const ascii = (start, end) => String.fromCharCode(...bytes.subarray(start, end));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

// POST /api/upload — admin only. Product images: JPG, PNG or WebP up to 5 MB.
export async function POST(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  if (Number(request.headers.get("content-length") || 0) > MAX_BYTES + 64 * 1024) {
    return Response.json({ error: "Slika je veća od 5 MB." }, { status: 413 });
  }

  let file;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return Response.json({ error: "Neispravan zahtev." }, { status: 400 });
  }
  if (!file || typeof file.arrayBuffer !== "function") return Response.json({ error: "Izaberite sliku." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Slika je veća od 5 MB." }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const extension = sniffImage(bytes);
  if (!extension) return Response.json({ error: "Dozvoljene su samo JPG, PNG i WebP slike." }, { status: 415 });

  const name = `${crypto.randomBytes(12).toString("hex")}.${extension}`;
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOAD_DIR, name), bytes);
  } catch (error) {
    console.error("Upload could not be stored:", error.code || error.message);
    return Response.json({ error: "Otpremanje nije moguće: skladište na ovom serveru je samo za čitanje." }, { status: 503 });
  }
  return Response.json({ url: `/uploads/${name}` }, { status: 201 });
}
