import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import FeedbackModal from "@/components/FeedbackModal";

const inter = Inter({ subsets: ["latin"] });
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/ZugConnect";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow users to zoom for accessibility (do not lock maximumScale/userScalable)
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "ZugConnect",
  description: "Unofficial German transit assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href={`${basePath}/manifest.webmanifest`} />
      </head>
      <body className={inter.className}>
        <Providers>
          {/* Skip link for keyboard and screen reader users */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          {/* Mobile-first responsive viewport container with rigid structural padding */}
          <main id="main-content" className="max-w-md mx-auto w-full min-h-screen px-4 py-6 flex flex-col relative overflow-hidden">
            {children}
            <FeedbackModal />
          </main>
        </Providers>
      </body>
    </html>
  );
}
