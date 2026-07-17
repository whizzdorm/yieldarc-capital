import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { WalletButton } from "@/components/wallet/WalletButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { truncateAddress, useApp } from "@/lib/app-context";
import { LayoutDashboard, Layers, Briefcase, History, Menu, X, LogOut } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vaults", label: "Vaults", icon: Layers },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/history", label: "History", icon: History },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { address, disconnect } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark className="h-7 w-7" />
          <span className="font-bold">YieldArc</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        <aside
          className={`${open ? "flex" : "hidden"} md:flex fixed md:sticky top-0 left-0 z-30 h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground`}
        >
          <Link to="/" className="flex items-center gap-2 px-6 py-5">
            <LogoMark className="h-8 w-8" />
            <span className="text-lg font-bold text-white">YieldArc</span>
          </Link>
          <nav className="mt-2 flex-1 space-y-1 px-3">
            {items.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-white"
                activeProps={{
                  className: "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-teal/15 text-teal border-l-2 border-teal",
                }}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-sidebar-border p-4">
            {address ? (
              <div className="space-y-2">
                <p className="text-xs text-sidebar-foreground/60">Wallet</p>
                <p className="font-mono text-sm text-white">{truncateAddress(address)}</p>
                <button
                  onClick={disconnect}
                  className="inline-flex items-center gap-1 text-xs text-sidebar-foreground/70 hover:text-white"
                >
                  <LogOut className="h-3 w-3" /> Disconnect
                </button>
              </div>
            ) : (
              <WalletButton />
            )}
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="hidden h-16 items-center justify-end gap-3 border-b border-border bg-background/70 px-6 backdrop-blur md:flex">
            <ThemeToggle />
            <WalletButton />
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
