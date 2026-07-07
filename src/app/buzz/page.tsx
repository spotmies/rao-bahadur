"use client";

import Image from "next/image";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Lock, Ticket, Popcorn, Smartphone } from "lucide-react";
import { celebs, theories, Celeb } from "@/data/mock";
import { useState } from "react";

export default function BuzzPage() {
  const [showBookingOptions, setShowBookingOptions] = useState(false);


  return (
    <div className="min-h-screen flex flex-col pt-28 md:pt-40 pb-12 px-4 container mx-auto space-y-24">
      <div className="flex flex-col space-y-8">
        <div className="text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-6xl text-foreground uppercase tracking-widest"
          >
            You are missing out
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Discover Rao Bahadur the way it was meant to be experienced.
          </motion.p>

        </div>

        {/* Trailer Embed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="w-full max-w-4xl mx-auto rounded-[2rem] overflow-hidden border border-primary/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)] bg-card/10 backdrop-blur-sm p-2"
        >
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/3qSIgQxpoqM?si=IhA4GTk-e-r7hnUV"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>

        {/* Book Tickets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 min-h-[56px]"
        >
          {!showBookingOptions ? (
            <Button
              variant="regal"
              size="lg"
              className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 shadow-glow"
              onClick={() => setShowBookingOptions(true)}
            >
              <Ticket className="w-5 h-5" />
              Book Tickets
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-row justify-center gap-4 w-full max-w-lg mx-auto"
            >
              <a href="https://in.bookmyshow.com/movies/rao-bahadur/ET00458566" target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="lg" className="w-full p-0 overflow-hidden bg-red-600/10 hover:bg-red-600/20 border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.3)] h-12 md:h-14 group">
                  <img src="https://cdn.aptoide.com/imgs/c/7/9/c7948850a706fca8904015c9809f7ca4_fgraphic.jpg" alt="BookMyShow" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </Button>
              </a>
              <a href="https://www.district.in/movies/rao-bahadur-movie-tickets-MV204022" target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="lg" className="w-full p-0 overflow-hidden bg-purple-600/10 hover:bg-purple-600/20 border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.3)] h-12 md:h-14 group">
                  <img src="https://media.licdn.com/dms/image/v2/D5612AQENNmUosxgwGA/article-cover_image-shrink_720_1280/B56ZfY173vHoAI-/0/1751689708143?e=2147483647&v=beta&t=sDcVqA3slVmKQ9730YaH69Kde3XpGyEWVK1XoOTdfw4" alt="District" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </Button>
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="space-y-10">
        <h2 className="font-serif text-3xl text-center text-primary">Viral Reactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-primary/20 bg-card/10 backdrop-blur-sm group">
              <Image
                src={`https://res.cloudinary.com/uohqyl93/image/upload/raobahadur/event/letterboxd/letterboxd_${i + 1}.jpg`}
                alt={`Viral Reaction ${i + 1}`}
                width={500}
                height={800}
                className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
