import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { FloatingBackButton } from "@/components/ui/FloatingBackButton";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "I Root for Rao Bahadur | Fan Tribute",
    template: "%s | I Root for Rao Bahadur",
  },
  description: "A fan tribute and destination for everyone who loved Rao Bahadur. Discover fan buzz, celebrity reactions, and join the conversation.",
  keywords: ["Rao Bahadur", "Rao Bahadur Movie", "Fan Tribute", "Movie Reviews", "Celebrity Reactions"],
  authors: [{ name: "Rao Bahadur Fans" }],
  creator: "Rao Bahadur Fans",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.raobahadur.in", // Replace with your actual deployed URL
    title: "I Root for Rao Bahadur | Fan Tribute",
    description: "A destination for everyone who loved Rao Bahadur. Discover fan buzz, celebrity reactions, and join the conversation.",
    siteName: "I Root for Rao Bahadur",
    images: [
      {
        url: "/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "I Root for Rao Bahadur Hero Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "I Root for Rao Bahadur | Fan Tribute",
    description: "A destination for everyone who loved Rao Bahadur. Discover fan buzz, celebrity reactions, and join the conversation.",
    images: ["/hero-bg.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cinzel.variable} antialiased dark scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground relative">
        <FloatingBackButton />
        <ScrollToTop />
        <main className="flex-grow flex flex-col relative z-10">
          <ProgressiveBlur position="top" />
          <ProgressiveBlur position="bottom" />
          {children}
        </main>
      </body>
    </html>
  );
}
