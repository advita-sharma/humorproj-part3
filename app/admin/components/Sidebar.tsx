"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, LogOut, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  userName: string;
}

const navItems = [
  { href: "/admin/humor-flavors", label: "Humor Flavors", icon: Layers },
];

export default function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-56 flex flex-col border-r border-[var(--card-border)] bg-[var(--card)] shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[var(--card-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            P
          </div>
          <div>
            <p className="text-[var(--foreground)] font-semibold text-sm leading-tight">
              Prompt Chain
            </p>
            <p className="text-[var(--muted)] text-xs">Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[var(--card-border)] space-y-3">
        <ThemeToggle />
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
            <User size={12} className="text-violet-400" />
          </div>
          <span className="text-[var(--muted)] text-xs truncate flex-1">
            {userName}
          </span>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
