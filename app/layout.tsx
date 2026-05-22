import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import FeedbackModal from "@/components/FeedbackModal";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "ZugConnect",
  description: "Unofficial German transit assistant",
  manifest: "/manifest.json", // This will point to statically generated manifest or we can make an API/route for it, wait we are using static export. We will put manifest.json in public folder.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {/* Mobile-first responsive viewport container with rigid structural padding */}
          <main className="max-w-md mx-auto w-full min-h-screen px-4 py-6 flex flex-col relative overflow-hidden">
            {children}
            <FeedbackModal />
          </main>
        </Providers>
      </body>
    </html>
  );
}
