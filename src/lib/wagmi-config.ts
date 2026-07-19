import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { arbitrum, mainnet } from "wagmi/chains";
import { injected, metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors";

// Get a free project ID at https://cloud.walletconnect.com and set it as
// VITE_WALLETCONNECT_PROJECT_ID in a .env file. Required for both the
// WalletConnect button and the Ledger Live button (Ledger Live has no
// browser-extension provider, so it connects over WalletConnect too).
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

if (!projectId && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.warn(
    "[wagmi] VITE_WALLETCONNECT_PROJECT_ID is not set. WalletConnect and Ledger Live will not work until it is.",
  );
}

// Display metadata is keyed by connector.id (resolved at runtime by wagmi).
// The ledger entry re-uses walletConnect (same id) — the Connect modal shows
// it as a distinct row and connecting still opens the WC QR, which Ledger
// Live scans natively.
export const CONNECTOR_DISPLAY: Record<string, { name: string; color: string; iconId: string }> = {
  metaMaskSDK: { name: "MetaMask", color: "bg-orange-100 dark:bg-orange-950", iconId: "metamask" },
  metaMask:    { name: "MetaMask", color: "bg-orange-100 dark:bg-orange-950", iconId: "metamask" },
  walletConnect: { name: "WalletConnect", color: "bg-blue-100 dark:bg-blue-950", iconId: "walletconnect" },
  coinbaseWalletSDK: { name: "Coinbase Wallet", color: "bg-sky-100 dark:bg-sky-950", iconId: "coinbase" },
  coinbaseWallet:    { name: "Coinbase Wallet", color: "bg-sky-100 dark:bg-sky-950", iconId: "coinbase" },
  rabby:  { name: "Rabby Wallet", color: "bg-purple-100 dark:bg-purple-950", iconId: "rabby" },
  trust:  { name: "Trust Wallet", color: "bg-blue-100 dark:bg-blue-950",    iconId: "trust" },
  rainbow:{ name: "Rainbow",      color: "bg-pink-100 dark:bg-pink-950",    iconId: "rainbow" },
  okxWallet: { name: "OKX Wallet", color: "bg-zinc-100 dark:bg-zinc-800",   iconId: "okx" },
  phantom:{ name: "Phantom",      color: "bg-violet-100 dark:bg-violet-950",iconId: "phantom" },
  // Ledger Live also connects via WalletConnect, but we surface a separate row
  // in the modal by matching a custom pseudo-id we set on the connector below.
  ledgerLive: { name: "Ledger Live", color: "bg-emerald-100 dark:bg-emerald-950", iconId: "ledger" },
};

export const wagmiConfig = createConfig({
  chains: [arbitrum, mainnet],
  connectors: [
    metaMask(),
    walletConnect({ projectId: projectId ?? "", showQrModal: true }),
    coinbaseWallet({ appName: "YieldArc" }),
    injected({ target: "rabby" }),
    injected({ target: "trust" }),
    injected({ target: "rainbow" }),
    injected({
      target: () => ({
        id: "okxWallet",
        name: "OKX Wallet",
        provider: typeof window !== "undefined" ? (window as any).okxwallet : undefined,
      }),
    }),
    injected({
      target: () => ({
        id: "phantom",
        name: "Phantom",
        // Phantom's EVM provider is window.phantom.ethereum
        // (window.phantom.solana is the separate Solana provider).
        provider: typeof window !== "undefined" ? (window as any).phantom?.ethereum : undefined,
      }),
    }),
  ],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [arbitrum.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
