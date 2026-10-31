const isDev = process.env.NODE_ENV !== "production";

// Next.js needs inline scripts for hydration; 'unsafe-eval' and websockets only in development.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

// Old URLs keep working: categories moved from /category/{id} to /{slug}.
const legacyCategories = {
  tapete: "tapete",
  zidni_stikeri: "zidni-stikeri",
  slike_na_platnu: "slike-na-platnu",
  slike_na_pleksiglasu: "slike-na-pleksiglasu",
  izrada_nalepnica: "izrada-nalepnica",
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      ...Object.entries(legacyCategories).flatMap(([oldId, slug]) => [
        { source: `/category/${oldId}`, destination: `/${slug}`, permanent: true },
        { source: `/category/${oldId}/:collection`, destination: `/${slug}/:collection`, permanent: true },
      ]),
      { source: "/category/:rest*", destination: "/", permanent: true },
      { source: "/privacy", destination: "/politika-privatnosti", permanent: true },
      { source: "/terms", destination: "/uslovi-koriscenja", permanent: true },
    ];
  },
};

export default nextConfig;
