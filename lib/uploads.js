import path from "node:path";

// Images uploaded through the admin. Files added at runtime are not served
// from /public by `next start`, so they live here and are served by app/uploads/[file].
export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
export const UPLOAD_NAME = /^[a-f0-9]{24}\.(jpg|png|webp)$/;
