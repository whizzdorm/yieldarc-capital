import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { CONNECTOR_DISPLAY } from "@/lib/wagmi-config";

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
  wallet: string | null;
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

// Still used for fake tx hashes on the (still-simulated) deposit/withdraw
// bookkeeping below — unrelated to wallet *connection*, which is now real.
function randomHex(len: number) {
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < len; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}
function randomTxHash() {
  return "0x" + randomHex(64);
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Real wallet state now comes from wagmi, not from generated fake values.
  const { address: wagmiAddress, connector, isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const address = isConnected ? wagmiAddress ?? null : null;
  const wallet = isConnected && connector ? CONNECTOR_DISPLAY[connector.uid]?.name ?? connector.name : null;

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
    setHydrated(true);
  }, []);

  // Load this address's positions/transactions whenever the connected
  // wallet changes (including on reconnect after a page refresh).
  useEffect(() => {
    if (!address) {
      setPositions([]);
      setTransactions([]);
      return;
    }
    try {
      const posRaw = localStorage.getItem(`yieldarc-positions:${address}`);
      const txRaw = localStorage.getItem(`yieldarc-transactions:${address}`);
      setPositions(posRaw ? JSON.parse(posRaw) : []);
      setTransactions(txRaw ? JSON.parse(txRaw) : []);
    } catch {
      setPositions([]);
      setTransactions([]);
    }
  }, [address]);

  useEffect(() => {
    if (modalOpen && isConnected) setModalOpen(false);
  }, [modalOpen, isConnected]);

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

  const disconnect = useCallback(() => {
    wagmiDisconnect();
  }, [wagmiDisconnect]);

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
      address, wallet, disconnect,
      modalOpen, setModalOpen,
      depositOpen, setDepositOpen, depositVaultId, openDeposit,
      theme, toggleTheme, positions, deposit, withdraw, transactions,
    }),
    [address, wallet, disconnect, modalOpen, depositOpen, depositVaultId, openDeposit,
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

// ⚠️ STILL SIMULATED — see chat: this generates a random string, not an
// address anyone controls. Do not let users send real funds to it.
export function generateDepositAddress() {
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 40; i++) s += hex[Math.floor(Math.random() * 16)];
  return "0x" + s;
}
