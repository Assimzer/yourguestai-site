"use client";

import { useEffect, useRef, useState } from "react";

const TABS = [
  { id: "hero", label: "Accueil" },
  { id: "comment-ca-marche", label: "Comment ça marche" },
  { id: "hub", label: "Un numéro, tous vos logements" },
  { id: "tarifs", label: "Tarifs" },
  { id: "faq", label: "FAQ" },
  { id: "demo", label: "Démo" },
];

export default function SubNav() {
  const [active, setActive] = useState(TABS[0].id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const sections = TABS.map((t) => document.getElementById(t.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    tabRefs.current[active]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active]);

  return (
    <div className="sticky top-16 z-40 border-b border-night-800 bg-night-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            type="button"
            onClick={() =>
              document
                .getElementById(tab.id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active === tab.id
                ? "bg-porch-500 text-night-950"
                : "text-mist-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
