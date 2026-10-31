import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";
import { isAdminConfigured } from "@/lib/auth";

export const metadata = { title: "Prijava" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const configured = isAdminConfigured();
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/brand/mark.webp" alt="" width={456} height={290} className="h-9 w-auto" priority />
          <span className="font-display text-[1.5rem] leading-none">planetatapeta</span>
        </div>
        <h1 className="t-title">Prijava za administraciju</h1>
        {configured ? (
          <LoginForm />
        ) : (
          <div className="notice notice-quiet mt-6 grid gap-2">
            <p className="font-semibold">Administracija nije podešena.</p>
            <p className="t-small">
              Postavite promenljive okruženja <code>ADMIN_PASSWORD</code> (najmanje 12 znakova) i <code>ADMIN_SESSION_SECRET</code> (najmanje 32 znaka) i ponovo pokrenite server. Uputstvo je u README fajlu.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
