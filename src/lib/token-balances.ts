import { arbitrum } from "wagmi/chains";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import { erc20Abi, formatUnits, type Address } from "viem";

// Canonical Arbitrum One token addresses.
export const ARBITRUM_TOKENS = {
  USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address, // native USDC (Circle)
  DAI:  "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1" as Address,
  USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" as Address,
  WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f" as Address,
} as const;

export type BalanceAsset = "ETH" | keyof typeof ARBITRUM_TOKENS;

export function useTokenBalances() {
  const { address, isConnected } = useAccount();

  const ethQ = useBalance({
    address,
    chainId: arbitrum.id,
    query: { enabled: isConnected && !!address },
  });

  const tokenAddrs = Object.values(ARBITRUM_TOKENS);
  const contracts = tokenAddrs.flatMap((token) => [
    { address: token, abi: erc20Abi, functionName: "balanceOf", args: [address as Address], chainId: arbitrum.id } as const,
    { address: token, abi: erc20Abi, functionName: "decimals", chainId: arbitrum.id } as const,
  ]);

  const tokQ = useReadContracts({
    contracts,
    allowFailure: true,
    query: { enabled: isConnected && !!address },
  });

  const balances: Record<BalanceAsset, { formatted: string; value: bigint; decimals: number } | null> = {
    ETH: ethQ.data
      ? { formatted: ethQ.data.formatted, value: ethQ.data.value, decimals: ethQ.data.decimals }
      : null,
    USDC: null, DAI: null, USDT: null, WBTC: null,
  };

  const keys = Object.keys(ARBITRUM_TOKENS) as (keyof typeof ARBITRUM_TOKENS)[];
  keys.forEach((k, i) => {
    const bal = tokQ.data?.[i * 2];
    const dec = tokQ.data?.[i * 2 + 1];
    if (bal?.status === "success" && dec?.status === "success") {
      const value = bal.result as bigint;
      const decimals = Number(dec.result);
      balances[k] = { value, decimals, formatted: formatUnits(value, decimals) };
    }
  });

  return {
    balances,
    isLoading: ethQ.isLoading || tokQ.isLoading,
    refetch: () => {
      ethQ.refetch();
      tokQ.refetch();
    },
  };
}
