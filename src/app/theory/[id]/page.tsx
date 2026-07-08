"use client";

import { motion, AnimatePresence } from "framer-motion";

import React, { useRef, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Send, Share, Check, MessageCircle, MessageSquare, X, Trash2, Pencil } from "lucide-react";
import { UpvoteIconButton } from "@/components/ui/upvote-icon-button";
import { Facehash } from "facehash";
import { useSession } from "@/hooks/useSession";
import { SessionModal } from "@/components/ui/SessionModal";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const HeartParticles = () => {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none overflow-visible flex items-center justify-center z-10">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.8],
            x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40],
            y: [5, -15 - Math.random() * 20]
          }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

const BubbleParticles = () => {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none overflow-visible flex items-center justify-center z-10">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-blue-400/60 bg-blue-400/20"
          initial={{ opacity: 0, scale: 0.2, x: 0, y: 5 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.8],
            x: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 30],
            y: [5, -15 - Math.random() * 20]
          }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
          style={{
            width: 4 + Math.random() * 6 + 'px',
            height: 4 + Math.random() * 6 + 'px'
          }}
        />
      ))}
    </div>
  );
};

const BurstParticles = () => {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none overflow-visible flex items-center justify-center z-10">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
            x: [0, (Math.random() - 0.5) * 40],
            y: [0, (Math.random() - 0.5) * 20],
            rotate: [0, Math.random() * 180]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5 text-[#f5c66d] drop-shadow-[0_0_5px_rgba(245,198,109,0.8)]">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default function TheoryPage() {
  const { mutate: globalMutate } = useSWRConfig();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: theory, mutate: mutateTheory } = useSWR(id ? `/api/theories?id=${id}` : null, fetcher);
  const { data: theoryComments = [], mutate: mutateComments } = useSWR(id ? `/api/comments?theoryId=${id}` : null, fetcher);

  const { username, isReady, hasUpvoted, toggleUpvote } = useSession();
  const [showSessionModal, setShowSessionModal] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const [showGlow, setShowGlow] = useState(false);
  const [isPillExpanded, setIsPillExpanded] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  const [isEditingTheory, setIsEditingTheory] = useState(false);
  const [showMarketingPill, setShowMarketingPill] = useState(true);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleEditTheory = () => {
    setEditTitle(theory.title);
    setEditContent(theory.content);
    setIsEditingTheory(true);
  };

  const handleSaveTheory = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    try {
      await fetch(`/api/theories/${id}?author=${encodeURIComponent(username || "")}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent })
      });
      setIsEditingTheory(false);
      mutateTheory();
      globalMutate("/api/theories?sort=new");
      globalMutate("/api/theories?sort=trending");
    } catch (err) {
      console.error(err);
    }
  };



  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGlow(true);
    }, 15000); // 15 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isPillExpanded) return;

    const timer = setTimeout(() => {
      setIsPillExpanded(false);
    }, 45000); // 45 seconds

    const handleScroll = () => {
      setIsPillExpanded(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setIsPillExpanded(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPillExpanded]);

  useEffect(() => {
    if (searchParams.get("action") === "comment") {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else if (searchParams.get("action") === "edit" && theory && username === theory.author && !isEditingTheory) {
      handleEditTheory();
    }
  }, [searchParams, theory, username, isEditingTheory]);

  useEffect(() => {
    if (id) {
      // Record a click/view for this theory
      fetch(`/api/theories/${id}/click`, { method: 'POST' }).catch(console.error);
    }
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: theory?.title || "Theory",
          text: theory?.content || "Check out this theory!",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!theory) {
    return (
      <div className="min-h-screen pb-40 container mx-auto px-4 max-w-3xl pt-28 space-y-8">
        <div className="space-y-6 animate-pulse">
          <div className="space-y-4">
            {/* Tag */}
            <div className="w-24 h-6 bg-border/40 rounded-sm" />
            {/* Title */}
            <div className="w-3/4 h-12 md:h-14 bg-border/40 rounded-md mt-4" />
            {/* Author */}
            <div className="flex items-center gap-2 mt-8">
              <div className="w-8 h-4 bg-border/40 rounded" />
              <div className="w-24 h-4 bg-border/40 rounded" />
            </div>
          </div>

          <div className="h-px w-full bg-border/30 my-8" />

          <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pb-2 border-b border-border/20 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-16 h-10 bg-border/40 rounded-full" />
                <div className="w-16 h-10 bg-border/40 rounded-full" />
              </div>
              <div className="w-10 h-10 bg-border/40 rounded-full" />
            </div>

            {/* Content body */}
            <div className="space-y-3 pt-4">
              <div className="w-full h-4 bg-border/40 rounded" />
              <div className="w-full h-4 bg-border/40 rounded" />
              <div className="w-11/12 h-4 bg-border/40 rounded" />
              <div className="w-full h-4 bg-border/40 rounded" />
              <div className="w-4/5 h-4 bg-border/40 rounded" />
              <div className="w-full h-4 bg-border/40 rounded" />
              <div className="w-3/4 h-4 bg-border/40 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePostComment = async () => {
    if (!username) {
      setShowSessionModal(true);
      return;
    }
    if (!commentText.trim()) return;

    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theoryId: id, author: username, text: commentText, parentId: replyingTo?.id })
    });

    if (replyingTo) {
      setExpandedThreads(prev => ({ ...prev, [replyingTo.id]: true }));
    }
    setReplyingTo(null);
    setCommentText("");
    mutateComments();
    mutateTheory();
  };

  const handleTheoryUpvote = async (isUpvoted: boolean) => {
    if (!username) {
      setShowSessionModal(true);
      return false;
    }
    toggleUpvote(id, isUpvoted);
    await fetch(`/api/theories/${id}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isUpvoted })
    });
    mutateTheory();
    globalMutate("/api/theories?sort=new");
    return true;
  };

  const handleCommentUpvote = async (commentId: string, isUpvoted: boolean) => {
    if (!username) {
      setShowSessionModal(true);
      return false;
    }
    toggleUpvote(commentId, isUpvoted);
    await fetch(`/api/comments/${commentId}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isUpvoted })
    });
    mutateComments();
    return true;
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!username) return;
    setCommentToDelete(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!username || !commentToDelete) return;

    await fetch(`/api/comments/${commentToDelete}?author=${encodeURIComponent(username)}`, {
      method: "DELETE"
    });

    mutateComments();
    mutateTheory();
    setCommentToDelete(null);
  };

  return (
    <div className="min-h-screen pb-40">
      <SessionModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        message="Enter your username to interact with this theory!"
      />
      <div className="container mx-auto px-4 max-w-3xl pt-28 space-y-8">

        {/* Theory Content */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs uppercase tracking-wider px-2 py-1 bg-accent/20 text-accent rounded-sm">
                {theory.tag}
              </span>
              {theory.isTrending && (
                <span className="relative text-xs uppercase tracking-wider pl-2 pr-6 py-1 bg-[#f5c66d]/20 text-[#f5c66d] rounded-sm font-bold shadow-[0_0_10px_rgba(245,198,109,0.2)] flex items-center">
                  TRENDING • Through clicks
                  <BurstParticles />
                </span>
              )}
              {theory.isTrendingThroughLikes && (
                <span className="relative text-xs uppercase tracking-wider pl-2 pr-6 py-1 bg-red-500/20 text-red-500 rounded-sm font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)] flex items-center">
                  TRENDING • THROUGH LIKES
                  <HeartParticles />
                </span>
              )}
              {theory.isTrendingThroughReplies && (
                <span className="relative text-xs uppercase tracking-wider pl-2 pr-6 py-1 bg-blue-500/20 text-blue-400 rounded-sm font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)] flex items-center backdrop-blur-sm">
                  TRENDING • THROUGH REPLIES
                  <BubbleParticles />
                </span>
              )}
            </div>

            {isEditingTheory ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-card/50 border border-border/50 rounded-lg px-4 py-2 text-3xl md:text-4xl font-serif focus:outline-none focus:border-primary/50 text-foreground"
                placeholder="Theory Title"
              />
            ) : (
              <h1 className="font-serif text-4xl md:text-5xl text-foreground leading-tight">
                {theory.title}
              </h1>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>By <strong className="text-primary">{theory.author}</strong></span>
              {username === theory.author && !isEditingTheory && (
                <button onClick={handleEditTheory} className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                  <Pencil className="size-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {isEditingTheory ? (
            <div className="space-y-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[300px] bg-card/50 border border-border/50 rounded-lg focus:border-primary/50 text-base"
                placeholder="Theory Content"
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={() => setIsEditingTheory(false)}>Cancel</Button>
                <Button onClick={handleSaveTheory} className="bg-primary text-black">Save Changes</Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              {/* Upvote and Share - Below TL;DR */}
              <div className="flex items-center justify-between mt-6 pb-2 border-b border-border/20 mb-6">
                <div className="flex items-center gap-2">
                  <UpvoteIconButton
                    count={theory.upvotes}
                    initialUpvoted={hasUpvoted(id)}
                    onUpvote={handleTheoryUpvote}
                  />
                  <button
                    onClick={() => document.getElementById('comment-input')?.focus()}
                    className="pointer-events-auto flex cursor-pointer items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent h-10 px-3 rounded-full hover:bg-[#f5c66d]/10 group"
                  >
                    <MessageCircle className="size-5 opacity-60 group-hover:text-[#f5c66d] transition-colors" />
                    <span className="text-sm font-bold group-hover:text-[#f5c66d] transition-colors">
                      {theory.comments}
                    </span>
                  </button>
                </div>
                <button
                  onClick={handleShare}
                  className="flex cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-accent h-10 w-10 rounded-full hover:bg-accent/10 pointer-events-auto"
                >
                  {isCopied ? <Check className="size-5 text-emerald-500" /> : <Share className="size-5" />}
                </button>
              </div>

              <p className="text-lg leading-relaxed text-foreground/80 mt-6 whitespace-pre-wrap">
                {theory.content}
              </p>
            </div>
          )}
        </div>

        <div className="h-px bg-border/50 mt-6 mb-6" />

        {/* Marketing Pill */}
        {showMarketingPill && (
          <motion.div
            layout
            ref={pillRef}
            onClick={() => !isPillExpanded && setIsPillExpanded(true)}
            className={`group mx-auto flex items-center w-full max-w-md gap-4 p-2 rounded-full bg-white/5 backdrop-blur-md border transition-colors duration-700 h-[60px] relative ${!isPillExpanded ? 'cursor-pointer' : ''} ${showGlow && !isPillExpanded ? 'border-[#f5c66d]/50 shadow-[0_0_20px_rgba(245,198,109,0.25)]' : 'border-white/10 shadow-sm'}`}
          >
            <AnimatePresence>
              {!isPillExpanded && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)", position: "absolute", left: "0.5rem" }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-4 flex-1 h-full pointer-events-none"
                >
                  {/* Poster thumbnail */}
                  <div className="w-8 h-10 rounded shrink-0 opacity-90 border border-white/10 overflow-hidden shadow-sm flex items-center justify-center bg-black/50 ml-2">
                    <img
                      src="https://m.media-amazon.com/images/M/MV5BMGM4MTlmODYtMWVkMi00MWM0LThlYTQtZDc5OTg1MDI5MGJlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
                      alt="Rao Bahadur Poster"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Text */}
                  <span className={`text-[12px] md:text-[13px] font-medium tracking-wide flex-1 text-center leading-snug transition-colors duration-700 ${showGlow ? 'text-foreground' : 'text-foreground/70'}`}>
                    Discover this MAHAsterpiece<br />in your nearby cinemas
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout className={`flex items-center justify-end h-full transition-all duration-500 ease-in-out ${isPillExpanded ? 'w-full gap-3' : 'shrink-0 pr-2 -space-x-3'}`}>
              {!isPillExpanded ? (
                <>
                  <motion.div layoutId="bms-morph" className="relative w-8 h-8 rounded-full border-[2px] border-[#0a0a0a] z-10 shadow-sm overflow-hidden bg-white shrink-0">
                    <img src="https://play-lh.googleusercontent.com/TB_8RMvDjxGmx06LBK-8opRFJ0msb6hSZalEtOMBmxgJ4jYE_i0BmdRuMWChCE76tLnxoytZ75Cew_r0_JDd" alt="BookMyShow" className="absolute inset-0 w-full h-full object-cover" />
                  </motion.div>
                  <motion.div layoutId="district-morph" className="relative w-8 h-8 rounded-full border-[2px] border-[#0a0a0a] z-0 shadow-sm overflow-hidden bg-white shrink-0">
                    <img src="https://play-lh.googleusercontent.com/t0LH2EDF97k1-d2i8kSh_vUlZlnntAGWRYIX8BVSRSAyMGUlNAraa-q4kez1YMKQmGc_9BeEFGmD3wTud5NDOg=w240-h480-rw" alt="District App" className="absolute inset-0 w-full h-full object-cover" />
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.a layoutId="bms-morph" href="https://in.bookmyshow.com/movies/rao-bahadur/ET00458566" target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full overflow-hidden bg-red-600/10 hover:bg-red-600/20 border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.3)] h-full relative group block">
                    <img src="https://cdn.aptoide.com/imgs/c/7/9/c7948850a706fca8904015c9809f7ca4_fgraphic.jpg" alt="BookMyShow" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </motion.a>
                  <motion.a layoutId="district-morph" href="https://www.district.in/movies/rao-bahadur-movie-tickets-MV204022" target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full overflow-hidden bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.3)] h-full relative group block">
                    <img src="https://media.licdn.com/dms/image/v2/D5612AQENNmUosxgwGA/article-cover_image-shrink_720_1280/B56ZfY173vHoAI-/0/1751689708143?e=2147483647&v=beta&t=sDcVqA3slVmKQ9730YaH69Kde3XpGyEWVK1XoOTdfw4" alt="District App" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </motion.a>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Comments Section */}
        <div className="space-y-8">
          <h2 className="font-serif text-2xl text-foreground">
            Discussion ({theory.comments})
          </h2>

          {/* Comment List */}
          <div className="space-y-4">
            {theoryComments.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-8">Be the first to share your thoughts.</p>
            ) : (
              theoryComments.filter((c: any) => !c.parentId).map((comment: any) => {
                const replies = theoryComments.filter((c: any) => c.parentId === comment.id);
                const isExpanded = expandedThreads[comment.id];
                return (
                  <div key={comment.id} className="space-y-3">
                    <div className="p-4 rounded-lg bg-card/20 border border-border/30">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden border border-border/30 shadow-inner bg-background">
                          <Facehash name={comment.author} size={32} />
                        </div>
                        <span className="font-bold text-primary text-sm">{comment.author}</span>
                      </div>
                      <p className="text-sm text-foreground/90 pl-11 mb-2">{comment.text}</p>
                      <div className="flex items-center gap-4 pl-11 mt-1">
                        <UpvoteIconButton
                          count={comment.upvotes}
                          onUpvote={(isUpvoted) => handleCommentUpvote(comment.id, isUpvoted)}
                        />
                        <button
                          onClick={() => {
                            setReplyingTo({ id: comment.id, name: comment.author });
                            document.getElementById('comment-input')?.focus();
                          }}
                          className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary group"
                        >
                          <MessageSquare className="w-4 h-4 group-hover:text-[#f5c66d] transition-colors opacity-70" />
                          <span className="text-xs font-medium group-hover:text-[#f5c66d] transition-colors">Reply</span>
                        </button>
                        {username === comment.author && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-red-500 group ml-2"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                          </button>
                        )}
                      </div>
                    </div>

                    {replies.length > 0 && (
                      <div className="pl-12">
                        <button
                          onClick={() => setExpandedThreads(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-3"
                        >
                          <div className="w-8 h-px bg-border/50" />
                          {isExpanded ? "Hide replies" : `View ${replies.length} repl${replies.length === 1 ? 'y' : 'ies'}`}
                        </button>
                      </div>
                    )}

                    {isExpanded && replies.length > 0 && (
                      <div className="pl-8 md:pl-12 space-y-3 relative mt-2">
                        <div className="absolute left-4 top-0 bottom-4 w-px bg-border/30" />

                        {replies.map((reply: any) => (
                          <div key={reply.id} className="p-3 rounded-lg bg-card/10 border border-border/20 relative z-10 ml-4">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="shrink-0 w-6 h-6 rounded-full overflow-hidden border border-border/30 shadow-inner bg-background">
                                <Facehash name={reply.author} size={24} />
                              </div>
                              <span className="font-bold text-primary text-xs">{reply.author}</span>
                            </div>
                            <p className="text-[13px] text-foreground/80 pl-8 mb-1.5">{reply.text}</p>
                            <div className="flex items-center gap-3 pl-8">
                              <UpvoteIconButton
                                count={reply.upvotes}
                                onUpvote={(isUpvoted) => handleCommentUpvote(reply.id, isUpvoted)}
                              />
                              <button
                                onClick={() => {
                                  setReplyingTo({ id: comment.id, name: reply.author });
                                  setCommentText(`@${reply.author} `);
                                  document.getElementById('comment-input')?.focus();
                                }}
                                className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary group"
                              >
                                <MessageSquare className="w-3.5 h-3.5 group-hover:text-[#f5c66d] transition-colors opacity-70" />
                                <span className="text-[11px] font-medium group-hover:text-[#f5c66d] transition-colors">Reply</span>
                              </button>
                              {username === reply.author && (
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-red-500 group ml-1"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Floating CTA Pill */}
      <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md relative">

          {replyingTo && (
            <div className="absolute -top-10 left-4 right-4 bg-card/90 border border-border/50 rounded-t-xl px-4 py-2 flex items-center justify-between backdrop-blur-xl shadow-lg border-b-0 pb-4">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                Replying to <strong className="text-primary">@{replyingTo.name}</strong>
              </span>
              <button
                onClick={() => { setReplyingTo(null); setCommentText(""); }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="size-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-full p-2 w-full transition-colors focus-within:bg-card relative z-10">
            <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden border border-border/30 shadow-inner bg-background flex items-center justify-center">
              {username ? (
                <Facehash name={username} size={48} enableBlink={true} />
              ) : (
                <div className="text-muted-foreground opacity-50 text-sm">?</div>
              )}
            </div>
            <input
              id="comment-input"
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && commentText.trim()) {
                  handlePostComment();
                }
              }}
              onClick={() => {
                if (!username) {
                  setShowSessionModal(true);
                }
              }}
              placeholder="Add a hot take..."
              className="flex-1 bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground text-sm pl-2"
            />
            <button
              onClick={handlePostComment}
              disabled={!commentText.trim()}
              className="shrink-0 bg-primary/10 text-primary w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Comment Confirmation Modal */}
      <AnimatePresence>
        {commentToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-card border border-border/50 rounded-2xl p-6 shadow-2xl"
            >
              <h2 className="text-xl font-serif text-foreground mb-3">Delete Comment?</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setCommentToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/10 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteComment}
                  className="px-4 py-2 text-sm font-medium bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
