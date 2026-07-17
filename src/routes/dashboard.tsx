import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { formatUSD, useApp } from "@/lib/app-context";
import { findVault } from "@/lib/vaults";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — YieldArc" },
      { name: "description", content: "Track your deposits, yield, and portfolio activity on YieldArc." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { positions } = useApp();
  const totalDeposited = positions.reduce((a, p) => a + p.deposited, 0);
  const totalYield = positions.reduce((a, p) => a + p.yieldEarned, 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your positions and activity across YieldArc.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Total Deposited" value={formatUSD(totalDeposited)} />
          <StatCard label="Total Yield Earned" value={formatUSD(totalYield)} accent />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Portfolio</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/vaults">Browse Vaults <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          {positions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">No deposits yet. Browse vaults to get started.</p>
              <Button asChild className="mt-4 bg-teal text-teal-foreground hover:bg-teal/90">
                <Link to="/vaults">Browse Vaults</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="pb-2">Asset</th><th className="pb-2">Deposited</th><th className="pb-2">APY</th><th className="pb-2">Yield Earned</th><th className="pb-2 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {positions.map((p) => {
                    const v = findVault(p.vaultId);
                    if (!v) return null;
                    return (
                      <tr key={p.vaultId}>
                        <td className="py-3 font-medium">{v.name}</td>
                        <td className="py-3">{formatUSD(p.deposited)}</td>
                        <td className="py-3 text-teal">{v.apy}%</td>
                        <td className="py-3">{formatUSD(p.yieldEarned)}</td>
                        <td className="py-3 text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link to="/vault/$id" params={{ id: v.id }}>Manage</Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold">Recent Transactions</h2>
            <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
              No recent transactions
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold">Yield Overview</h2>
            <div className="flex h-48 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
              <TrendingUp className="mr-2 h-4 w-4" /> Yield Chart Loading...
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ? "text-teal" : ""}`}>{value}</p>
    </div>
  );
}
