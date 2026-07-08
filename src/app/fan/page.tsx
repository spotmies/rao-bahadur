"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
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
const getLevenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const checkEasterEggMatch = (query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;

  const easterEggQueries = [
    "the insect", "insect",
    "anumanam penu bootham", "anumanam penu bhutam", "anumanam",
    "అనుమానం పెను భూతం", "అనుమానం", "పురుగు", "చిన్న పురుగు"
  ];
  if (easterEggQueries.includes(normalized)) return true;

  for (const target of easterEggQueries) {
    // allow 1 typo for small words, up to 3 typos for longer phrases
    const maxDistance = target.length <= 6 ? 1 : target.length <= 10 ? 2 : 3;
    if (getLevenshteinDistance(normalized, target) <= maxDistance) {
      return true;
    }
  }
  return false;
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
  const [hideEasterEgg, setHideEasterEgg] = useState(false);
  const [isTelugu, setIsTelugu] = useState(false);

  // Marketing Popup State
  const [showMarketingPopup, setShowMarketingPopup] = useState(false);
  const marketingShownRef = useRef(false);
  const bottomPopupShownRef = useRef(false);

  useEffect(() => {
    const checkTimer = () => {
      const nextShowStr = sessionStorage.getItem("marketing_popup_next_show");
      if (nextShowStr) {
        const nextShow = parseInt(nextShowStr, 10);
        if (Date.now() >= nextShow) {
          setShowMarketingPopup(true);
          sessionStorage.removeItem("marketing_popup_next_show");
        }
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDismissPopup = () => {
    setShowMarketingPopup(false);
    sessionStorage.setItem("marketing_popup_dismissed", "true");
    // Random delay between 5 to 10 minutes (300,000 to 600,000 ms)
    const randomDelay = Math.floor(Math.random() * (600000 - 300000 + 1)) + 300000;
    sessionStorage.setItem("marketing_popup_next_show", (Date.now() + randomDelay).toString());
  };

  useEffect(() => {
    setHideEasterEgg(false);
    if (checkEasterEggMatch(searchQuery)) {
      const fireConfetti = () => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 70,
          origin: { x: 0 },
          colors: ['#f5c66d', '#e6b150', '#ffffff']
        });
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 70,
          origin: { x: 1 },
          colors: ['#f5c66d', '#e6b150', '#ffffff']
        });
      };

      fireConfetti();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [searchQuery]);

  // Restore scroll position after theories load
  useEffect(() => {
    if (theories) {
      const savedScroll = sessionStorage.getItem("fanScroll");
      if (savedScroll) {
        // Wait a tick for the DOM and Framer Motion to render the list
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "instant" });
          sessionStorage.removeItem("fanScroll");
        }, 100);
      }
    }
  }, [theories]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("search-toggled", { detail: isSearchOpen }));
  }, [isSearchOpen]);

  const scrollThresholdRef = useRef(0);

  useEffect(() => {
    // Generate threshold between 2000px (approx 5 theories) and 4000px (approx 10 theories)
    if (scrollThresholdRef.current === 0) {
      scrollThresholdRef.current = 2000 + Math.random() * 2000;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100);
      setIsDeepScrolled(scrollY > 1500);

      // Normal depth trigger (happens once per session unless dismissed then timer takes over)
      if (scrollY > scrollThresholdRef.current && !marketingShownRef.current && !sessionStorage.getItem("marketing_popup_dismissed")) {
        marketingShownRef.current = true;
        setShowMarketingPopup(true);
      }

      // Bottom of page trigger (happens irrespective of timer/dismissal)
      const isAtBottom = window.innerHeight + scrollY >= document.documentElement.scrollHeight - 50;
      if (isAtBottom && !bottomPopupShownRef.current) {
        bottomPopupShownRef.current = true;
        setShowMarketingPopup(true);
      } else if (!isAtBottom) {
        bottomPopupShownRef.current = false;
      }
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
    const maxLikes = filteredTheories.reduce((max: number, t: any) => Math.max(max, t.upvotes || 0), 0);

    let trendingList = [...filteredTheories]
      .sort((a: any, b: any) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 5)
      .map((t: any) => ({ ...t }));

    trendingList.sort((a: any, b: any) => (b.upvotes || 0) - (a.upvotes || 0));

    if (maxLikes > 0) {
      const highestLikedTheories = filteredTheories.filter((t: any) => (t.upvotes || 0) === maxLikes);

      highestLikedTheories.forEach((ht: any) => {
        const existingIndex = trendingList.findIndex((t: any) => t.id === ht.id);
        if (existingIndex !== -1) {
          trendingList[existingIndex].isTrendingThroughLikes = true;
        } else {
          trendingList.unshift({ ...ht, isTrendingThroughLikes: true });
        }
      });
    }

    const highestCommentTheories = filteredTheories.filter((t: any) => t.isTrendingThroughReplies);
    highestCommentTheories.forEach((ht: any) => {
      const existingIndex = trendingList.findIndex((t: any) => t.id === ht.id);
      if (existingIndex !== -1) {
        trendingList[existingIndex].isTrendingThroughReplies = true;
      } else {
        trendingList.unshift({ ...ht, isTrendingThroughReplies: true });
      }
    });

    filteredTheories = trendingList;
  } else if (filter === "New") {
    filteredTheories.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else if (filter !== "All") {
    filteredTheories = filteredTheories.filter((t: any) => t.tag === filter);
  }

  if (searchQuery.trim() !== "") {
    const queryWords = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);

    const isFuzzyMatch = (text: string, queryWords: string[]) => {
      if (!text) return false;
      const lowerText = text.toLowerCase();
      // If it includes the whole query directly, return true
      if (lowerText.includes(searchQuery.toLowerCase().trim())) return true;

      const textWords = lowerText.split(/[\s,.\-?!()]+/);

      return queryWords.every(query => {
        if (lowerText.includes(query)) return true;
        const maxDistance = query.length <= 4 ? 1 : 2;
        return textWords.some(word => getLevenshteinDistance(query, word) <= maxDistance);
      });
    };

    filteredTheories = filteredTheories.filter(
      (t: any) =>
        isFuzzyMatch(t.title, queryWords) ||
        isFuzzyMatch(t.content, queryWords) ||
        isFuzzyMatch(t.author, queryWords)
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
          <Link href="/my-theories" passHref onClick={() => sessionStorage.setItem("fanScroll", window.scrollY.toString())}>
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
              }}
              className="overflow-hidden"
            >
              <div className="container mx-auto px-4 py-2 pt-3 pb-4">
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
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${isDeepScrolled
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
                  layout
                  key={theory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group relative"
                >
                  <Link
                    href={`/theory/${theory.id}`}
                    onClick={() => sessionStorage.setItem("fanScroll", window.scrollY.toString())}
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

              <Link href="/post" passHref onClick={() => sessionStorage.setItem("fanScroll", window.scrollY.toString())}>
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

      {/* Easter Egg Overlay */}
      <AnimatePresence>
        {checkEasterEggMatch(searchQuery) && !hideEasterEgg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4"
            onClick={() => setHideEasterEgg(true)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full max-h-[90vh] bg-card/50 border border-[#f5c66d]/20 rounded-3xl text-center shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#f5c66d]/10 to-transparent opacity-50 pointer-events-none" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTelugu(!isTelugu);
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-[#f5c66d]/10 hover:bg-[#f5c66d]/20 rounded-full transition-colors text-[#f5c66d]"
                title="Translate"
                aria-label="Translate"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 8 6 6" />
                  <path d="m4 14 6-6 2-3" />
                  <path d="M2 5h12" />
                  <path d="M7 2h1" />
                  <path d="m22 22-5-10-5 10" />
                  <path d="M14 18h6" />
                </svg>
              </button>

              <div className="relative z-10 overflow-y-auto p-6 md:p-8 flex flex-col items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                  className="text-center px-4 text-sm md:text-base font-bold font-serif text-[#f5c66d] drop-shadow-md mb-2 md:mb-4 leading-tight uppercase tracking-wider mt-4 md:mt-0"
                >
                  You have discovered <br className="hidden md:block" />
                  A hidden easter egg
                </motion.p>

                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative w-24 h-24 md:w-32 md:h-32 mx-auto my-6 md:my-10 shrink-0"
                >
                  <Image
                    src="https://res.cloudinary.com/uohqyl93/image/upload/v1783453448/raobahadur/insect.png"
                    alt="The Insect"
                    fill
                    className="object-contain drop-shadow-[0_0_15px_rgba(245,198,109,0.4)]"
                  />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center text-[#f5c66d] font-bold tracking-wider uppercase text-lg mb-4"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>Insect of Doubt</span>
                    <span className="text-sm opacity-80 normal-case tracking-normal">
                      {isTelugu ? "(అనుమానం పెను భూతం)" : "(Anumanam Penu Bhutam)"}
                    </span>
                  </div>
                </motion.h3>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground/90 text-sm text-justify leading-relaxed mb-8 flex flex-col gap-3"
                >
                  {isTelugu ? (
                    <>
                      <p>
                        ఈ చిన్న పురుగు అనుమానానికి శక్తివంతమైన ప్రతీక. కనిపించకుండా చేరే పురుగులా, ఒక చిన్న సందేహం కథానాయకుడి మనసులో నిశ్శబ్దంగా ప్రవేశించి అతని వాస్తవాన్ని వక్రీకరిస్తుంది. అది క్రమంగా పెరిగి అతని ఆలోచనలన్నింటినీ ఆక్రమిస్తుంది.
                      </p>
                      <p>
                        దర్శకుడు <a href="https://x.com/mahaisnotanoun" target="_blank" rel="noopener noreferrer" className="text-[#f5c66d] hover:underline" onClick={(e) => e.stopPropagation()}>వెంకటేష్ మహా</a>{" "}ఈ ప్రతీక ద్వారా, ఒక చిన్న సందేహం మనిషి ఆలోచనలను ఎలా మార్చేసి, చివరికి అతనికి అతిపెద్ద శత్రువుగా మారుతుందో అద్భుతంగా ఆవిష్కరించారు.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        The insect is a powerful metaphor for doubt. Like a tiny bug slipping in unnoticed, a single seed of suspicion enters the protagonist&apos;s mind and grows to distort his reality. What begins as an invisible presence slowly consumes him, making him question everything.
                      </p>
                      <p>
                        Through this striking symbol, director <a href="https://x.com/mahaisnotanoun" target="_blank" rel="noopener noreferrer" className="text-[#f5c66d] hover:underline" onClick={(e) => e.stopPropagation()}>Venkatesh Maha</a>{" "}illustrates how the smallest suspicion can evolve into an overwhelming force, ultimately becoming one&apos;s greatest enemy.
                      </p>
                    </>
                  )}
                </motion.div>

                <motion.h4
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-[#f5c66d] font-serif text-lg md:text-xl font-bold text-center mb-6 shrink-0"
                >
                  A Mahasterpiece.
                </motion.h4>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => setHideEasterEgg(true)}
                  className="px-8 py-3 bg-[#f5c66d]/10 text-[#f5c66d] border border-[#f5c66d]/30 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#f5c66d]/20 transition-colors shrink-0"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marketing Popup Overlay */}
      <AnimatePresence>
        {showMarketingPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4"
            onClick={handleDismissPopup}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full bg-card/90 border border-[#f5c66d]/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismissPopup();
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors text-white backdrop-blur-md"
                aria-label="Close popup"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>

              <div className="relative w-full aspect-[2/3] max-h-[40vh]">
                <Image
                  src="https://m.media-amazon.com/images/M/MV5BMGM4MTlmODYtMWVkMi00MWM0LThlYTQtZDc5OTg1MDI5MGJlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
                  alt="Rao Bahadur Poster"
                  fill
                  unoptimized={true}
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent pointer-events-none" />
              </div>

              <div className="p-6 md:p-8 flex flex-col items-center text-center relative z-10 -mt-12 bg-gradient-to-t from-card via-card to-transparent">
                <h3 className="font-serif text-2xl md:text-3xl text-gradient-gold uppercase tracking-wider mb-3">
                  Are you excited?
                </h3>
                <p className="text-muted-foreground text-sm md:text-base mb-8">
                  Wanna rewatch the MAHAsterpiece?<br />
                  Find it in your nearby theatres.
                </p>

                <div className="flex flex-row justify-center gap-4 w-full mt-2">
                  <a href="https://in.bookmyshow.com/movies/rao-bahadur/ET00458566" target="_blank" rel="noopener noreferrer" className="flex-1" onClick={handleDismissPopup}>
                    <button type="button" className="w-full p-0 overflow-hidden rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.3)] h-12 md:h-14 group transition-colors">
                      <img src="https://cdn.aptoide.com/imgs/c/7/9/c7948850a706fca8904015c9809f7ca4_fgraphic.jpg" alt="BookMyShow" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </button>
                  </a>
                  <a href="https://www.district.in/movies/rao-bahadur-movie-tickets-MV204022" target="_blank" rel="noopener noreferrer" className="flex-1" onClick={handleDismissPopup}>
                    <button type="button" className="w-full p-0 overflow-hidden rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.3)] h-12 md:h-14 group transition-colors">
                      <img src="https://media.licdn.com/dms/image/v2/D5612AQENNmUosxgwGA/article-cover_image-shrink_720_1280/B56ZfY173vHoAI-/0/1751689708143?e=2147483647&v=beta&t=sDcVqA3slVmKQ9730YaH69Kde3XpGyEWVK1XoOTdfw4" alt="District" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </button>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
