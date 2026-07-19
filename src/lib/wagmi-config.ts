import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { arbitrum, mainnet } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

// Get a free project ID at https://cloud.walletconnect.com and set it as
// VITE_WALLETCONNECT_PROJECT_ID in a .env file. Required for both the
// WalletConnect button and the Ledger Live button.
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

if (!projectId && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.warn(
    "[wagmi] VITE_WALLETCONNECT_PROJECT_ID is not set. WalletConnect and Ledger Live will not work until it is.",
  );
}

// Helpers to safely resolve each wallet's EIP-1193 provider from window.
// Returning undefined here just means "extension not installed" — the
// Connect modal converts that into a friendly "Install X" flow instead of
// throwing a raw "undefined" error at the user.
const win = () => (typeof window !== "undefined" ? (window as any) : undefined);

function findMetaMask(): any {
  const w = win(); if (!w) return undefined;
  const eth = w.ethereum;
  if (!eth) return undefined;
  if (eth.providers?.length) {
    return eth.providers.find((p: any) => p.isMetaMask && !p.isBraveWallet && !p.isRabby && !p.isTrust);
  }
  return eth.isMetaMask ? eth : undefined;
}
function findRabby(): any {
  const w = win(); if (!w) return undefined;
  if (w.rabby) return w.rabby;
  const eth = w.ethereum;
  if (eth?.providers?.length) return eth.providers.find((p: any) => p.isRabby);
  return eth?.isRabby ? eth : undefined;
}
function findTrust(): any {
  const w = win(); if (!w) return undefined;
  if (w.trustwallet) return w.trustwallet;
  const eth = w.ethereum;
  if (eth?.providers?.length) return eth.providers.find((p: any) => p.isTrust || p.isTrustWallet);
  return eth?.isTrust || eth?.isTrustWallet ? eth : undefined;
}
function findRainbow(): any {
  const w = win(); if (!w) return undefined;
  const eth = w.ethereum;
  if (eth?.providers?.length) return eth.providers.find((p: any) => p.isRainbow);
  return eth?.isRainbow ? eth : undefined;
}
function findOkx(): any {
  const w = win(); if (!w) return undefined;
  return w.okxwallet;
}
function findPhantom(): any {
  const w = win(); if (!w) return undefined;
  return w.phantom?.ethereum;
}

// Install pages surfaced when a given wallet's extension isn't detected.
export const WALLET_INSTALL_URL: Record<string, string> = {
  metaMask: "https://metamask.io/download/",
  rabby: "https://rabby.io/",
  trust: "https://trustwallet.com/browser-extension",
  rainbow: "https://rainbow.me/extension",
  okxWallet: "https://www.okx.com/web3",
  phantom: "https://phantom.app/download",
};

// Display metadata keyed by connector.id (wagmi runtime id).
export const CONNECTOR_DISPLAY: Record<string, { name: string; color: string; iconId: string }> = {
  metaMask:          { name: "MetaMask", color: "bg-orange-100 dark:bg-orange-950", iconId: "metamask" },
  walletConnect:     { name: "WalletConnect", color: "bg-blue-100 dark:bg-blue-950", iconId: "walletconnect" },
  ledgerLive:        { name: "Ledger Live", color: "bg-emerald-100 dark:bg-emerald-950", iconId: "ledger" },
  coinbaseWalletSDK: { name: "Coinbase Wallet", color: "bg-sky-100 dark:bg-sky-950", iconId: "coinbase" },
  coinbaseWallet:    { name: "Coinbase Wallet", color: "bg-sky-100 dark:bg-sky-950", iconId: "coinbase" },
  rabby:             { name: "Rabby Wallet", color: "bg-purple-100 dark:bg-purple-950", iconId: "rabby" },
  trust:             { name: "Trust Wallet", color: "bg-blue-100 dark:bg-blue-950", iconId: "trust" },
  rainbow:           { name: "Rainbow", color: "bg-pink-100 dark:bg-pink-950", iconId: "rainbow" },
  okxWallet:         { name: "OKX Wallet", color: "bg-zinc-100 dark:bg-zinc-800", iconId: "okx" },
  phantom:           { name: "Phantom", color: "bg-violet-100 dark:bg-violet-950", iconId: "phantom" },
};

// A fixed display order — wagmi's connectors array otherwise puts injected
// entries in registration order which can look random after dedupe.
export const CONNECTOR_ORDER = [
  "metaMask",
  "walletConnect",
  "coinbaseWalletSDK",
  "rabby",
  "trust",
  "rainbow",
  "ledgerLive",
  "okxWallet",
  "phantom",
];

const injectedTargets = [
  { id: "metaMask",  name: "MetaMask",     get: findMetaMask },
  { id: "rabby",     name: "Rabby Wallet", get: findRabby },
  { id: "trust",     name: "Trust Wallet", get: findTrust },
  { id: "rainbow",   name: "Rainbow",      get: findRainbow },
  { id: "okxWallet", name: "OKX Wallet",   get: findOkx },
  { id: "phantom",   name: "Phantom",      get: findPhantom },
];

const injectedConnectors = injectedTargets.map(({ id, name, get }) =>
  injected({
    // The target factory is called by wagmi each time it needs the provider;
    // returning provider: undefined is fine — the modal short-circuits and
    // routes the user to the install page instead of trying to connect.
    target: () => ({ id, name, provider: get() }),
  }),
);

export const wagmiConfig = createConfig({
  chains: [arbitrum, mainnet],
  connectors: [
    ...injectedConnectors,
    walletConnect({ projectId: projectId ?? "", showQrModal: true }),
    coinbaseWallet({ appName: "YieldArc" }),
  ],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [arbitrum.id]: http(),
    [mainnet.id]: http(),
  },
});

// Runtime check used by the Connect modal so we can offer "Install X" links
// instead of surfacing wagmi's raw "provider is undefined" errors.
export function isInjectedInstalled(connectorId: string): boolean {
  const t = injectedTargets.find((x) => x.id === connectorId);
  if (!t) return true; // WalletConnect / Coinbase SDK don't need an extension
  return !!t.get();
}

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
