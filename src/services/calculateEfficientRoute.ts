// src/services/calculateEfficientRoute.ts

import { fetchUserBalances } from "./fetchUserBalances";
import { fetchBridgeFees } from "./fetchBridgeFees";

interface Route {
  chain: string;
  amount: number;
  fee: number;
}

interface InsufficientBalanceResponse {
  error: string;
  currentBalance: number;
  requiredAmount: number;
}

export const calculateEfficientRoute = async (
  targetChain: string,
  amount: number,
  userAddress: string
): Promise<Route[] | InsufficientBalanceResponse> => {
  // Fetch user balances and bridge fees
  const balances = await fetchUserBalances(userAddress);
  const bridgeFees = await fetchBridgeFees();

  // Calculate the remaining amount needed on the target chain
  const currentBalance = balances[targetChain] || 0;
  const remainingAmount = amount - currentBalance;

  if (remainingAmount <= 0) {
    return []; // No bridging needed
  }

  // Check if there are enough funds across all chains
  const totalAvailableToBridge = Object.keys(balances)
    .filter(chain => chain !== targetChain)
    .reduce((sum, chain) => sum + balances[chain], 0);

  if (totalAvailableToBridge < remainingAmount) {
    return {
      error: "Insufficient balance to bridge the required amount.",
      currentBalance: totalAvailableToBridge,
      requiredAmount: remainingAmount
    };
  }

  // Sort chains by bridging fees to targetChain
  const routes = Object.keys(balances)
    .filter(chain => chain !== targetChain && balances[chain] > 0)
    .map(chain => ({
      chain,
      balance: balances[chain],
      fee: bridgeFees[`${chain}->${targetChain}`] || Infinity,
    }))
    .sort((a, b) => a.fee - b.fee);

  const selectedRoutes: Route[] = [];
  let totalBridged = 0;

  for (const route of routes) {
    if (totalBridged >= remainingAmount) break;

    const bridgeAmount = Math.min(route.balance, remainingAmount - totalBridged);
    totalBridged += bridgeAmount;

    selectedRoutes.push({
      chain: route.chain,
      amount: bridgeAmount,
      fee: route.fee
    });
  }

  return selectedRoutes;
};
