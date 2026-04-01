"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "\u25C6" },
  { href: "/story", label: "Story Editor", icon: "\u270E" },
  { href: "/generate", label: "Generator", icon: "\u26A1" },
  { href: "/viewer", label: "Viewer", icon: "\uD83D\uDCD6" },
  { href: "/settings", label: "Settings", icon: "\u2699" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0a0a16] border-r border-white/[0.08] flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#e63946]">
          RIKU
        </h1>
        <p className="text-sm text-white/60 mt-1">Comic Studio</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#e63946] text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-base w-5 text-center">{icon}</span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Version */}
      <div className="px-6 py-4 border-t border-white/[0.08]">
        <p className="text-xs text-white/40">v1.0.0</p>
      </div>
    </aside>
  );
}
