"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Heart, Star, VolumeX, Volume2, Play, Pause, X } from "lucide-react";
import { Celeb, Review } from "@/data/mock";

function LoveCounter() {
  const [count, setCount] = useState(51347);
  const [isClient, setIsClient] = useState(false);
  const [sales, setSales] = useState(265000);
  const countRef = useRef(51347);

  useEffect(() => {
    setIsClient(true);
    let mounted = true;

    const incrementCounter = async () => {
      try {
        const res = await fetch('/api/counter', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.count && mounted) {
            setCount(data.count);
            countRef.current = data.count;
            setSales(265000 + (data.count - 51347));
          }
        }
      } catch (err) {
        console.error("Failed to load counter", err);
      }
    };
    incrementCounter();

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/counter');
        if (res.ok) {
          const data = await res.json();
          if (data.count && data.count > countRef.current && mounted) {
            setCount(data.count);
            countRef.current = data.count;
            setSales(265000 + (data.count - 51347));
          }
        }
      } catch (err) {
        // Ignore polling errors
      }
    }, 3000); // Check every 3 seconds for a real-time feel

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center md:items-start justify-center space-y-1 drop-shadow-lg">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1.1, 1.25, 1] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        >
          <span className="text-4xl md:text-5xl drop-shadow-[0_0_15px_rgba(255,50,50,0.8)]">❤️</span>
        </motion.div>
        <div className="font-display text-5xl md:text-7xl font-medium tabular-nums text-gold tracking-wide leading-none flex items-center">
          <motion.span
            key={count}
            initial={{ opacity: 0.5, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {isClient ? count.toLocaleString('en-IN') : (51347).toLocaleString('en-IN')}
          </motion.span>
        </div>
      </div>
      <div className="text-[10px] md:text-sm text-foreground/80 uppercase tracking-widest md:pl-11 font-medium text-center md:text-left mb-2">
        People who entered the world of Rao Bahadur
      </div>

      <div className="md:pl-11 flex justify-center md:justify-start w-full">
        <HourlySalesIndicator sales={isClient ? sales : 265000} />
      </div>
    </div>
  );
}

function HourlySalesIndicator({ sales }: { sales: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="mt-6 flex flex-wrap items-center gap-4 scale-90 md:scale-95 origin-center md:origin-left"
    >
      {/* Subtle Divider */}
      <div className="h-px w-8 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>

      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">

        {/* Overlapping Logos */}
        <div className="flex items-center -space-x-2">
          {/* BookMyShow Logo */}
          <div className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-black z-10 shadow-sm overflow-hidden bg-white">
            <img src="https://play-lh.googleusercontent.com/TB_8RMvDjxGmx06LBK-8opRFJ0msb6hSZalEtOMBmxgJ4jYE_i0BmdRuMWChCE76tLnxoytZ75Cew_r0_JDd" alt="BookMyShow" className="w-full h-full object-cover" />
          </div>
          {/* District App Logo */}
          <div className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-black z-0 shadow-sm overflow-hidden bg-white">
            <img src="https://play-lh.googleusercontent.com/t0LH2EDF97k1-d2i8kSh_vUlZlnntAGWRYIX8BVSRSAyMGUlNAraa-q4kez1YMKQmGc_9BeEFGmD3wTud5NDOg=w240-h480-rw" alt="District App" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Hardcoded Typography */}
        <div className="flex items-center gap-2">
          {/* Pulsing indicator for a 'live' feel even though it's hardcoded */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>

          <p className="text-sm font-medium text-gray-300 tracking-wide">
            <span className="text-white font-bold">{sales.toLocaleString('en-IN')}+</span> tickets sold so far
          </p>
        </div>

      </div>

      <div className="h-px w-8 bg-gradient-to-r from-[#D4AF37]/50 via-transparent to-transparent"></div>
    </motion.div>
  );
}

const SOCIAL_PROOF_IMAGES = [
  // Celeb tweets
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/celebrity_tweets/Tweets_11.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/celebrity_tweets/Tweets_23.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/celebrity_tweets/Tweets_27.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/celebrity_tweets/Tweets_28.jpg",

  // Regular tweets
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Tweets_2.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Tweets_9.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Tweets_10.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Tweets_19.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Tweets_24.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Tweets_26.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Tweets_30.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Tweets_31.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Tweets_32.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Tweets_33.jpg",
  "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Tweets_34.jpg",
];

function TweetMarquee() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div id="buzz" className="w-full overflow-hidden whitespace-nowrap py-20 border-y border-border/30 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center mb-12 whitespace-normal px-4">
        <h3 className="text-accent tracking-[0.3em] text-xs md:text-sm uppercase mb-4 font-semibold text-center">Fan Buzz</h3>
        <h2 className="font-serif text-3xl md:text-5xl text-foreground text-center">One Film. Countless Reactions.</h2>
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div
        className="inline-block"
        style={{
          animation: 'marquee-scroll 120s linear infinite',
          animationPlayState: selectedImage ? 'paused' : 'running'
        }}
      >
        <div className="flex space-x-6 px-4 items-center">
          {[...SOCIAL_PROOF_IMAGES, ...SOCIAL_PROOF_IMAGES, ...SOCIAL_PROOF_IMAGES].map((imgSrc, i) => (
            <div
              key={`${i}`}
              className="relative w-[300px] sm:w-[380px] h-auto flex-shrink-0 rounded-xl overflow-hidden border border-primary/20 shadow-lg bg-card/20 backdrop-blur-sm group cursor-pointer"
              onClick={() => setSelectedImage(imgSrc)}
            >
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
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm whitespace-normal"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="absolute top-4 right-4 md:top-8 md:right-8 cursor-pointer p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors z-50"
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Expanded Tweet"
              width={1200}
              height={800}
              className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}

const CELEBRITY_VIDEOS = [
  { src: "https://res.cloudinary.com/uohqyl93/video/upload/raobahadur/event/videos/Sukumar_compressed.mp4", title: "Sukumar" },
  { src: "https://res.cloudinary.com/uohqyl93/video/upload/raobahadur/event/videos/Naga_Chaitanya_compressed.mp4", title: "Naga Chaitanya" },
  {
    src: "https://res.cloudinary.com/uohqyl93/video/upload/raobahadur/event/videos/Rahul_Ravindran.mp4",
    title: "Rahul Ravindran",
    poster: "https://res.cloudinary.com/uohqyl93/video/upload/so_7.06/raobahadur/event/videos/Rahul_Ravindran.jpg"
  },
  {
    src: "https://res.cloudinary.com/uohqyl93/video/upload/raobahadur/event/videos/Hollywood_Reporter.mp4",
    title: "Hollywood Reporter",
    poster: "https://res.cloudinary.com/uohqyl93/video/upload/so_5.0/raobahadur/event/videos/Hollywood_Reporter.jpg"
  },
  { src: "https://res.cloudinary.com/uohqyl93/video/upload/raobahadur/event/videos/Critics.mp4", title: "Critics" },
  { src: "https://res.cloudinary.com/uohqyl93/video/upload/raobahadur/event/videos/RB_public_Review_Plain.mp4", title: "Public Review" }
];

function CelebrityReactions() {
  const [activeVideo, setActiveVideo] = useState(-1);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView && !hasAutoPlayed) {
      setActiveVideo(0);
      setHasAutoPlayed(true);
    }
  }, [isInView, hasAutoPlayed]);

  return (
    <div ref={ref} className="space-y-12 pt-10">
      <div className="flex flex-col items-center mb-12">
        <h3 className="text-accent tracking-[0.3em] text-xs md:text-sm uppercase mb-4 font-semibold">Celebrity Reactions</h3>
        <h2 className="font-serif text-3xl md:text-5xl text-foreground text-center uppercase tracking-wider">They Came. They Saw. They Bowed.</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {CELEBRITY_VIDEOS.map((video, idx) => (
          <VideoCard
            key={idx}
            src={video.src}
            poster={video.poster}
            title={video.title}
            isActive={activeVideo === idx}
            onPlayClick={() => setActiveVideo(activeVideo === idx ? -1 : idx)}
            onEnded={() => setActiveVideo((idx + 1) % CELEBRITY_VIDEOS.length)}
          />
        ))}
      </div>
    </div>
  );
}

function VideoCard({ src, poster, title, isActive, onPlayClick, onEnded }: { src: string, poster?: string, title: string, isActive: boolean, onPlayClick: () => void, onEnded: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => { });
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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current && videoRef.current.duration) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const percentage = Math.max(0, Math.min(100, (x / bounds.width) * 100));
      videoRef.current.currentTime = (percentage / 100) * videoRef.current.duration;
      setProgress(percentage);
    }
  };

  return (
    <div
      className="relative w-full aspect-video rounded-2xl overflow-hidden border border-primary/20 shadow-[0_20px_60px_rgba(0,0,0,0.1)] bg-card/20 backdrop-blur-sm cursor-pointer group"
      onClick={onPlayClick}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || src.replace('.mp4', '.jpg')}
        muted={isMuted}
        playsInline
        preload="metadata"
        onEnded={onEnded}
        onTimeUpdate={handleTimeUpdate}
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

      {isActive && (
        <div
          className="absolute bottom-6 right-6 backdrop-blur-md bg-black/40 border border-white/10 p-2.5 rounded-full text-white shadow-sm hover:bg-black/60 transition-colors z-10"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </div>
      )}

      {isActive && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5 hover:h-2.5 transition-all bg-black/40 cursor-pointer group/scrubber z-20"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-[#f5c66d] relative transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/scrubber:opacity-100 transform translate-x-1/2 transition-opacity" />
          </div>
        </div>
      )}
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
                A place for everyone who loved Rao Bahadur.
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
                  Root for Rao Bahadur
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-primary/30 text-primary hover:bg-primary/10 w-full sm:w-auto"
                onClick={() => document.getElementById('buzz')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See the Buzz
              </Button>
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
              "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Review_1.jpg",
              "https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/tweets/Review_2.jpg"
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
      <footer className="relative z-50 w-full py-8 text-center text-[10px] sm:text-xs tracking-[0.2em] md:tracking-[0.4em] uppercase text-muted-foreground/60 border-t border-border/10 bg-background/50 flex flex-col md:block gap-3 px-4">
        <span>A Fan Tribute</span>
        <span className="hidden md:inline"> &middot; </span>
        <span>Rao Bahadur</span>
        <span className="hidden md:inline"> &middot; </span>
        <span>Join the Conversation</span>
      </footer>
    </div >
  );
}
