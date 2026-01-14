import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PERKESO - Prosecution Paper Builder",
  description: "Sistem dalaman untuk menyediakan dokumen pendakwaan Akta 4 & Akta 800",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

