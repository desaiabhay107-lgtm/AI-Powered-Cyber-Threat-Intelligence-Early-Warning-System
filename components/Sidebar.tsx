"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  Flame,
  Radio,
  Search,
  Bug,
  BellRing,
  Bot,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: "Command Overview", href: "/dashboard", icon: ShieldAlert },
    { label: "Threat Feed", href: "/threats", icon: Radio },
    { label: "IOC Explorer", href: "/iocs", icon: Search },
    { label: "CVE Intelligence", href: "/cves", icon: Bug },
    { label: "Early Warning Center", href: "/alerts", icon: BellRing },
    { label: "AI Analyst", href: "/ai", icon: Bot },
    { label: "Admin & Feeds", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/auth/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside
      className={`bg-[#2A1810] text-[#F6EEDF] flex flex-col flex-shrink-0 min-h-screen border-r border-[#3B2418] select-none transition-all duration-300 relative ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#CC5500] text-white flex items-center justify-center shadow-lg border border-[#3B2418] hover:bg-[#B04A00] transition-colors z-20"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Header */}
      <div className="p-5 border-b border-[#3B2418] flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#CC5500] to-[#A8321C] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-serif font-bold text-lg tracking-tight text-[#FDFAF4] flex items-center gap-1.5">
                EmberWatch
                <span className="text-[9px] font-mono uppercase bg-[#CC5500]/30 text-[#F8E1CC] px-1.5 py-0.5 rounded">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-[#D9C3A5] font-mono tracking-tight truncate">
                DEFENSIVE INTELLIGENCE
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 py-1.5 eyebrow text-[#A48873] text-[10px]">
            Security Operations
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? "bg-[#CC5500] text-white shadow-sm font-semibold"
                  : "text-[#D9C3A5] hover:bg-[#3B2418] hover:text-[#FDFAF4]"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-[#D9C3A5]"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Card Footer */}
      <div className="p-4 border-t border-[#3B2418] bg-[#23130C]/60 flex items-center justify-between">
        <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? "justify-center w-full" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-[#4E3324] flex items-center justify-center text-[#FDFAF4] font-serif font-bold text-xs uppercase flex-shrink-0">
            {user?.name ? user.name[0] : "A"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#FDFAF4] truncate">
                {user?.name || "Abhay Desai"}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] font-mono uppercase text-[#CC5500] font-semibold">
                  {user?.role || "Admin"}
                </span>
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-[#D9C3A5] hover:text-white hover:bg-[#3B2418] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
