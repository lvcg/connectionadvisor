import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DomiVault | Home and Vehicle Records Vault",
  description: "Secure home, vehicle, receipt, warranty, maintenance, and report vault.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
