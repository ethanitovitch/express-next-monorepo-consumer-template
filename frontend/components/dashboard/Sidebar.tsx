"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Settings,
  LogOut,
  Shield,
  Palette,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useUserSubscription } from "@/hooks/api/useStripe";

const nav = [{ href: "/dashboard", label: "Home", icon: Home }];

const bottom = [{ href: "/dashboard/settings", label: "Settings", icon: Settings }];

const adminNav = [
  { href: "/dashboard/admin", label: "Admin", icon: Shield },
  { href: "/dashboard/theme-builder", label: "Theme Builder", icon: Palette },
];

export default function Sidebar({
  onLogout,
  variant = "fixed",
  collapsed = false,
  onToggleCollapse,
}: {
  onLogout?: () => void;
  variant?: "fixed" | "embedded";
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const isEmbedded = variant === "embedded";
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const { data: subscription } = useUserSubscription(session?.user?.id);

  const Item = ({
    href,
    label,
    icon: Icon,
    active,
    onClick,
    isCollapsed,
  }: {
    href: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
    active?: boolean;
    onClick?: () => void;
    isCollapsed?: boolean;
  }) => (
    <Link
      href={href}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={[
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
        isCollapsed ? "justify-center" : "",
      ].join(" ")}
    >
      <Icon className="h-5 w-5 opacity-90 flex-shrink-0" />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (isEmbedded) {
    return (
      <aside className="w-full h-full px-2 py-4 md:px-3 md:py-6 flex flex-col">
        <div
          className={`mt-2 mb-8 flex items-center ${collapsed ? "justify-center" : "justify-between px-2"}`}
        >
          {!collapsed && (
            <Link
              href="/dashboard"
              className="text-xl font-semibold tracking-tight text-foreground hover:opacity-80 transition"
            >
              Update Me
            </Link>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-muted rounded-lg transition text-muted-foreground hover:text-foreground"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
          )}
        </div>

        <div className="border-b border-border mb-6" />

        <nav className="space-y-2">
          {nav.map((n) => (
            <Item
              key={n.href}
              href={n.href}
              label={n.label}
              icon={n.icon}
              active={n.href === "/dashboard" ? pathname === n.href : pathname?.startsWith(n.href)}
              isCollapsed={collapsed}
            />
          ))}
          {isAdmin &&
            adminNav.map((n) => (
              <Item
                key={n.href}
                href={n.href}
                label={n.label}
                icon={n.icon}
                active={pathname?.startsWith(n.href)}
                isCollapsed={collapsed}
              />
            ))}
        </nav>

        {!subscription && !collapsed && (
          <div className="flex-1 flex items-center justify-center px-2">
            <div className="rounded-xl bg-gradient-to-b from-muted to-card p-6 py-8 flex flex-col items-center justify-center w-full border border-border">
              <h3 className="text-base font-semibold text-foreground mb-1">Make it happen</h3>
              <p className="text-xs text-muted-foreground mb-3 text-center">
                Subscribe to get full access to Update Me
              </p>
              <Link
                href="/dashboard/settings"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2 px-4 rounded-lg transition text-center"
              >
                Subscribe
              </Link>
            </div>
          </div>
        )}

        <div className="mt-auto space-y-2 pt-6 border-t border-border">
          {bottom.map((n) => (
            <Item
              key={n.href}
              href={n.href}
              label={n.label}
              icon={n.icon}
              active={pathname?.startsWith(n.href)}
              isCollapsed={collapsed}
            />
          ))}
          <button
            onClick={onLogout}
            title={collapsed ? "Logout" : undefined}
            className={`group flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bottom-2 sm:bottom-3 md:bottom-4 z-20 w-56 md:w-60 border border-border bg-card rounded-2xl shadow-sm px-3 py-4 md:px-4 md:py-6 hidden sm:flex flex-col">
      <div className="mt-2 mb-5 px-2">
        <Link
          href="/dashboard"
          className="text-xl font-semibold tracking-tight text-foreground hover:opacity-80 transition"
        >
          Update Me
        </Link>
      </div>

      <div className="border-b border-border mb-6" />

      <nav className="space-y-2">
        {nav.map((n) => (
          <Item
            key={n.href}
            href={n.href}
            label={n.label}
            icon={n.icon}
            active={n.href === "/dashboard" ? pathname === n.href : pathname?.startsWith(n.href)}
          />
        ))}
        {isAdmin &&
          adminNav.map((n) => (
            <Item
              key={n.href}
              href={n.href}
              label={n.label}
              icon={n.icon}
              active={pathname?.startsWith(n.href)}
            />
          ))}
      </nav>

      {!subscription && (
        <div className="flex-1 flex items-center justify-center px-2">
          <div className="rounded-xl bg-gradient-to-b from-muted to-card p-6 py-8 flex flex-col items-center justify-center w-full border border-border">
            <h3 className="text-base font-semibold text-foreground mb-1">Make it happen</h3>
            <p className="text-xs text-muted-foreground mb-3 text-center">
              Subscribe to get full access to Update Me
            </p>
            <Link
              href="/dashboard/settings"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2 px-4 rounded-lg transition text-center"
            >
              Subscribe
            </Link>
          </div>
        </div>
      )}

      <div className="mt-auto space-y-2 pt-6 border-t border-border">
        {bottom.map((n) => (
          <Item
            key={n.href}
            href={n.href}
            label={n.label}
            icon={n.icon}
            active={pathname?.startsWith(n.href)}
          />
        ))}
        <button
          onClick={onLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
