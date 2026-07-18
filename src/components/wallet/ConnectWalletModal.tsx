import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { CONNECTOR_DISPLAY } from "@/lib/wagmi-config";
import { useConnect } from "wagmi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ComponentType } from "react";
import type { IconComponentProps } from "@web3icons/react";
import WalletMetamask from "@web3icons/react/icons/wallets/WalletMetamask";
import WalletWalletConnect from "@web3icons/react/icons/wallets/WalletWalletConnect";
import WalletCoinbase from "@web3icons/react/icons/wallets/WalletCoinbase";
import WalletRabby from "@web3icons/react/icons/wallets/WalletRabby";
import WalletTrust from "@web3icons/react/icons/wallets/WalletTrust";
import WalletRainbow from "@web3icons/react/icons/wallets/WalletRainbow";
import WalletLedger from "@web3icons/react/icons/wallets/WalletLedger";
import WalletOkx from "@web3icons/react/icons/wallets/WalletOkx";
import WalletPhantom from "@web3icons/react/icons/wallets/WalletPhantom";

// Real, official wallet logos (MIT-licensed @web3icons/react), keyed by the
// same iconId set in wagmi-config.ts's CONNECTOR_DISPLAY map.
const WALLET_ICONS: Record<string, ComponentType<IconComponentProps>> = {
  metamask: WalletMetamask,
  walletconnect: WalletWalletConnect,
  coinbase: WalletCoinbase,
  rabby: WalletRabby,
  trust: WalletTrust,
  rainbow: WalletRainbow,
  ledger: WalletLedger,
  okx: WalletOkx,
  phantom: WalletPhantom,
};

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
            const meta = CONNECTOR_DISPLAY[c.uid] ?? { name: c.name, color: "bg-muted", iconId: "" };
            const Icon = WALLET_ICONS[meta.iconId];
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
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg p-1.5 ${meta.color}`}>
                  {isConnectingThis ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : Icon ? (
                    <Icon variant="branded" size={28} />
                  ) : null}
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
