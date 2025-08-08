import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "mySQE",
  description: "Track and log QWE periods and reflections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}
      >
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="sidebar flex flex-col items-center py-8 gap-8 text-white">
            <div className="w-10 h-auto">
              <Image src="/images/white-transparent.png" alt="LOD" width={40} height={40} />
            </div>
            <nav className="flex flex-col gap-6 text-white/95">
              <Link href="/" className="grid place-items-center w-12 h-12 bg-white/10 rounded-xl">
                <span className="sr-only">Dashboard</span>
                🏠
              </Link>
              <Link href="/periods" className="grid place-items-center w-12 h-12 bg-white/10 rounded-xl">
                <span className="sr-only">QWE Periods</span>
                💼
              </Link>
              <Link href="/reflections" className="grid place-items-center w-12 h-12 bg-white/10 rounded-xl">
                <span className="sr-only">Journal Reflections</span>
                📝
              </Link>
              <Link href="/emails" className="grid place-items-center w-12 h-12 bg-white/10 rounded-xl">
                ✉️
              </Link>
              <Link href="/settings" className="grid place-items-center w-12 h-12 bg-white/10 rounded-xl">
                ⚙️
              </Link>
            </nav>
          </aside>
          {/* Main content */}
          <main className="flex-1 p-10 sm:p-14">{children}</main>
        </div>
      </body>
    </html>
  );
}
