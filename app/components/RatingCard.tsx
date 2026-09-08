"use client";

import { useEffect, useState } from "react";

const EXAMPLES = [
  {
    label: "Rapidité de réponse",
    score: 5,
    text: "LÉO répond à vos voyageurs sur WhatsApp en moins de 30 secondes, 24h/24.",
  },
  {
    label: "Simplicité de mise en route",
    score: 5,
    text: "Connectez votre calendrier et remplissez le livret d'accueil en quelques minutes, sans code.",
  },
  {
    label: "Précision par logement",
    score: 5,
    text: "Chaque voyageur reçoit les informations de son propre logement — jamais mélangées avec un autre.",
  },
];

const ROTATE_MS = 2000;

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      className={filled ? "text-porch-500" : "text-night-700"}
    >
      <path
        d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.5 6.8L12 16.9 5.8 20.4l1.5-6.8-5.1-4.6 6.9-.7L12 2z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function RatingCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % EXAMPLES.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  const current = EXAMPLES[index];

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-night-600 bg-night-900 p-8 text-center">
      <p
        key={`label-${index}`}
        className="animate-[ygFadeIn_0.4s_ease-out] font-mono text-xs uppercase tracking-[0.2em] text-mist-500"
      >
        {current.label}
      </p>

      <div
        key={`stars-${index}`}
        className="mt-4 flex animate-[ygFadeIn_0.4s_ease-out] items-center justify-center gap-1"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} filled={i < current.score} />
        ))}
      </div>

      <p
        key={`score-${index}`}
        className="mt-4 animate-[ygFadeIn_0.4s_ease-out] font-display text-5xl text-white"
      >
        {current.score}
        <span className="text-2xl text-mist-500">/5</span>
      </p>

      <p
        key={`text-${index}`}
        className="mt-2 animate-[ygFadeIn_0.4s_ease-out] text-sm leading-relaxed text-mist-400"
      >
        {current.text}
      </p>

      <div className="mt-4 flex justify-center gap-1.5">
        {EXAMPLES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition ${
              i === index ? "bg-porch-500" : "bg-night-700"
            }`}
          />
        ))}
      </div>

      <style>{`
        @keyframes ygFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
