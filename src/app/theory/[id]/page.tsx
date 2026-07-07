"use client";

import React, { useRef, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Send, Share, Check, MessageCircle, MessageSquare, X } from "lucide-react";
import { UpvoteIconButton } from "@/components/ui/upvote-icon-button";
import { Facehash } from "facehash";
import { useSession } from "@/hooks/useSession";
import { SessionModal } from "@/components/ui/SessionModal";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TheoryPage() {
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

  useEffect(() => {
    if (searchParams.get("action") === "comment") {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [searchParams]);

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
                <span className="text-xs uppercase tracking-wider px-2 py-1 bg-[#f5c66d]/20 text-[#f5c66d] rounded-sm font-bold shadow-[0_0_10px_rgba(245,198,109,0.2)]">
                  TRENDING • Through clicks
                </span>
              )}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground leading-tight">
              {theory.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>By <strong className="text-primary">{theory.author}</strong></span>
            </div>
          </div>

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
        </div>

        <div className="h-px bg-border/50 my-12" />

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
    </div>
  );
}
