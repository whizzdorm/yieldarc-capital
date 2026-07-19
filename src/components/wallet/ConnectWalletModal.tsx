import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { CONNECTOR_DISPLAY, CONNECTOR_ORDER, WALLET_INSTALL_URL, isInjectedInstalled } from "@/lib/wagmi-config";
import { useConnect } from "wagmi";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";
import { useMemo } from "react";
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

  // The wagmi connectors array only contains one WalletConnect entry, but we
  // want a distinct "Ledger Live" row that also uses it. Build the display
  // list ourselves and preserve a stable ordering.
  const items = useMemo(() => {
    const byId = new Map<string, (typeof connectors)[number]>();
    for (const c of connectors) byId.set(c.id, c);
    const wc = byId.get("walletConnect");
    const list = CONNECTOR_ORDER.map((id) => {
      if (id === "ledgerLive") return wc ? { displayId: "ledgerLive", connector: wc } : null;
      const c = byId.get(id);
      return c ? { displayId: id, connector: c } : null;
    }).filter(Boolean) as { displayId: string; connector: (typeof connectors)[number] }[];
    return list;
  }, [connectors]);

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Connect Your Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to get started</DialogDescription>
        </DialogHeader>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map(({ displayId, connector: c }) => {
            const meta = CONNECTOR_DISPLAY[displayId] ?? { name: c.name, color: "bg-muted", iconId: "" };
            const Icon = WALLET_ICONS[meta.iconId];
            const isConnectingThis =
              isPending && variables?.connector && "id" in variables.connector && variables.connector.id === c.id;

            // If this is an injected wallet whose extension isn't detected,
            // convert the button into an "Install X" link — better UX than
            // wagmi's raw "provider is undefined" toast.
            const installUrl = WALLET_INSTALL_URL[displayId];
            const notInstalled = !!installUrl && !isInjectedInstalled(displayId);

            const handleClick = () => {
              if (notInstalled) {
                window.open(installUrl, "_blank", "noopener,noreferrer");
                toast.info(`Install ${meta.name}, then refresh and try again`);
                return;
              }
              connect(
                { connector: c },
                {
                  onError: (err: Error) => {
                    const msg = err?.message?.trim();
                    toast.error(msg && msg !== "undefined" ? msg : `Couldn't connect ${meta.name}`);
                  },
                  onSuccess: () => toast.success(`Connected with ${meta.name}`),
                },
              );
            };

            return (
              <button
                key={displayId}
                disabled={isPending}
                onClick={handleClick}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 text-left transition hover:border-teal hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg p-1.5 ${meta.color}`}>
                  {isConnectingThis ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : Icon ? (
                    <Icon variant="branded" size={28} />
                  ) : null}
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="font-medium leading-tight">
                    {isConnectingThis ? "Confirm in wallet…" : meta.name}
                  </span>
                  {notInstalled && (
                    <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      Not installed <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {error && (
          <p className="mt-2 text-center text-xs text-destructive">
            {error.message && error.message !== "undefined" ? error.message : "Connection failed"}
          </p>
        )}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          By connecting, you agree to the Terms of Service
        </p>
      </DialogContent>
    </Dialog>
  );
}
