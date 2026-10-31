export const metadata = {
  title: { default: "Administracija", template: "%s | Administracija" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <div className="min-h-dvh bg-paper">{children}</div>;
}
