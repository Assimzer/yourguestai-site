"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const TARGET_SCORE = 5;

export default function RatingCard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

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
          <motion.svg
            key={i}
            width="28"
            height="28"
            viewBox="0 0 24 24"
            initial={{ scale: 0.6, opacity: 0.2 }}
            animate={
              inView && i < TARGET_SCORE
                ? { scale: 1, opacity: 1 }
                : { scale: 0.6, opacity: 0.2 }
            }
            transition={{ delay: i * 0.15, type: "spring", stiffness: 300 }}
          >
            <path
              d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.5 6.8L12 16.9 5.8 20.4l1.5-6.8-5.1-4.6 6.9-.7L12 2z"
              fill="#E8A33D"
            />
          </motion.svg>
        ))}
      </div>

      <motion.p
        className="mt-4 font-display text-5xl text-white"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        5<span className="text-2xl text-mist-500">/5</span>
      </motion.p>

      <p className="mt-2 text-sm leading-relaxed text-mist-400">
        LÉO répond à vos voyageurs sur WhatsApp en moins de 30 secondes,
        24h/24.
      </p>
    </div>
  );
}
