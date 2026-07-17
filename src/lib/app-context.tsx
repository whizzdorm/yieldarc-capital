import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type WalletKind = "MetaMask" | "WalletConnect" | "Coinbase Wallet" | "Rabby Wallet";

type Position = { vaultId: string; deposited: number; yieldEarned: number };

type AppState = {
  address: string | null;
  wallet: WalletKind | null;
  connect: (w: WalletKind) => void;
  disconnect: () => void;
  modalOpen: boolean;
  setModalOpen: (v: boolean) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  positions: Position[];
  deposit: (vaultId: string, amount: number) => void;
  withdraw: (vaultId: string) => void;
};

const AppCtx = createContext<AppState | null>(null);

function randomAddress() {
  const hex = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 40; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletKind | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("yieldarc-theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("yieldarc-theme", theme);
  }, [theme]);

  const connect = useCallback((w: WalletKind) => {
    setWallet(w);
    setAddress(randomAddress());
    setModalOpen(false);
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setAddress(null);
    setPositions([]);
  }, []);

  const deposit = useCallback((vaultId: string, amount: number) => {
    setPositions((prev) => {
      const existing = prev.find((p) => p.vaultId === vaultId);
      if (existing) {
        return prev.map((p) =>
          p.vaultId === vaultId ? { ...p, deposited: p.deposited + amount } : p,
        );
      }
      return [...prev, { vaultId, deposited: amount, yieldEarned: 0 }];
    });
  }, []);

  const withdraw = useCallback((vaultId: string) => {
    setPositions((prev) => prev.filter((p) => p.vaultId !== vaultId));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo<AppState>(
    () => ({
      address, wallet, connect, disconnect, modalOpen, setModalOpen,
      theme, toggleTheme, positions, deposit, withdraw,
    }),
    [address, wallet, connect, disconnect, modalOpen, theme, toggleTheme, positions, deposit, withdraw],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function truncateAddress(a: string) {
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

export function formatUSD(n: number, decimals = 2) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
