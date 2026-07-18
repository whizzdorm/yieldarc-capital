import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { CONNECTOR_DISPLAY } from "@/lib/wagmi-config";
import { useConnect } from "wagmi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ConnectWalletModal() {
  const { modalOpen, setModalOpen } = useApp();
  const { connect, connectors, isPending, variables, error } = useConnect();

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Connect Your Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to get started</DialogDescription>
        </DialogHeader>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {connectors.map((c) => {
            const meta = CONNECTOR_DISPLAY[c.uid] ?? {
              name: c.name,
              color: "bg-muted text-foreground",
              icon: "💠",
            };
            const isConnectingThis = isPending && variables?.connector?.uid === c.uid;

            return (
              <button
                key={c.uid}
                disabled={isPending}
                onClick={() => {
                  connect(
                    { connector: c },
                    {
                      onError: (err) => {
                        toast.error(err.message || `Couldn't connect ${meta.name}`);
                      },
                      onSuccess: () => {
                        toast.success(`Connected with ${meta.name}`);
                      },
                    },
                  );
                }}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 text-left transition hover:border-teal hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xl ${meta.color}`}>
                  {isConnectingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : meta.icon}
                </span>
                <span className="font-medium">
                  {isConnectingThis ? "Confirm in wallet…" : meta.name}
                </span>
              </button>
            );
          })}
        </div>
        {error && (
          <p className="mt-2 text-center text-xs text-destructive">{error.message}</p>
        )}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          By connecting, you agree to the Terms of Service
        </p>
      </DialogContent>
    </Dialog>
  );
}
