import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";

const wallets = [
  { name: "MetaMask", color: "bg-orange-100 text-orange-600", icon: "🦊" },
  { name: "WalletConnect", color: "bg-blue-100 text-blue-600", icon: "🔗" },
  { name: "Coinbase Wallet", color: "bg-sky-100 text-sky-600", icon: "🪙" },
  { name: "Rabby Wallet", color: "bg-purple-100 text-purple-600", icon: "🐰" },
] as const;

export function ConnectWalletModal() {
  const { modalOpen, setModalOpen, connect } = useApp();

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Connect Your Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to get started</DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-2">
          {wallets.map((w) => (
            <button
              key={w.name}
              onClick={() => {
                connect(w.name);
                toast.success(`Connected with ${w.name}`);
              }}
              className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 text-left transition hover:border-teal hover:bg-accent"
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
