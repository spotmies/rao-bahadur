"use client";

import { useEffect } from "react";
import { create } from "zustand";

interface SessionState {
  username: string | null;
  isReady: boolean;
  upvotedIds: string[];
  savedIds: string[];
  login: (name: string) => void;
  logout: () => void;
  toggleUpvote: (id: string, isUpvoted: boolean) => void;
  toggleSave: (id: string, isSaved: boolean) => void;
  hasUpvoted: (id: string) => boolean;
  hasSaved: (id: string) => boolean;
  setReady: (username: string | null, upvotedIds: string[], savedIds: string[]) => void;
}

const useSessionStore = create<SessionState>((set, get) => ({
  username: null,
  isReady: false,
  upvotedIds: [],
  savedIds: [],
  setReady: (username, upvotedIds, savedIds) => {
    set({ username, upvotedIds, savedIds, isReady: true });
  },
  login: (name) => {
    localStorage.setItem("raobahadur_username", name);
    set({ username: name });
  },
  logout: () => {
    localStorage.removeItem("raobahadur_username");
    set({ username: null });
  },
  toggleUpvote: (id, isUpvoted) => {
    const { upvotedIds } = get();
    const next = isUpvoted
      ? [...new Set([...upvotedIds, id])]
      : upvotedIds.filter(i => i !== id);
    localStorage.setItem("raobahadur_upvotes", JSON.stringify(next));
    set({ upvotedIds: next });
  },
  toggleSave: (id, isSaved) => {
    const { savedIds } = get();
    const next = isSaved
      ? [...new Set([...savedIds, id])]
      : savedIds.filter(i => i !== id);
    localStorage.setItem("raobahadur_saved", JSON.stringify(next));
    set({ savedIds: next });
  },
  hasUpvoted: (id) => get().upvotedIds.includes(id),
  hasSaved: (id) => get().savedIds.includes(id),
}));

export function useSession() {
  const store = useSessionStore();

  useEffect(() => {
    if (store.isReady) return;

    let storedUsername = null;
    let storedUpvotes: string[] = [];
    let storedSaved: string[] = [];

    const stored = localStorage.getItem("raobahadur_username");
    if (stored) storedUsername = stored;

    const storedUpvotesStr = localStorage.getItem("raobahadur_upvotes");
    if (storedUpvotesStr) {
      try {
        storedUpvotes = JSON.parse(storedUpvotesStr);
      } catch (e) { }
    }

    const storedSavedStr = localStorage.getItem("raobahadur_saved");
    if (storedSavedStr) {
      try {
        storedSaved = JSON.parse(storedSavedStr);
      } catch (e) { }
    }

    store.setReady(storedUsername, storedUpvotes, storedSaved);
  }, [store.isReady, store.setReady]);

  return store;
}
