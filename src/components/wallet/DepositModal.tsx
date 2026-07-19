import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateDepositAddress, useApp } from "@/lib/app-context";
import { vaults } from "@/lib/vaults";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Loader2, CreditCard, Wallet, QrCode, RefreshCw } from "lucide-react";
import { useTokenBalances, type BalanceAsset } from "@/lib/token-balances";

const ASSETS = ["USDC", "ETH", "DAI", "USDT", "WBTC"] as const;
type Asset = (typeof ASSETS)[number];

export function DepositModal() {
  const { depositOpen, setDepositOpen, depositVaultId, address, setModalOpen, deposit } = useApp();
  const { balances, isLoading: balLoading, refetch: refetchBalances } = useTokenBalances();

  // Default asset from selected vault, if any
  const defaultAsset = useMemo<Asset>(() => {
    const v = vaults.find((x) => x.id === depositVaultId);
    const a = (v?.asset as Asset) ?? "USDC";
    return (ASSETS as readonly string[]).includes(a) ? a : "USDC";
  }, [depositVaultId]);

  const [asset, setAsset] = useState<Asset>(defaultAsset);
  const [tab, setTab] = useState<"wallet" | "address" | "card">("wallet");

  // wallet tab
  const [amount, setAmount] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);

  // address tab
  const [depAddr, setDepAddr] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [txInput, setTxInput] = useState("");
  const [checking, setChecking] = useState(false);

  // card tab
  const [usd, setUsd] = useState("");
  const [cardLoading, setCardLoading] = useState(false);
  const [cardSuccess, setCardSuccess] = useState(false);

  useEffect(() => {
    if (depositOpen) {
      setAsset(defaultAsset);
      setTab("wallet");
      setAmount("");
      setDepAddr(null);
      setTxInput("");
      setUsd("");
      setCardSuccess(false);
    }
  }, [depositOpen, defaultAsset]);

  function requireWallet() {
    if (!address) {
      setDepositOpen(false);
      setModalOpen(true);
      toast.info("Connect a wallet first");
      return false;
    }
    return true;
  }

  function targetVaultId() {
    return depositVaultId ?? vaults.find((v) => v.asset === asset)?.id ?? vaults[0].id;
  }

  const currentBal = balances[asset as BalanceAsset];
  const balanceFormatted = currentBal ? parseFloat(currentBal.formatted) : 0;

  async function handleWalletDeposit() {
    if (!requireWallet()) return;
    const n = parseFloat(amount);
    if (!n || n <= 0) return toast.error("Enter an amount");
    if (n > balanceFormatted) return toast.error(`Insufficient ${asset} balance`);
    setWalletLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    deposit(targetVaultId(), n, "wallet", asset);
    setWalletLoading(false);
    toast.success(`Deposited ${n} ${asset}`);
    setDepositOpen(false);
  }

  async function handleGenerate() {
    if (!requireWallet()) return;
    setGenLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setDepAddr(generateDepositAddress());
    setGenLoading(false);
  }

  async function handleCheckDeposit() {
    if (!depAddr) return toast.error("Generate an address first");
    if (!txInput.trim()) return toast.error("Enter a transaction hash");
    setChecking(true);
    await new Promise((r) => setTimeout(r, 1400));
    const n = 100 + Math.floor(Math.random() * 900);
    deposit(targetVaultId(), n, "address", asset);
    setChecking(false);
    toast.success(`Confirmed deposit of ${n} ${asset}`);
    setDepositOpen(false);
  }

  async function handleCardBuy() {
    if (!requireWallet()) return;
    const n = parseFloat(usd);
    if (!n || n < 20) return toast.error("Minimum $20");
    setCardLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    const cryptoAmt = asset === "ETH" ? n / 3200 : asset === "WBTC" ? n / 68000 : n;
    deposit(targetVaultId(), cryptoAmt, "card", asset);
    setCardLoading(false);
    setCardSuccess(true);
    toast.success(`Purchased ${cryptoAmt.toFixed(4)} ${asset} via MoonPay`);
    setTimeout(() => setDepositOpen(false), 1600);
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  return (
    <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Asset</label>
          <Select value={asset} onValueChange={(v) => setAsset(v as Asset)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ASSETS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wallet" className="text-xs"><Wallet className="mr-1 h-3.5 w-3.5" /> Wallet</TabsTrigger>
            <TabsTrigger value="address" className="text-xs"><QrCode className="mr-1 h-3.5 w-3.5" /> Address</TabsTrigger>
            <TabsTrigger value="card" className="text-xs"><CreditCard className="mr-1 h-3.5 w-3.5" /> Card</TabsTrigger>
          </TabsList>

          {/* WALLET */}
          <TabsContent value="wallet" className="space-y-4 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Available on Arbitrum</span>
              <button
                onClick={() => refetchBalances()}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                title="Refresh balance"
              >
                <RefreshCw className={`h-3 w-3 ${balLoading ? "animate-spin" : ""}`} />
                {address
                  ? balLoading && !currentBal
                    ? "Loading…"
                    : `${balanceFormatted.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${asset}`
                  : "Connect wallet"}
              </button>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-0 bg-transparent p-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                />
                <button
                  onClick={() => setAmount(String(balanceFormatted))}
                  disabled={!address || balanceFormatted <= 0}
                  className="rounded-md bg-teal/10 px-2 py-1 text-xs font-semibold text-teal hover:bg-teal/20 disabled:opacity-50"
                >
                  MAX
                </button>
                <span className="rounded-md bg-muted px-2 py-1 text-sm font-medium">{asset}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Deposit directly from your connected wallet. Gas fee applies.</p>
            <Button onClick={handleWalletDeposit} disabled={walletLoading} className="w-full bg-teal text-teal-foreground hover:bg-teal/90">
              {walletLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</> : `Deposit ${asset}`}
            </Button>
          </TabsContent>


          {/* ADDRESS */}
          <TabsContent value="address" className="space-y-4 pt-4">
            {!depAddr ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Generate a unique {asset} deposit address. Send any amount from any wallet and it will be credited automatically.
                </p>
                <Button onClick={handleGenerate} disabled={genLoading} className="w-full bg-teal text-teal-foreground hover:bg-teal/90">
                  {genLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : `Generate ${asset} Deposit Address`}
                </Button>
              </>
            ) : (
              <>
                <div className="flex justify-center rounded-lg border border-border bg-white p-4">
                  <QRCodeSVG value={depAddr} size={168} bgColor="#ffffff" fgColor="#1F324A" />
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your {asset} Deposit Address</p>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 break-all font-mono text-xs">{depAddr}</code>
                    <button onClick={() => copy(depAddr)} className="rounded-md p-2 hover:bg-accent" aria-label="Copy">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum deposit: <span className="font-medium text-foreground">10 {asset}</span>. Only send {asset} on Arbitrum to this address.
                </p>
                <div className="space-y-2 border-t border-border pt-3">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Check Deposit Status</label>
                  <Input placeholder="0x… transaction hash" value={txInput} onChange={(e) => setTxInput(e.target.value)} />
                  <Button onClick={handleCheckDeposit} disabled={checking} variant="outline" className="w-full">
                    {checking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…</> : "Check Deposit"}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* CARD */}
          <TabsContent value="card" className="space-y-4 pt-4">
            {cardSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-teal/15 text-teal">
                  <Check className="h-7 w-7" />
                </div>
                <p className="text-lg font-semibold">Purchase Successful!</p>
                <p className="text-sm text-muted-foreground">Your {asset} has been deposited.</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-border bg-background p-3">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Amount (USD)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-semibold text-muted-foreground">$</span>
                    <Input
                      type="number"
                      placeholder="100"
                      value={usd}
                      onChange={(e) => setUsd(e.target.value)}
                      className="border-0 bg-transparent p-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  Powered by MoonPay. Fees ~4.5%. Supports Visa, Mastercard, Apple Pay & Google Pay.
                </div>
                <Button onClick={handleCardBuy} disabled={cardLoading} className="w-full bg-teal text-teal-foreground hover:bg-teal/90">
                  {cardLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting to MoonPay…</> : `Buy ${asset} with MoonPay`}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
