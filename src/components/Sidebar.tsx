"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Dashboard", icon: "/icons/home.svg" },
  { href: "/periods", label: "QWE Periods", icon: "/icons/briefcase.svg" },
  { href: "/reflections", label: "Journal Reflections", icon: "/icons/notepad.svg" },
  { href: "/emails", label: "Email Tools", icon: "/icons/mail.svg" },
  { href: "/settings", label: "Settings", icon: "/icons/cog.svg" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <>
      {/* Desktop left rail */}
      <aside className="hidden sm:flex sidebar w-24 flex-col items-center py-8 gap-8 text-white">
        <div className="w-14 h-auto">
          <Image src="/images/white-transparent.png" alt="LOD" width={56} height={56} />
        </div>
        <nav className="flex flex-col gap-6 mt-10">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link 
                key={it.href} 
                href={it.href} 
                className={`group relative grid place-items-center w-12 h-12 rounded-xl clickable transition-all duration-300 ease-out transform hover:scale-110 hover:shadow-lg hover:shadow-white/20 ${
                  active 
                    ? "bg-white/30 shadow-lg shadow-white/20 scale-105" 
                    : "bg-white/10 hover:bg-white/20 hover:shadow-md hover:shadow-white/15"
                }`}
              >
                <span className="sr-only">{it.label}</span>
                <Image 
                  src={it.icon} 
                  alt="" 
                  width={28} 
                  height={28} 
                  className={`transition-all duration-300 ${active ? "filter brightness-110" : "group-hover:filter group-hover:brightness-110"}`}
                />
                {/* Subtle glow effect on hover */}
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                  active 
                    ? "bg-gradient-to-br from-white/20 to-transparent" 
                    : "group-hover:bg-gradient-to-br group-hover:from-white/10 group-hover:to-transparent"
                }`} />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 sidebar text-white">
        <ul className="flex items-center justify-around py-3">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <li key={it.href}>
                <Link 
                  href={it.href} 
                  className={`group relative grid place-items-center w-12 h-12 rounded-xl clickable transition-all duration-300 ease-out transform hover:scale-110 hover:shadow-lg hover:shadow-white/20 ${
                    active 
                      ? "bg-white/30 shadow-lg shadow-white/20 scale-105" 
                      : "bg-white/10 hover:bg-white/20 hover:shadow-md hover:shadow-white/15"
                  }`}
                >
                  <span className="sr-only">{it.label}</span>
                  <Image 
                    src={it.icon} 
                    alt="" 
                    width={24} 
                    height={24} 
                    className={`transition-all duration-300 ${active ? "filter brightness-110" : "group-hover:filter group-hover:brightness-110"}`}
                  />
                  {/* Subtle glow effect on hover */}
                  <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    active 
                      ? "bg-gradient-to-br from-white/20 to-transparent" 
                      : "group-hover:bg-gradient-to-br group-hover:from-white/10 group-hover:to-transparent"
                  }`} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}


