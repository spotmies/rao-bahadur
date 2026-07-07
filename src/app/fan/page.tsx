"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Tweet, TweetSkeleton } from "@/components/ui/tweet";
import { SessionModal } from "@/components/ui/SessionModal";
import { useSession } from "@/hooks/useSession";
import { Facehash } from "facehash";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getTabIcon = (filterName: string) => {
  switch (filterName) {
    case "Trending":
      return (
        <svg
          className="w-5 h-5 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          aria-hidden="true"
          data-slot="icon"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M9.808 4.057a.75.75 0 0 1 .92-.527l3.116.849a.75.75 0 0 1 .528.915l-.823 3.121a.75.75 0 0 1-1.45-.382l.337-1.281a23.5 23.5 0 0 0-3.609 3.056.75.75 0 0 1-1.07.01L6 8.06l-3.72 3.72a.75.75 0 1 1-1.06-1.061l4.25-4.25a.75.75 0 0 1 1.06 0l1.756 1.755a25 25 0 0 1 3.508-2.85l-1.46-.398a.75.75 0 0 1-.526-.92Z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
};

function FanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabsRef = useRef<HTMLDivElement>(null);
  const {
    data: theories,
    error,
    mutate,
  } = useSWR("/api/theories?sort=new", fetcher, { refreshInterval: 3000 });
  const { isReady, username, hasUpvoted, toggleUpvote, hasSaved, toggleSave } =
    useSession();

  const filter = searchParams.get("filter") || "All";
  const setFilter = (newFilter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", newFilter);
    router.replace(`/fan?${params.toString()}`, { scroll: false });
  };

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDeepScrolled, setIsDeepScrolled] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("search-toggled", { detail: isSearchOpen }));
  }, [isSearchOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      setIsDeepScrolled(window.scrollY > 1500);
    };

    const handleUserInteractionScroll = () => {
      if (searchQuery.trim().length > 0) return; // Keep open if there's text

      setIsSearchOpen((prev) => {
        if (prev) return false;
        return prev;
      });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("wheel", handleUserInteractionScroll, { passive: true });
    window.addEventListener("touchmove", handleUserInteractionScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleUserInteractionScroll);
      window.removeEventListener("touchmove", handleUserInteractionScroll);
    };
  }, [searchQuery]);

  const filters = ["Trending", "New", "Hidden Detail"];

  let filteredTheories = theories ? [...theories] : [];

  if (filter === "Trending") {
    filteredTheories.sort(
      (a: any, b: any) => (b.clicks || 0) - (a.clicks || 0),
    );
    filteredTheories = filteredTheories.slice(0, 5);
  } else if (filter === "New") {
    filteredTheories.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else if (filter !== "All") {
    filteredTheories = filteredTheories.filter((t: any) => t.tag === filter);
  }

  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    filteredTheories = filteredTheories.filter(
      (t: any) =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q),
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <SessionModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        message="Enter your username to interact with theories!"
      />
      {/* Profile Button Top Right */}
      {username && (
        <div
          className={`fixed top-8 right-8 z-50 transition-all duration-300 ${isScrolled || isSearchOpen ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"}`}
        >
          <Link href="/my-theories" passHref>
            <button
              title="My Theories"
              className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-card/70 backdrop-blur-md text-foreground rounded-full border border-border/50 shadow-lg hover:scale-105 hover:border-[#f5c66d]/50 transition-all duration-300 overflow-hidden"
            >
              <Facehash name={username} size={56} enableBlink={true} />
            </button>
          </Link>
        </div>
      )}

      {/* Header */}
      <AnimatePresence>
        {!isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pt-20 pb-10 relative overflow-hidden"
          >
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-accent text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
                  The Fan Universe
                </span>
                <h1 className="font-serif text-5xl md:text-7xl text-gradient-gold uppercase tracking-wider">
                  Join the Conversation
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto pt-2">
                  Read theories, join discussions and share your own.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={tabsRef} />
      {/* Sticky Tabs */}
      <div
        className={`sticky top-0 z-50 pt-4 pb-0 mb-4 transition-all duration-300 ${isScrolled || isSearchOpen
          ? "bg-background/30 backdrop-blur-2xl border-b border-border/10 shadow-sm"
          : "bg-transparent border-transparent"
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto border-b border-border/30 w-full justify-between sm:justify-start [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {["All", ...filters].map((f) => {
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative flex-1 sm:flex-none px-4 sm:px-6 py-4 text-sm sm:text-base whitespace-nowrap transition-colors ${isActive
                    ? "text-[#f5c66d] font-bold"
                    : "text-muted-foreground font-medium hover:text-[#f5c66d]/80"
                    }`}
                >
                  <div className="flex items-center justify-center">
                    {getTabIcon(f)}
                    {f}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 mx-auto h-[4px] bg-[#f5c66d] rounded-t-full shadow-[0_-2px_10px_rgba(245,198,109,0.5)]"
                      style={{ width: "calc(100% - 2rem)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar attached under tabs */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="container mx-auto px-4 py-2">
                <div className="relative max-w-2xl mx-auto">
                  <input
                    type="text"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    autoCapitalize="off"
                    placeholder="Search theories, authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-card/90 border border-[#f5c66d]/30 rounded-full py-2 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#f5c66d] transition-colors shadow-lg"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f5c66d] pointer-events-none">
                    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m21 21-3.5-3.5m2.5-6a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0" />
                    </svg>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-1 bg-[#f5c66d]/10 rounded-full text-[#f5c66d] hover:bg-[#f5c66d]/20 transition-all"
                      aria-label="Clear search"
                    >
                      <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll to Top Pill */}
      <div
        className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${isDeepScrolled
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-8 pointer-events-none"
          }`}
      >
        <button
          onClick={() => {
            if (tabsRef.current) {
              const top = tabsRef.current.getBoundingClientRect().top + window.scrollY;
              window.scrollTo({ top, behavior: "smooth" });
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#f5c66d] to-[#e6b150] text-black px-6 py-2 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-[0_4px_20px_rgba(245,198,109,0.3)] hover:shadow-[0_4px_25px_rgba(245,198,109,0.5)] hover:scale-105 transition-all duration-300 backdrop-blur-md border border-[#f5c66d]/20"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          Top
        </button>
      </div>

      {/* Feed */}
      <div className="container mx-auto px-4 pt-2 pb-8 max-w-6xl min-h-[100vh]">
        {/* Theories Feed */}
        <div className="mt-4 space-y-8 min-h-[60vh]">
          {!theories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <TweetSkeleton key={i} />
              ))}
            </div>
          ) : filteredTheories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No theories found for this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTheories.map((theory: any, idx: number) => (
                <motion.div
                  key={theory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative"
                >
                  <Link
                    href={`/theory/${theory.id}`}
                    className="absolute inset-0 z-0"
                    aria-label="View theory"
                  ></Link>
                  <div className="relative z-10 pointer-events-none h-full">
                    <Tweet
                      tweetData={{
                        id_str: theory.id,
                        text: theory.content,
                        title: theory.title,
                        created_at: theory.createdAt,
                        favorite_count: theory.upvotes,
                        conversation_count: theory.comments,
                        lang: "en",
                        display_text_range: [0, theory.content.length],
                        tag: theory.tag,
                        entities: {
                          urls: [],
                          hashtags: [],
                          symbols: [],
                          user_mentions: [],
                        },
                        edit_control: {
                          edit_tweet_ids: [theory.id],
                          editable_until_msecs: "0",
                          is_edit_eligible: false,
                          edits_remaining: "0",
                        },
                        isEdited: false,
                        isStaleEdit: false,
                        user: {
                          id_str: theory.author,
                          name: theory.author,
                          profile_image_url_https: "",
                          screen_name: theory.author
                            .toLowerCase()
                            .replace(/\s+/g, ""),
                          verified: false,
                          is_blue_verified: false,
                          profile_image_shape: "Circle",
                        },
                      }}
                      initialUpvoted={hasUpvoted(theory.id)}
                      onUpvote={async (isUpvoted) => {
                        if (!username) {
                          setShowSessionModal(true);
                          return false; // Tells the Tweet not to apply the upvote
                        }
                        toggleUpvote(theory.id, isUpvoted);
                        await fetch(`/api/theories/${theory.id}/upvote`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ isUpvoted }),
                        });
                        mutate();
                        return true;
                      }}
                      isSaved={hasSaved(theory.id)}
                      onSave={(isSaved) => toggleSave(theory.id, isSaved)}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Floating CTA */}
        <AnimatePresence>
          {!isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-8 right-8 z-50 flex items-center justify-end gap-4"
            >
              {/* Search Button */}
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isSearchOpen) setSearchQuery("");
                }}
                className={`flex items-center justify-center bg-card border border-border/50 text-[#f5c66d] rounded-full shadow-lg hover:scale-105 transition-all duration-500 shrink-0 backdrop-blur-sm ${isScrolled ? "w-14 h-14" : "w-14 h-14"}`}
                aria-label="Search theories"
              >
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="m21 21-3.5-3.5m2.5-6a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0"
                  />
                </svg>
              </button>

              <Link href="/post" passHref>
                <button
                  className={`flex items-center justify-center bg-[#f5c66d] text-black rounded-full font-bold text-[11px] uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(245,198,109,0.3)] hover:scale-105 transition-all duration-500 overflow-hidden ${isScrolled ? "w-14 h-14 gap-0" : "px-8 py-4 gap-3 w-auto"
                    }`}
                >
                  <span className="text-lg leading-none mt-[-2px] shrink-0">
                    ✦
                  </span>
                  <span
                    className={`whitespace-nowrap transition-all duration-500 ${isScrolled
                      ? "opacity-0 max-w-0 scale-95"
                      : "opacity-100 max-w-[200px] scale-100"
                      }`}
                  >
                    Post Your Theory
                  </span>
                </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function FanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pb-24" />}>
      <FanPageContent />
    </Suspense>
  );
}
