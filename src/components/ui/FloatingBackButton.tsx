"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "./Button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function FloatingBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/fan");
    }
  };

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleSearch = (e: Event) => {
      setIsSearchOpen((e as CustomEvent).detail);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("search-toggled", handleSearch);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("search-toggled", handleSearch);
    };
  }, []);

  if (!mounted) return null;
  if (pathname === "/" || pathname === "/post") return null;

  return (
    <AnimatePresence>
      {!isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{
            opacity: isScrolled ? 0 : 1,
            y: isScrolled ? -20 : 0,
            scale: isScrolled ? 0.8 : 1
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`fixed top-6 left-6 z-50 md:top-10 md:left-10 ${isScrolled ? 'pointer-events-none' : 'pointer-events-auto'}`}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="w-12 h-12 rounded-full shadow-lg bg-background/50 backdrop-blur-md border-primary/30 hover:bg-primary/20 hover:border-primary hover:text-primary transition-all flex items-center justify-center text-primary"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
