"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Megaphone, 
  ClockAlert, 
  CalendarDays, 
  BotMessageSquare,
  Menu
} from "lucide-react";
import { NavTab } from "@/types";

interface MobileBottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unreadDeadlinesCount: number;
  onOpenMenu: () => void;
}

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  unreadDeadlinesCount,
  onOpenMenu
}: MobileBottomNavProps) {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<any>; badge?: number }[] = [
    {
      id: "overview",
      label: "Beranda",
      icon: LayoutDashboard,
    },
    {
      id: "bulletin",
      label: "Info/Kas",
      icon: Megaphone,
    },
    {
      id: "deadlines",
      label: "Tugas",
      icon: ClockAlert,
      badge: unreadDeadlinesCount,
    },
    {
      id: "schedule",
      label: "Jadwal",
      icon: CalendarDays,
    },
    {
      id: "chatai",
      label: "Tanya AI",
      icon: BotMessageSquare,
    },
  ];

  return (
    <nav className="kl-mobile-bottom-nav" aria-label="Navigasi Mobile Bawah">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const hasBadge = Boolean(item.badge && item.badge > 0);

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`kl-bottom-nav-item ${isActive ? "active" : ""}`}
            type="button"
          >
            <div className="kl-bottom-nav-icon-wrapper">
              <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
              {hasBadge && (
                <span className="kl-bottom-nav-badge">
                  {item.badge! > 9 ? "9+" : item.badge}
                </span>
              )}
            </div>
            <span className="kl-bottom-nav-label">{item.label}</span>
          </button>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        onClick={onOpenMenu}
        className="kl-bottom-nav-item"
        type="button"
        title="Buka Menu Lengkap"
      >
        <div className="kl-bottom-nav-icon-wrapper">
          <Menu size={20} strokeWidth={1.8} />
        </div>
        <span className="kl-bottom-nav-label">Menu</span>
      </button>
    </nav>
  );
}
