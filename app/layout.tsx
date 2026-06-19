import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";

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
  const themeScript = `
    try {
      const settings = localStorage.getItem("homey-settings");
      const darkMode = settings ? Boolean(JSON.parse(settings).darkMode) : false;
      document.documentElement.classList.toggle("dark", darkMode);
      document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    } catch {}
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
