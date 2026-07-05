import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { FloatingBackButton } from "@/components/ui/FloatingBackButton";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "I Root for Rao Bahadur",
  description: "Enter the Fandom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cinzel.variable} antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground relative">
        <ProgressiveBlur position="top" />
        <ProgressiveBlur position="bottom" />

        <FloatingBackButton />
        <main className="flex-grow flex flex-col relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
