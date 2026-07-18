import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";

const wallets = [
  { name: "MetaMask", color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300", icon: "🦊" },
  { name: "WalletConnect", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300", icon: "🔵" },
  { name: "Coinbase Wallet", color: "bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300", icon: "🔷" },
  { name: "Rabby Wallet", color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300", icon: "🟣" },
  { name: "Trust Wallet", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", icon: "🟠" },
  { name: "Rainbow", color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-300", icon: "🌈" },
  { name: "Ledger Live", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300", icon: "🟢" },
  { name: "OKX Wallet", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200", icon: "⚫" },
  { name: "Phantom", color: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300", icon: "👻" },
] as const;

export function ConnectWalletModal() {
  const { modalOpen, setModalOpen, connect } = useApp();

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Connect Your Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to get started</DialogDescription>
        </DialogHeader>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {wallets.map((w) => (
            <button
              key={w.name}
              onClick={() => {
                connect(w.name);
                toast.success(`Connected with ${w.name}`);
              }}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 text-left transition hover:border-teal hover:bg-accent"
            >
              <span className={`grid h-10 w-10 place-items-center rounded-lg text-xl ${w.color}`}>{w.icon}</span>
              <span className="font-medium">{w.name}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          By connecting, you agree to the Terms of Service
        </p>
      </DialogContent>
    </Dialog>
  );
}
