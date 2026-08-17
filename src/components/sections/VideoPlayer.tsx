"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayIcon } from "@/components/ui/icons";

export default function VideoPlayer({
  poster,
  src,
  playLabel,
}: {
  poster: string;
  src: string;
  playLabel: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <video src={src} controls autoPlay playsInline className="size-full object-contain">
          Your browser doesn&rsquo;t support embedded video.
        </video>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={playLabel}
      onClick={() => setPlaying(true)}
      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl"
    >
      <Image
        src={poster}
        alt=""
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(min-width: 1024px) 45vw, 100vw"
      />
      <div className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/45" />
      <span className="relative flex size-16 items-center justify-center rounded-full bg-brand-navy text-white shadow-lg transition-transform group-hover:scale-105">
        <PlayIcon className="size-6 translate-x-0.5" />
      </span>
    </button>
  );
}
