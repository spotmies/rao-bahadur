"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Facehash } from "facehash";
import { useSession } from "@/hooks/useSession";
import { SessionModal } from "@/components/ui/SessionModal";

export default function PostTheoryPage() {
  const router = useRouter();
  const { username } = useSession();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("New");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, providedUsername?: string) => {
    if (e) e.preventDefault();
    if (!title || !content) return;

    const activeUsername = providedUsername || username;
    if (!activeUsername) {
      setShowSessionModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch("/api/theories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          author: activeUsername,
          tag
        })
      });

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/fan");
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim() !== "" && content.trim() !== "";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-safe relative">
      <SessionModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        onSuccess={(name) => handleSubmit(undefined, name)}
        message="Enter your username to post this theory!"
      />
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-serif text-3xl text-primary">Theory Posted!</h2>
            <p className="text-muted-foreground">Your voice has been added to the fandom.</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col max-w-3xl mx-auto w-full pt-28 px-4 sm:px-8"
          >
            {/* Floating Toolbar Controls */}
            <div className="fixed top-6 left-6 right-6 md:top-10 md:left-10 md:right-10 z-50 flex justify-between items-center pointer-events-none">
              <button
                onClick={() => router.back()}
                className="pointer-events-auto w-12 h-12 rounded-full shadow-lg bg-background/50 backdrop-blur-md border border-primary/30 hover:bg-primary/20 hover:border-primary transition-all flex items-center justify-center text-primary"
                aria-label="Cancel"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <Button
                onClick={() => handleSubmit()}
                disabled={!isFormValid || isSubmitting}
                className="pointer-events-auto rounded-full px-8 py-5 h-12 bg-[#f5c66d] text-black font-bold hover:bg-[#f5c66d]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>

            {/* Composer Body */}
            <div className="flex flex-col gap-6 mt-4 px-2">
              {/* Avatar Row */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-border/30 shadow-inner bg-card flex items-center justify-center">
                  {username ? (
                    <Facehash name={username} size={48} enableBlink={true} />
                  ) : (
                    <div className="text-muted-foreground opacity-50 text-sm">?</div>
                  )}
                </div>
              </div>

              {/* Form Section */}
              <div className="flex flex-col gap-6 pb-10">
                <input
                  type="text"
                  placeholder="Title: What's your theory about?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 text-xl font-bold text-foreground placeholder:text-muted-foreground/50 outline-none border border-white/10 rounded-xl p-4 focus:border-[#f5c66d]/50 transition-colors"
                />



                {/* Tags Selector */}
                <div className="flex items-center gap-4 text-[#f5c66d] text-sm font-medium py-2">
                  <span className="text-muted-foreground shrink-0">Tag:</span>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {["New", "Hidden Detail"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTag(t)}
                        className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-colors border text-xs uppercase tracking-wider font-bold ${tag === t
                          ? "bg-[#f5c66d] text-black border-[#f5c66d]"
                          : "border-[#f5c66d]/30 text-[#f5c66d] hover:bg-[#f5c66d]/10"
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="Dive deep into the details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white/5 text-lg text-foreground placeholder:text-muted-foreground/50 outline-none border border-white/10 rounded-xl p-4 resize-none min-h-[400px] leading-relaxed focus:border-[#f5c66d]/50 transition-colors"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
