import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { formatUSD, useApp } from "@/lib/app-context";
import { findVault } from "@/lib/vaults";

export const Route = createFileRoute("/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — YieldArc" }, { name: "description", content: "Your active YieldArc positions." }] }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { positions } = useApp();
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold sm:text-3xl">Portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">All of your active positions across YieldArc vaults.</p>

        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
          {positions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
              <p className="text-muted-foreground">You don't have any positions yet.</p>
              <Button asChild className="mt-4 bg-teal text-teal-foreground hover:bg-teal/90">
                <Link to="/vaults">Browse Vaults</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="pb-2">Vault</th><th className="pb-2">Deposited</th><th className="pb-2">APY</th><th className="pb-2">Yield</th><th className="pb-2"></th></tr>
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
      </div>
    </AppShell>
  );
}
