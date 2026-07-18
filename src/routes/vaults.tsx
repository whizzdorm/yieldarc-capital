import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { vaults, formatCompactUSD, type Vault } from "@/lib/vaults";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { formatUSD, useApp } from "@/lib/app-context";

export const Route = createFileRoute("/vaults")({
  head: () => ({
    meta: [
      { title: "Vaults — YieldArc" },
      { name: "description", content: "Explore YieldArc vaults for USDC, ETH, WBTC, and stablecoins with auto-compounded yield." },
    ],
  }),
  component: VaultsPage,
});

const filters = ["All", "USDC", "ETH", "WBTC", "Stablecoins"] as const;
type Filter = (typeof filters)[number];
type Sort = "apy" | "tvl" | "new";

function VaultsPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<Sort>("apy");

  const list = useMemo(() => {
    let l = vaults.filter((v) => {
      if (filter === "All") return true;
      return v.category === filter;
    });
    if (sort === "apy") l = [...l].sort((a, b) => b.apy - a.apy);
    if (sort === "tvl") l = [...l].sort((a, b) => b.tvl - a.tvl);
    return l;
  }, [filter, sort]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Vaults</h1>
            <p className="mt-2 text-muted-foreground">Deposit assets and start earning yield.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Sort by</span>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="apy">Highest APY</SelectItem>
                <SelectItem value="tvl">Highest TVL</SelectItem>
                <SelectItem value="new">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === f
                  ? "bg-navy text-white dark:bg-teal dark:text-teal-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => <VaultCard key={v.id} v={v} />)}
        </div>
      </div>
    </PublicLayout>
  );
}

function VaultCard({ v }: { v: Vault }) {
  const { positions, openDeposit } = useApp();
  const pos = positions.find((p) => p.vaultId === v.id);
  const riskColor =
    v.risk === "Low Risk" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
    v.risk === "Medium Risk" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
    "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300";

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-card transition hover:border-teal/50 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`grid h-11 w-11 place-items-center rounded-full ${v.assetColor} text-xs font-bold text-white shadow`}>
            {v.assetLabel}
          </div>
          <div>
            <h3 className="font-semibold leading-tight">{v.name}</h3>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${riskColor}`}>{v.risk}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">APY</p>
          <p className="mt-1 text-2xl font-bold text-teal">{v.apy.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">TVL</p>
          <p className="mt-1 text-2xl font-bold">{formatCompactUSD(v.tvl)}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
        <span className="text-muted-foreground">Your Deposit</span>
        <span className="font-medium">{formatUSD(pos?.deposited ?? 0)}</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button onClick={() => openDeposit(v.id)} className="bg-teal text-teal-foreground hover:bg-teal/90">
          Deposit
        </Button>
        <Button asChild variant="outline">
          <Link to="/vault/$id" params={{ id: v.id }}>Details</Link>
        </Button>
      </div>
    </div>
  );
}

