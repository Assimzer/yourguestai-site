"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Bubble = {
  id: string;
  name: string;
  avatar: string;
  text: string;
  // Position en pourcentage dans le conteneur (0-100)
  x: number;
  y: number;
};

const bubbles: Bubble[] = [
  {
    id: "wifi",
    name: "Camille",
    avatar: "C",
    text: "Le wifi ne marche pas…",
    x: 8,
    y: 12,
  },
  {
    id: "checkin",
    name: "Marc",
    avatar: "M",
    text: "On arrive à quelle heure ?",
    x: 92,
    y: 15,
  },
  {
    id: "parking",
    name: "Élise",
    avatar: "É",
    text: "Où puis-je me garer ?",
    x: 6,
    y: 82,
  },
  {
    id: "urgence",
    name: "Thomas",
    avatar: "T",
    text: "Fuite d'eau, aide !",
    x: 94,
    y: 85,
  },
];

const CENTER = { x: 50, y: 48 };

function curvePath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  // Décalage perpendiculaire toujours dans le même sens de rotation
  // (comme les pales d'une hélice) : chaque ligne s'écarte proprement de
  // son propre côté au lieu de se superposer aux autres en formant un X
  // au niveau du logo central.
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const curveOffset = 6;
  const perpX = -dy / length;
  const perpY = dx / length;
  const ctrlX = midX + perpX * curveOffset;
  const ctrlY = midY + perpY * curveOffset;
  return `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`;
}

export default function HubSpokeDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-[16/10] w-full max-w-2xl"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {bubbles.map((b, i) => (
          <motion.path
            key={b.id}
            d={curvePath(CENTER, b)}
            fill="none"
            stroke="#E8A33D"
            strokeWidth={0.4}
            strokeOpacity={0.5}
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ delay: i * 0.2, duration: 0.8, ease: "easeInOut" }}
          />
        ))}
      </svg>

      {/* Logo central */}
      <motion.div
        className="absolute left-1/2 top-[48%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-porch-500/40 bg-night-900 shadow-glow sm:h-20 sm:w-20"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="font-display text-lg italic text-porch-400 sm:text-xl">
          LÉO
        </span>
      </motion.div>

      {/* Bulles voyageurs */}
      {bubbles.map((b, i) => (
        <motion.div
          key={b.id}
          className="absolute w-36 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-night-600 bg-night-900 p-2.5 shadow-lg sm:w-44"
          style={{ left: `${b.x}%`, top: `${b.y}%` }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ delay: 0.3 + i * 0.2, duration: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-porch-500 text-[11px] font-semibold text-night-950">
              {b.avatar}
            </div>
            <p className="truncate text-xs font-medium text-white">{b.name}</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-mist-400">
            {b.text}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
