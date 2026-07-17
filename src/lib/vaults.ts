export type Risk = "Low Risk" | "Medium Risk" | "High Risk";

export type Vault = {
  id: string;
  name: string;
  asset: string;
  assetLabel: string;
  assetColor: string; // tailwind bg class
  apy: number;
  tvl: number;
  risk: Risk;
  category: "USDC" | "ETH" | "WBTC" | "Stablecoins" | "Other";
  description: string;
  protocols: string[];
  minDeposit: string;
};

export const vaults: Vault[] = [
  {
    id: "usdc-yield",
    name: "USDC Yield Vault",
    asset: "USDC",
    assetLabel: "USDC",
    assetColor: "bg-blue-500",
    apy: 18.4,
    tvl: 42_300_000,
    risk: "Low Risk",
    category: "USDC",
    description:
      "This vault deposits USDC into the top lending protocols including Aave, Compound, and Morpho. Rewards are harvested and auto-compounded daily. Strategy rebalances weekly to optimize for the highest risk-adjusted yield.",
    protocols: ["Aave v3", "Compound v3", "Morpho"],
    minDeposit: "10 USDC",
  },
  {
    id: "eth-staking",
    name: "ETH Staking Vault",
    asset: "ETH",
    assetLabel: "ETH",
    assetColor: "bg-purple-500",
    apy: 12.7,
    tvl: 38_100_000,
    risk: "Medium Risk",
    category: "ETH",
    description:
      "Deposits ETH across leading liquid staking and restaking protocols to capture staking rewards plus points programs, with automated compounding.",
    protocols: ["Lido", "EtherFi", "Eigenlayer"],
    minDeposit: "0.01 ETH",
  },
  {
    id: "btc-yield",
    name: "BTC Yield Vault",
    asset: "WBTC",
    assetLabel: "BTC",
    assetColor: "bg-orange-500",
    apy: 9.2,
    tvl: 21_700_000,
    risk: "Medium Risk",
    category: "WBTC",
    description:
      "WBTC deposits routed to blue-chip money markets to earn borrowing demand yield, with automated rebalancing.",
    protocols: ["Aave v3", "Morpho"],
    minDeposit: "0.001 WBTC",
  },
  {
    id: "usdt-yield",
    name: "USDT Yield Vault",
    asset: "USDT",
    assetLabel: "USDT",
    assetColor: "bg-emerald-500",
    apy: 17.1,
    tvl: 33_500_000,
    risk: "Low Risk",
    category: "Stablecoins",
    description:
      "USDT deployed to the highest-yielding stablecoin strategies across lending markets.",
    protocols: ["Aave v3", "Compound v3"],
    minDeposit: "10 USDT",
  },
  {
    id: "dai-savings",
    name: "DAI Savings Vault",
    asset: "DAI",
    assetLabel: "DAI",
    assetColor: "bg-yellow-500",
    apy: 16.8,
    tvl: 19_200_000,
    risk: "Low Risk",
    category: "Stablecoins",
    description:
      "DAI is deposited into Maker DSR and complementary lending markets, auto-compounded daily.",
    protocols: ["DSR", "Spark", "Aave v3"],
    minDeposit: "10 DAI",
  },
  {
    id: "weth-optimizer",
    name: "WETH Optimizer",
    asset: "WETH",
    assetLabel: "wETH",
    assetColor: "bg-purple-500",
    apy: 13.5,
    tvl: 15_800_000,
    risk: "Medium Risk",
    category: "ETH",
    description:
      "WETH strategy optimizing between LST yield and lending market spread.",
    protocols: ["Aave v3", "Morpho", "Pendle"],
    minDeposit: "0.01 WETH",
  },
  {
    id: "curve-lp",
    name: "Curve LP Yield",
    asset: "LP",
    assetLabel: "LP",
    assetColor: "bg-rose-500",
    apy: 22.1,
    tvl: 8_400_000,
    risk: "High Risk",
    category: "Other",
    description:
      "Provides liquidity to top Curve pools and boosts rewards via Convex, auto-compounding CRV and CVX rewards.",
    protocols: ["Curve", "Convex"],
    minDeposit: "50 USDC",
  },
  {
    id: "liquid-staking-eth",
    name: "Liquid Staking ETH",
    asset: "sETH",
    assetLabel: "sETH",
    assetColor: "bg-indigo-500",
    apy: 11.3,
    tvl: 56_200_000,
    risk: "Low Risk",
    category: "ETH",
    description:
      "Simple, low-risk exposure to ETH staking rewards via top liquid staking providers.",
    protocols: ["Lido", "Rocket Pool"],
    minDeposit: "0.01 ETH",
  },
];

export function findVault(id: string) {
  return vaults.find((v) => v.id === id);
}

export function formatCompactUSD(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}
