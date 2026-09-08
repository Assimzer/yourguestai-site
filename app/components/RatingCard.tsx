"use client";

import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";

const MAX_SCORE = 5;

function Star({ fill }: { fill: number }) {
  const clampedFill = Math.max(0, Math.min(1, fill));
  return (
    <div className="relative h-8 w-8">
      <svg width="32" height="32" viewBox="0 0 24 24" className="absolute inset-0 text-night-700">
        <path
          d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.5 6.8L12 16.9 5.8 20.4l1.5-6.8-5.1-4.6 6.9-.7L12 2z"
          fill="currentColor"
        />
      </svg>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${clampedFill * 100}%` }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" className="text-porch-500">
          <path
            d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.5 6.8L12 16.9 5.8 20.4l1.5-6.8-5.1-4.6 6.9-.7L12 2z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}

export default function RatingCard() {
  const ref = useRef<HTMLDivElement>(null);

  // La progression suit le scroll de l'utilisateur à travers la carte :
  // 0 quand elle entre en bas du viewport, 1 quand elle atteint le tiers
  // haut — le score et les étoiles se remplissent pendant qu'on scrolle,
  // pas en un seul coup à l'apparition.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "start 30%"],
  });

  const scoreMotion = useTransform(scrollYProgress, [0, 1], [0, MAX_SCORE]);
  const [score, setScore] = useState(0);

  useMotionValueEvent(scoreMotion, "change", (v) => {
    setScore(Math.max(0, Math.min(MAX_SCORE, v)));
  });

  return (
    <div
      ref={ref}
      className="mx-auto max-w-sm rounded-2xl border border-night-600 bg-night-900 p-8 text-center"
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-mist-500">
        Rapidité de réponse
      </p>

      <div className="mt-4 flex items-center justify-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} fill={score - i} />
        ))}
      </div>

      <p className="mt-4 font-display text-5xl text-white tabular-nums">
        {score.toFixed(1)}
        <span className="text-2xl text-mist-500">/5</span>
      </p>

      <p className="mt-2 text-sm leading-relaxed text-mist-400">
        LÉO répond à vos voyageurs sur WhatsApp en moins de 30 secondes,
        24h/24.
      </p>
    </div>
  );
}
