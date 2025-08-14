import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <div className="flex min-h-screen pb-16 sm:pb-0">
          <Sidebar />
          {/* Main content */}
          <main className="flex-1 p-6 sm:p-10 w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
