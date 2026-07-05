"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Heart, Star, VolumeX, Volume2, Play, Pause } from "lucide-react";
import { Celeb, Review } from "@/data/mock";

function LoveCounter() {
  const [count, setCount] = useState(12438201);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center md:items-start justify-center space-y-1 drop-shadow-lg">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1.1, 1.25, 1] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        >
          <span className="text-3xl md:text-5xl drop-shadow-[0_0_15px_rgba(255,50,50,0.8)]">❤️</span>
        </motion.div>
        <div className="font-display text-3xl md:text-6xl tabular-nums text-gold tracking-wide">
          {count.toLocaleString()}
        </div>
      </div>
      <div className="text-[10px] md:text-sm text-foreground/80 uppercase tracking-widest md:pl-11 font-medium text-center md:text-left">
        Hearts beating for Rao Bahadur
      </div>
    </div>
  );
}

const celebTweetImages = [
  // Celebrity Tweets
  "/Event/celebrity_tweets/Tweets 11.jpg",
  "/Event/celebrity_tweets/Tweets 23.jpg",
  "/Event/celebrity_tweets/Tweets 27.jpg",
  "/Event/celebrity_tweets/Tweets 28.jpg",

  // Fan Tweets
  "/Event/Tweets/Tweets 2.jpg",
  "/Event/Tweets/Tweets 9.jpg",
  "/Event/Tweets/Tweets 10.jpg",
  "/Event/Tweets/Tweets 19.jpg",
  "/Event/Tweets/Tweets 24.jpg",
  "/Event/Tweets/Tweets 26.jpg",
  "/Event/Tweets/Tweets 30.jpg",
  "/Event/Tweets/Tweets 31.jpg",
  "/Event/Tweets/Tweets 32.jpg",
  "/Event/Tweets/Tweets 33.jpg",
  "/Event/Tweets/Tweets 34.jpg",
];

function TweetMarquee() {
  return (
    <div className="w-full overflow-hidden whitespace-nowrap py-20 border-y border-border/30 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center mb-12 whitespace-normal px-4">
        <h3 className="text-accent tracking-[0.3em] text-xs md:text-sm uppercase mb-4 font-semibold text-center">Fan Buzz</h3>
        <h2 className="font-serif text-3xl md:text-5xl text-foreground text-center">The Internet Cannot Sit Down</h2>
      </div>

      <motion.div
        className="inline-block"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 50 }}
      >
        <div className="flex space-x-6 px-4 items-center">
          {[...celebTweetImages, ...celebTweetImages, ...celebTweetImages].map((imgSrc, i) => (
            <div key={`${i}`} className="relative w-[300px] sm:w-[380px] h-auto flex-shrink-0 rounded-xl overflow-hidden border border-primary/20 shadow-lg bg-card/20 backdrop-blur-sm group">
              <Image
                src={imgSrc}
                alt="Celebrity Tweet"
                width={380}
                height={200}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const CELEBRITY_VIDEOS = [
  { src: "/Event/Videos/Critics.mp4", title: "Critics" },
  { src: "/Event/Videos/Hollywood Reporter.mp4", title: "Hollywood Reporter" },
  { src: "/Event/Videos/RB public Review Plain.mp4", title: "Public Review" },
  { src: "/Event/Videos/Rahul Ravindran.mp4", title: "Rahul Ravindran" }
];

function CelebrityReactions() {
  const [activeVideo, setActiveVideo] = useState(0);

  return (
    <div className="space-y-12 pt-10">
      <div className="flex flex-col items-center mb-12">
        <h3 className="text-accent tracking-[0.3em] text-xs md:text-sm uppercase mb-4 font-semibold">Celebrity Reactions</h3>
        <h2 className="font-serif text-3xl md:text-5xl text-foreground text-center uppercase tracking-wider">They Came. They Saw. They Bowed.</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {CELEBRITY_VIDEOS.map((video, idx) => (
          <VideoCard 
            key={idx} 
            src={video.src} 
            title={video.title}
            isActive={activeVideo === idx}
            onPlayClick={() => setActiveVideo(idx)}
            onEnded={() => setActiveVideo((idx + 1) % CELEBRITY_VIDEOS.length)}
          />
        ))}
      </div>
    </div>
  );
}

function VideoCard({ src, title, isActive, onPlayClick, onEnded }: { src: string, title: string, isActive: boolean, onPlayClick: () => void, onEnded: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
    }
  }, [isActive]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden border border-primary/20 shadow-[0_20px_60px_rgba(0,0,0,0.1)] bg-card/20 backdrop-blur-sm cursor-pointer group"
      onClick={onPlayClick}
    >
      <video
        ref={videoRef}
        src={src}
        muted={isMuted}
        playsInline
        preload="metadata"
        onEnded={onEnded}
        className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] scale-100 group-hover:scale-[1.02]"
      />

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-center pointer-events-none">
        <div className={`w-16 h-16 rounded-full backdrop-blur-xl bg-black/40 border border-white/20 flex items-center justify-center text-white transition-all duration-500 ease-out shadow-2xl ${isActive ? 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100' : 'scale-100 opacity-100'}`}>
          {isActive ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
        </div>
      </div>

      <div className="absolute bottom-6 left-6 backdrop-blur-md bg-black/40 border border-white/10 text-xs font-medium tracking-widest uppercase px-4 py-2 rounded-xl text-white shadow-sm pointer-events-none">
        <span className="text-gradient-gold font-bold">{title}</span>
      </div>

      <div 
        className="absolute bottom-6 right-6 backdrop-blur-md bg-black/40 border border-white/10 p-2.5 rounded-full text-white shadow-sm hover:bg-black/60 transition-colors z-10"
        onClick={toggleMute}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative w-full h-[100dvh] md:min-h-[90vh] flex flex-col justify-between md:justify-center items-center md:items-start pt-12 md:pt-24 pb-8 md:pb-12">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt="Rao Bahadur Hero"
            fill
            priority
            className="object-cover object-center hidden md:block"
          />
          <Image
            src="/hero-bg-mobile.png"
            alt="Rao Bahadur Hero Mobile"
            fill
            priority
            className="object-cover object-center block md:hidden"
          />
          {/* Keep only bottom gradient for seamless transition to the next section */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col h-full justify-between md:justify-center items-center md:items-start text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-4 md:gap-6 mt-2 md:mt-0"
          >
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-gold mb-4 uppercase tracking-wider leading-tight drop-shadow-2xl">
                I Root for<br />Rao Bahadur
              </h1>
              <p className="font-sans text-xs sm:text-sm md:text-base lg:text-lg text-foreground/90 max-w-2xl drop-shadow-md mx-auto md:mx-0 px-2 md:px-0">
                The turban tightens. The peacocks watch. A film that has set the screen on fire — and its people, on their feet.
              </p>
            </div>
          </motion.div>

          <div className="flex flex-col items-center md:items-start mt-auto md:mt-8 gap-8 md:gap-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <LoveCounter />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 w-full md:w-auto"
            >
              <Link href="/entry" passHref className="w-full sm:w-auto">
                <Button variant="regal" size="lg" className="rounded-full shadow-glow w-full sm:w-auto">
                  Enter the Fandom
                </Button>
              </Link>
              <Link href="/buzz" passHref className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="rounded-full border-primary/30 text-primary hover:bg-primary/10 w-full sm:w-auto">
                  See the Buzz
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <TweetMarquee />

      <div className="container mx-auto px-4 py-20 space-y-24">
        {/* Celeb Reactions */}
        <CelebrityReactions />

        {/* Reviews */}
        <div className="space-y-12 pt-10">
          <div className="flex flex-col items-center mb-12">
            <h3 className="text-accent tracking-[0.3em] text-xs md:text-sm uppercase mb-4 font-semibold">Trending Reviews</h3>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground text-center uppercase tracking-wider">Critics, In Uproar.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              "/Event/Tweets/Review 1.jpg",
              "/Event/Tweets/Review 2.jpg"
            ].map((imgSrc, idx) => (
              <div key={idx} className="relative w-full rounded-xl overflow-hidden shadow-lg border border-primary/20 bg-card/20 backdrop-blur-sm group">
                <Image
                  src={imgSrc}
                  alt={`Trending Review ${idx + 1}`}
                  width={800}
                  height={800}
                  className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-32 flex flex-col items-center justify-center text-center px-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-8 flex flex-col items-center">
          <h2 className="font-serif text-4xl md:text-6xl max-w-3xl text-gradient-gold uppercase tracking-wider leading-tight drop-shadow-md">
            Have you watched Rao Bahadur<br />yet?
          </h2>
          <p className="text-foreground/80 md:text-lg font-light">
            Your answer decides the door you enter.
          </p>
          <Link href="/entry" passHref>
            <Button variant="regal" size="lg" className="mt-4 px-10 py-6 text-sm tracking-[0.2em] uppercase font-bold rounded-full flex items-center space-x-2 hover:scale-105 transition-transform">
              <span>Choose Your Path</span>
              <span className="text-lg leading-none">&rarr;</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-[10px] sm:text-xs tracking-[0.2em] md:tracking-[0.4em] uppercase text-muted-foreground/60 border-t border-border/10 bg-background/50 flex flex-col md:block gap-3 px-4">
        <span>A Fan Tribute</span>
        <span className="hidden md:inline"> &middot; </span>
        <span>Rao Bahadur</span>
        <span className="hidden md:inline"> &middot; </span>
        <span>Long Live the King</span>
      </footer>
    </div >
  );
}
