"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Bubble = {
  id: string;
  name: string;
  avatar: string;
  text: string;
};

const bubbles: Bubble[] = [
  { id: "wifi", name: "Camille", avatar: "C", text: "Le wifi ne marche pas…" },
  { id: "checkin", name: "Marc", avatar: "M", text: "On arrive à quelle heure ?" },
  { id: "parking", name: "Élise", avatar: "É", text: "Où puis-je me garer ?" },
  { id: "urgence", name: "Thomas", avatar: "T", text: "Fuite d'eau, aide !" },
];

export default function HubSpokeDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div
      ref={ref}
      className="mx-auto flex w-full max-w-2xl flex-col items-center"
    >
      {/* Logo central */}
      <motion.div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-porch-500/40 bg-night-900 shadow-glow sm:h-20 sm:w-20"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="font-display text-base italic text-porch-400 sm:text-xl">
          LÉO
        </span>
      </motion.div>

      {/* Tige verticale reliant LÉO à la barre horizontale */}
      <motion.div
        className="w-px bg-porch-500/40"
        initial={{ height: 0 }}
        animate={inView ? { height: 24 } : { height: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      />

      {/* Barre horizontale + 4 branches vers les bulles */}
      <div className="grid w-full grid-cols-4 gap-x-2 border-t border-porch-500/40 pt-6 sm:gap-x-4">
        {bubbles.map((b, i) => (
          <div key={b.id} className="relative flex justify-center">
            <span
              className="absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2 bg-porch-500/40"
              aria-hidden
            />
            <motion.div
              className="flex w-full min-w-0 flex-col items-center gap-1 rounded-xl border border-night-600 bg-night-900 px-1.5 py-2 text-center shadow-lg sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5 sm:text-left"
              initial={{ opacity: 0, y: -6 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-porch-500 text-[11px] font-semibold text-night-950 sm:h-6 sm:w-6">
                {b.avatar}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-medium text-white sm:text-xs">
                  {b.name}
                </p>
                <p className="hidden truncate text-[11px] leading-snug text-mist-400 sm:block">
                  {b.text}
                </p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
