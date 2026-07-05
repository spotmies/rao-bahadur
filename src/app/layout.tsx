import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { FloatingBackButton } from "@/components/ui/FloatingBackButton";

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
        {/* Global Gaussian Blurs */}
        <div className="fixed top-[-100px] left-1/2 -translate-x-1/2 w-[80%] max-w-[800px] h-[300px] bg-accent/20 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-[-100px] left-1/2 -translate-x-1/2 w-[80%] max-w-[800px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />

        <FloatingBackButton />
        <main className="flex-grow flex flex-col relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
