import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { findVault, formatCompactUSD } from "@/lib/vaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatUSD, useApp } from "@/lib/app-context";

export const Route = createFileRoute("/vault/$id")({
  loader: ({ params }) => {
    const v = findVault(params.id);
    if (!v) throw notFound();
    return { vaultId: v.id };
  },
  head: ({ loaderData }) => {
    const v = loaderData ? findVault(loaderData.vaultId) : undefined;
    return {
      meta: [
        { title: v ? `${v.name} — YieldArc` : "Vault — YieldArc" },
        { name: "description", content: v ? `Deposit ${v.asset} in ${v.name} and earn ${v.apy}% APY, auto-compounded.` : "YieldArc vault." },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Vault not found</h1>
        <Button asChild className="mt-6"><Link to="/vaults">Back to Vaults</Link></Button>
      </div>
    </PublicLayout>
  ),
  component: VaultDetail,
});

function VaultDetail() {
  const { id } = useParams({ from: "/vault/$id" });
  const v = findVault(id)!;
  const { address, setModalOpen, positions, deposit, withdraw, openDeposit } = useApp();
  const pos = positions.find((p) => p.vaultId === v.id);
  const [amount, setAmount] = useState("");
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [depositing, setDepositing] = useState(false);

  const numeric = parseFloat(amount || "0") || 0;

  function handleApprove() {
    if (!address) return setModalOpen(true);
    setApproving(true);
    toast.info(`Approval transaction sent. Please confirm in your wallet.`);
    setTimeout(() => {
      setApproving(false);
      setApproved(true);
      toast.success(`${v.asset} approved`);
    }, 1200);
  }

  function handleDeposit() {
    if (!address) return setModalOpen(true);
    if (numeric <= 0) return toast.error("Enter an amount");
    setDepositing(true);
    toast.info("Deposit transaction sent. Please confirm in your wallet.");
    setTimeout(() => {
      deposit(v.id, numeric, "wallet", v.asset);
      setDepositing(false);
      setAmount("");
      setApproved(false);
      toast.success(`Deposited ${numeric} ${v.asset} into ${v.name}`);
    }, 1500);
  }

  function handleWithdraw() {
    if (!pos) return;
    toast.info("Withdrawal transaction sent. Please confirm in your wallet.");
    setTimeout(() => {
      withdraw(v.id);
      toast.success("Withdrawal complete");
    }, 1200);
  }

  const riskColor =
    v.risk === "Low Risk" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
    v.risk === "Medium Risk" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
    "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300";

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/vaults" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Vaults
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className={`grid h-14 w-14 place-items-center rounded-full ${v.assetColor} text-sm font-bold text-white shadow`}>
                {v.assetLabel}
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">{v.name}</h1>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${riskColor}`}>{v.risk}</span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">APY</p>
                <p className="mt-1 text-4xl font-extrabold text-teal">{v.apy.toFixed(1)}%</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Value Locked</p>
                <p className="mt-1 text-4xl font-extrabold">{formatCompactUSD(v.tvl)}</p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold">Strategy</h2>
              <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Row k="Protocols" v={v.protocols.join(", ")} />
                <Row k="Fee" v="0.5% performance fee" />
                <Row k="Min Deposit" v={v.minDeposit} />
                <Row k="Withdrawals" v="Any time, no fee" />
              </dl>
            </div>

            <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold">Your Position</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div><p className="text-xs text-muted-foreground">Deposited</p><p className="mt-1 text-2xl font-bold">{formatUSD(pos?.deposited ?? 0)}</p></div>
                <div><p className="text-xs text-muted-foreground">Current Yield</p><p className="mt-1 text-2xl font-bold text-teal">{formatUSD(pos?.yieldEarned ?? 0)}</p></div>
                <div className="flex items-end justify-start sm:justify-end">
                  <Button variant="outline" disabled={!pos} onClick={handleWithdraw}>Withdraw</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Deposit card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold">Deposit</h2>
              <div className="mt-4 rounded-lg border border-border bg-background p-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-0 bg-transparent p-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                  />
                  <button
                    onClick={() => setAmount("1000")}
                    className="rounded-md bg-teal/10 px-2 py-1 text-xs font-semibold text-teal hover:bg-teal/20"
                  >
                    MAX
                  </button>
                  <Select defaultValue={v.asset}>
                    <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={v.asset}>{v.asset}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                You will receive: <span className="font-mono text-foreground">{numeric.toFixed(4)} y{v.asset}</span>
              </p>

              <Button
                onClick={handleApprove}
                disabled={approved || approving}
                className="mt-4 w-full bg-teal text-teal-foreground hover:bg-teal/90"
              >
                {approving ? "Approving..." : approved ? `${v.asset} Approved ✓` : `Approve ${v.asset}`}
              </Button>
              {!approved ? (
                <p className="mt-2 text-[11px] text-muted-foreground">You must approve before depositing</p>
              ) : null}

              <Button
                onClick={handleDeposit}
                disabled={!approved || depositing}
                className="mt-3 w-full"
                variant={approved ? "default" : "secondary"}
              >
                {depositing ? "Depositing..." : "Deposit"}
              </Button>
              <p className="mt-3 text-[11px] text-muted-foreground">Withdraw anytime. No lock-up period.</p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}
