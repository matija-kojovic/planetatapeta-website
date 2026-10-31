import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { isStorageWritable } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }) {
  // Second check behind proxy.js: never render admin data without a valid session.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) redirect("/admin/login");

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_minmax(0,1fr)]">
      <AdminNav />
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        {!isStorageWritable() ? (
          <p className="notice notice-error mb-8">
            Skladište na ovom serveru je samo za čitanje, pa se izmene ne mogu sačuvati. Na Vercelu je za administraciju potrebna baza podataka (vidi README).
          </p>
        ) : null}
        {children}
      </main>
    </div>
  );
}
