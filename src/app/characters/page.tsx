"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { SessionModal } from "@/components/ui/SessionModal";
import { useCharactersStore } from "@/store/useCharactersStore";
import { Button } from "@/components/ui/Button";
import { Heart } from "lucide-react";

const formatLikes = (likes: number) => {
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(likes);
};

export default function CharactersPage() {
  const { username, isReady, toggleUpvote, hasUpvoted } = useSession();
  const { characters, likeCharacter, fetchCharacters } = useCharactersStore();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [pendingCharacter, setPendingCharacter] = useState<string | null>(null);

  const hasLikedAnyCharacter = characters.some(char => hasUpvoted(`char-${char.id}`));

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleCharacterClick = (id: string) => {
    if (!username) {
      setPendingCharacter(id);
      setShowSessionModal(true);
      return;
    }

    toggleLike(id);
  };

  const toggleLike = (id: string) => {
    const isCurrentlyLiked = hasUpvoted(`char-${id}`);
    toggleUpvote(`char-${id}`, !isCurrentlyLiked);
    likeCharacter(id, !isCurrentlyLiked);
  };

  const handleSessionSuccess = (name: string) => {
    if (pendingCharacter) {
      // Small delay to let the modal exit animation play
      setTimeout(() => {
        toggleLike(pendingCharacter);
        setPendingCharacter(null);
      }, 100);
    }
  };

  if (!isReady) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center pt-28 md:pt-32 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 space-y-4"
      >
        <h1 className="font-serif text-3xl md:text-5xl text-gradient-gold uppercase tracking-wider">
          Who is your favourite character(s) from the movie ?
        </h1>
        <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto">
          Tap on your favourites to like them.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-6 w-full max-w-5xl mb-32">
        {characters.map((char, index) => {
          const isLiked = hasUpvoted(`char-${char.id}`);

          return (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] relative cursor-pointer group rounded-xl overflow-hidden border-2 transition-all duration-300 ${isLiked ? 'border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'border-border/50 hover:border-primary/50'
                }`}
              onClick={() => handleCharacterClick(char.id)}
            >
              <div className="aspect-[3/4] relative">
                <Image
                  src={char.image}
                  alt={char.name}
                  fill
                  priority={true}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none" />

                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <div className="relative">
                    <div className={`flex items-center gap-1.5 backdrop-blur-md px-2.5 py-1 rounded-full border shadow-sm transition-all duration-300 ${isLiked ? 'bg-red-500/20 border-red-500/50 scale-105' : 'bg-background/70 border-border/50 scale-100'
                      }`}>
                      <Heart className={`w-4 h-4 transition-colors duration-300 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                      <span className={`text-xs font-bold transition-colors duration-300 ${isLiked ? 'text-red-500' : 'text-foreground'}`}>
                        {formatLikes(char.likes)}
                      </span>
                    </div>

                    <AnimatePresence>
                      {isLiked && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none flex items-center justify-center"
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1.5 h-1.5 bg-red-500 rounded-full"
                              initial={{ scale: 0, x: 0, y: 0 }}
                              animate={{
                                scale: [0, 1.5, 0],
                                x: (Math.cos((i * 45) * Math.PI / 180) * 35),
                                y: (Math.sin((i * 45) * Math.PI / 180) * 35)
                              }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 pointer-events-none">
                  <span className="font-serif text-xl md:text-2xl text-foreground font-semibold drop-shadow-md">
                    {char.name}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {hasLikedAnyCharacter && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-8 left-1/2 z-[100]"
          >
            <Link href="/fan">
              <Button size="lg" className="px-8 py-6 text-lg rounded-full bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50 transition-all shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_25px_rgba(var(--primary),0.3)] backdrop-blur-md">
                Go to fan theories
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <SessionModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        onSuccess={handleSessionSuccess}
        message="Enter your identity to join the discussion, like, and post theories."
      />
    </div>
  );
}
