import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type WalletKind =
  | "MetaMask"
  | "WalletConnect"
  | "Coinbase Wallet"
  | "Rabby Wallet"
  | "Trust Wallet"
  | "Rainbow"
  | "Ledger Live"
  | "OKX Wallet"
  | "Phantom";

type Position = { vaultId: string; deposited: number; yieldEarned: number };

export type TxRecord = {
  id: string;
  type: "deposit" | "withdraw";
  method: "wallet" | "address" | "card";
  asset: string;
  amount: number;
  vaultId?: string;
  txHash: string;
  status: "pending" | "confirmed" | "failed";
  createdAt: number;
};

type AppState = {
  address: string | null;
  wallet: WalletKind | null;
  connect: (w: WalletKind) => void;
  disconnect: () => void;
  modalOpen: boolean;
  setModalOpen: (v: boolean) => void;
  depositOpen: boolean;
  setDepositOpen: (v: boolean) => void;
  depositVaultId: string | null;
  openDeposit: (vaultId?: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  positions: Position[];
  deposit: (vaultId: string, amount: number, method: TxRecord["method"], asset: string) => TxRecord;
  withdraw: (vaultId: string) => void;
  transactions: TxRecord[];
};

const AppCtx = createContext<AppState | null>(null);

function randomHex(len: number) {
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < len; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}
function randomAddress() {
  return "0x" + randomHex(40);
}
function randomTxHash() {
  return "0x" + randomHex(64);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletKind | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositVaultId, setDepositVaultId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<TxRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("yieldarc-theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");

    try {
      const session = localStorage.getItem("yieldarc-session");
      if (session) {
        const { address: a, wallet: w } = JSON.parse(session) as { address: string; wallet: WalletKind };
        if (a) {
          setAddress(a);
          setWallet(w);
          const posRaw = localStorage.getItem(`yieldarc-positions:${a}`);
          const txRaw = localStorage.getItem(`yieldarc-transactions:${a}`);
          if (posRaw) setPositions(JSON.parse(posRaw));
          if (txRaw) setTransactions(JSON.parse(txRaw));
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("yieldarc-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!hydrated) return;
    if (address) {
      localStorage.setItem(`yieldarc-positions:${address}`, JSON.stringify(positions));
    }
  }, [hydrated, address, positions]);

  useEffect(() => {
    if (!hydrated) return;
    if (address) {
      localStorage.setItem(`yieldarc-transactions:${address}`, JSON.stringify(transactions));
    }
  }, [hydrated, address, transactions]);

  const connect = useCallback((w: WalletKind) => {
    const a = randomAddress();
    setWallet(w);
    setAddress(a);
    setModalOpen(false);
    try {
      localStorage.setItem("yieldarc-session", JSON.stringify({ address: a, wallet: w }));
      const posRaw = localStorage.getItem(`yieldarc-positions:${a}`);
      const txRaw = localStorage.getItem(`yieldarc-transactions:${a}`);
      setPositions(posRaw ? JSON.parse(posRaw) : []);
      setTransactions(txRaw ? JSON.parse(txRaw) : []);
    } catch {}
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setAddress(null);
    setPositions([]);
    setTransactions([]);
    try { localStorage.removeItem("yieldarc-session"); } catch {}
  }, []);

  const openDeposit = useCallback((vaultId?: string) => {
    setDepositVaultId(vaultId ?? null);
    setDepositOpen(true);
  }, []);

  const deposit = useCallback(
    (vaultId: string, amount: number, method: TxRecord["method"], asset: string) => {
      setPositions((prev) => {
        const existing = prev.find((p) => p.vaultId === vaultId);
        if (existing) {
          return prev.map((p) =>
            p.vaultId === vaultId ? { ...p, deposited: p.deposited + amount } : p,
          );
        }
        return [...prev, { vaultId, deposited: amount, yieldEarned: 0 }];
      });
      const tx: TxRecord = {
        id: crypto.randomUUID(),
        type: "deposit",
        method,
        asset,
        amount,
        vaultId,
        txHash: randomTxHash(),
        status: "confirmed",
        createdAt: Date.now(),
      };
      setTransactions((prev) => [tx, ...prev]);
      return tx;
    },
    [],
  );

  const withdraw = useCallback((vaultId: string) => {
    setPositions((prev) => prev.filter((p) => p.vaultId !== vaultId));
    setTransactions((prev) => [
      {
        id: crypto.randomUUID(),
        type: "withdraw",
        method: "wallet",
        asset: "",
        amount: 0,
        vaultId,
        txHash: randomTxHash(),
        status: "confirmed",
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo<AppState>(
    () => ({
      address, wallet, connect, disconnect,
      modalOpen, setModalOpen,
      depositOpen, setDepositOpen, depositVaultId, openDeposit,
      theme, toggleTheme, positions, deposit, withdraw, transactions,
    }),
    [address, wallet, connect, disconnect, modalOpen, depositOpen, depositVaultId, openDeposit,
     theme, toggleTheme, positions, deposit, withdraw, transactions],
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

export function generateDepositAddress() {
  return randomAddress();
}
