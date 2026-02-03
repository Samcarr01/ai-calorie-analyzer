import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Calorie Analyzer",
  description: "Take a photo of your meal and instantly get nutrition estimates",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CalorieAI",
  },
  openGraph: {
    title: "AI Calorie Analyzer",
    description: "Instant nutrition analysis from meal photos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Calorie Analyzer",
    description: "Instant nutrition analysis from meal photos",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b0f1f" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className={`${manrope.className} antialiased`}>
        <div className="app-shell">
          <div className="ambient-orbs" aria-hidden="true">
            <span className="orb orb-one" />
            <span className="orb orb-two" />
            <span className="orb orb-three" />
          </div>
          <div className="app-content">{children}</div>
        </div>
      </body>
    </html>
  );
}
