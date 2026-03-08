"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAppContext } from "@/components/app-provider";
import { useAuth } from "@/components/auth-provider";

const navItems = [
  { href: "/", label: "Home", icon: "◐" },
  { href: "/import", label: "Import", icon: "↗" },
  { href: "/history", label: "History", icon: "◫" },
  { href: "/ask", label: "Ask", icon: "✦" },
  { href: "/settings", label: "Settings", icon: "☰" },
];

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, state } = useAppContext();
  const { ready: authReady, user } = useAuth();
  const onboardingRoute = pathname === "/onboarding";
  const authRoute = pathname === "/auth";
  const hideNavigation = onboardingRoute || authRoute;

  useEffect(() => {
    if (!hydrated || !authReady) {
      return;
    }

    if (!user) {
      if (!authRoute) {
        router.replace("/auth");
      }
      return;
    }

    if (user && authRoute) {
      router.replace(state.onboardingComplete ? "/" : "/onboarding");
      return;
    }

    if (!state.onboardingComplete && !onboardingRoute) {
      router.replace("/onboarding");
      return;
    }

    if (state.onboardingComplete && onboardingRoute) {
      router.replace("/");
    }
  }, [authRoute, authReady, hydrated, router, state.onboardingComplete, user, onboardingRoute]);

  if (!hydrated || !authReady) {
    return (
      <main className="app-shell">
        <section className="page loading-page">
          <div className="loading-orb" />
          <p className="loading-copy">Loading your private space…</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="page">
        <header className="page-header">
          <div>
            <p className="eyebrow">Luna Cycle</p>
            <h1>{title}</h1>
          </div>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </header>
        {children}
      </section>
      {hideNavigation ? null : (
        <nav className="bottom-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${pathname === item.href ? " is-active" : ""}`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
