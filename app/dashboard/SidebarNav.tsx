"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    label: "Sections principales",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: "📊" },
      { href: "/dashboard/logements", label: "Logements", icon: "🏠" },
      { href: "/dashboard/messages", label: "Messages", icon: "💬" },
      { href: "/dashboard/reservations", label: "Réservations", icon: "📅" },
    ],
  },
  {
    label: "Compte",
    items: [
      { href: "/dashboard/compte", label: "Mon compte", icon: "⚙️" },
      { href: "/dashboard/aide", label: "Aide", icon: "❓" },
    ],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-6">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-mist-500">
            {section.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition ${
                    active
                      ? "bg-night-800 text-white"
                      : "text-mist-400 hover:bg-night-800/60 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
