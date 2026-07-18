import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { arbitrum, mainnet } from "wagmi/chains";
import { injected, metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors";

// Get a free project ID at https://cloud.walletconnect.com and set it as
// VITE_WALLETCONNECT_PROJECT_ID in a .env file. Required for both the
// WalletConnect button and the Ledger Live button below (Ledger Live has
// no browser-extension provider, so it connects over WalletConnect too).
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

if (!projectId && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.warn(
    "[wagmi] VITE_WALLETCONNECT_PROJECT_ID is not set. WalletConnect and Ledger Live will not work until it is.",
  );
}

// Named instances (not inline) so each can carry its own label in the UI —
// this matters because WalletConnect is used twice: once for itself, once
// to drive the Ledger Live button.
export const metaMaskConnector = metaMask();
export const coinbaseConnector = coinbaseWallet({ appName: "YieldArc" });
export const walletConnectConnector = walletConnect({ projectId: projectId ?? "", showQrModal: true });
export const ledgerLiveConnector = walletConnect({ projectId: projectId ?? "", showQrModal: true });

// Rabby, Trust Wallet, Rainbow, OKX Wallet, and Phantom (EVM mode) don't
// ship official wagmi connectors. They all work by injecting an EIP-1193
// provider into the page, so `injected()` targeting each one is the real
// connection mechanism — not a stand-in. If a button stops detecting its
// wallet after an extension update, check the provider's current injection
// point and adjust `target` below.
export const rabbyConnector = injected({ target: "rabby" });
export const trustConnector = injected({ target: "trust" });
export const rainbowConnector = injected({ target: "rainbow" });
export const okxConnector = injected({
  target: () => ({
    id: "okxWallet",
    name: "OKX Wallet",
    provider: typeof window !== "undefined" ? (window as any).okxwallet : undefined,
  }),
});
export const phantomConnector = injected({
  target: () => ({
    id: "phantom",
    name: "Phantom",
    // Phantom's EVM provider lives at window.phantom.ethereum
    // (window.phantom.solana is the separate Solana provider).
    provider: typeof window !== "undefined" ? (window as any).phantom?.ethereum : undefined,
  }),
});

// Maps each connector's unique instance id -> the exact label/icon your
// ConnectWalletModal already used, so the visual design doesn't change.
export const CONNECTOR_DISPLAY: Record<string, { name: string; color: string; icon: string }> = {
  [metaMaskConnector.uid]: { name: "MetaMask", color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300", icon: "🦊" },
  [walletConnectConnector.uid]: { name: "WalletConnect", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300", icon: "🔵" },
  [coinbaseConnector.uid]: { name: "Coinbase Wallet", color: "bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300", icon: "🔷" },
  [rabbyConnector.uid]: { name: "Rabby Wallet", color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300", icon: "🟣" },
  [trustConnector.uid]: { name: "Trust Wallet", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", icon: "🟠" },
  [rainbowConnector.uid]: { name: "Rainbow", color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-300", icon: "🌈" },
  [ledgerLiveConnector.uid]: { name: "Ledger Live", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300", icon: "🟢" },
  [okxConnector.uid]: { name: "OKX Wallet", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200", icon: "⚫" },
  [phantomConnector.uid]: { name: "Phantom", color: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300", icon: "👻" },
};

export const wagmiConfig = createConfig({
  // Arbitrum first since that's what your deposit-address copy already
  // tells users to use; mainnet included only so ENS names can resolve.
  chains: [arbitrum, mainnet],
  connectors: [
    metaMaskConnector,
    walletConnectConnector,
    coinbaseConnector,
    rabbyConnector,
    trustConnector,
    rainbowConnector,
    ledgerLiveConnector,
    okxConnector,
    phantomConnector,
  ],
  // TanStack Start renders on the server first; ssr + cookieStorage avoids
  // a hydration mismatch between the server's "always disconnected" render
  // and the client's real wallet state.
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
