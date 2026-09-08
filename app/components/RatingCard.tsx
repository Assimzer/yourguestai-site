"use client";

import { useEffect, useState } from "react";

const ARGUMENT = {
  label: "Avis en danger",
  text: "Une réponse lente ou une info erronée = avis négatif qui pèse sur la note pendant des mois.",
};

const EXAMPLES = [
  {
    label: ARGUMENT.label,
    score: 3,
    color: "#E8735A", // rouge (warn)
    text: ARGUMENT.text,
  },
  {
    label: ARGUMENT.label,
    score: 4,
    color: "#E8A33D", // orange (porch)
    text: ARGUMENT.text,
  },
  {
    label: ARGUMENT.label,
    score: 5,
    color: "#5FC98D", // vert (ok)
    text: ARGUMENT.text,
  },
];

const ROTATE_MS = 3000;

function Star({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" className="text-night-700">
      <path
        d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.5 6.8L12 16.9 5.8 20.4l1.5-6.8-5.1-4.6 6.9-.7L12 2z"
        fill={filled ? color : "currentColor"}
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
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-night-600 bg-night-900 p-6 text-center sm:p-8" style={{ minHeight: 260 }}>
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
          <Star key={i} filled={i < current.score} color={current.color} />
        ))}
      </div>

      <p
        key={`score-${index}`}
        className="mt-4 animate-[ygFadeIn_0.4s_ease-out] font-display text-5xl"
        style={{ color: current.color }}
      >
        {current.score}
        <span className="text-2xl text-mist-500">/5</span>
      </p>

      <p
        key={`text-${index}`}
        className="mt-2 flex min-h-[3.5rem] animate-[ygFadeIn_0.4s_ease-out] items-center text-sm leading-relaxed text-mist-400"
      >
        {current.text}
      </p>

      <div className="mt-4 flex justify-center gap-1.5">
        {EXAMPLES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full transition"
            style={{
              backgroundColor: i === index ? current.color : "#2A3554",
            }}
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
