"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Heart, Star } from "lucide-react";
import { tweets, celebs, reviews, Celeb, Tweet, Review } from "@/data/mock";

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
        <div className="flex space-x-6 px-4">
          {[...tweets, ...tweets, ...tweets].map((tweet: Tweet, i) => (
            <Card key={`${tweet.id}-${i}`} className="w-[380px] min-h-[160px] flex-shrink-0 bg-card/20 backdrop-blur-sm border-primary/10 whitespace-normal">
              <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-foreground">{tweet.name}</span>
                  <span className="text-muted-foreground">{tweet.handle}</span>
                </div>
                <p className="text-foreground/90 text-sm leading-relaxed flex-grow">
                  {tweet.text}
                </p>
                <div className="flex items-center text-xs font-semibold text-accent pt-2">
                  <span className="mr-2">💛</span> {((i * 7431) % 20000 + 1000).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
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
        <div className="space-y-12 pt-10">
          <div className="flex flex-col items-center mb-12">
            <h3 className="text-accent tracking-[0.3em] text-xs md:text-sm uppercase mb-4 font-semibold">Celebrity Reactions</h3>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground text-center uppercase tracking-wider">They Came. They Saw. They Bowed.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {celebs.map((celeb: Celeb) => (
              <Card key={celeb.id} className="bg-card/20 border-primary/10 backdrop-blur-sm shadow-md">
                <CardContent className="p-8 flex flex-col space-y-6">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/40 to-primary/20 text-foreground flex items-center justify-center font-serif text-xl shadow-inner border border-primary/20">
                      {celeb.initial}
                    </div>
                    <div className="flex flex-col">
                      <div className="font-serif text-lg text-foreground uppercase tracking-widest">{celeb.name}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{celeb.role}</div>
                    </div>
                  </div>
                  <blockquote className="text-sm italic text-foreground/80 font-light leading-relaxed">
                    "{celeb.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-12 pt-10">
          <div className="flex flex-col items-center mb-12">
            <h3 className="text-accent tracking-[0.3em] text-xs md:text-sm uppercase mb-4 font-semibold">Trending Reviews</h3>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground text-center uppercase tracking-wider">Critics, In Uproar.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {reviews.map((review: Review) => (
              <Card key={review.id} className="bg-card/20 border-primary/10 backdrop-blur-sm shadow-md">
                <CardContent className="p-8 flex flex-col space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="font-serif text-lg font-bold text-foreground uppercase tracking-widest">
                      {review.source}
                    </div>
                    <div className="flex space-x-1 text-gradient-gold items-center">
                      {Array.from({ length: Math.floor(review.stars) }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                      {review.stars % 1 !== 0 && (
                        <span className="text-base font-bold font-serif pl-1 leading-none">½</span>
                      )}
                    </div>
                  </div>
                  <blockquote className="text-sm italic text-foreground/80 font-light leading-relaxed">
                    "{review.snippet}"
                  </blockquote>
                </CardContent>
              </Card>
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
