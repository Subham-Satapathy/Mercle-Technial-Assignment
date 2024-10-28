// src/services/calculateEfficientRoute.ts

import { fetchUserBalances } from "./fetchUserBalances";
import { fetchFeesForAllChains } from "./fetchBridgeFees";

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
  targetChainId: string,
  amount: number,
  userAddress: string,
  tokenSymbol: string
): Promise<Route[] | InsufficientBalanceResponse> => {
  try {
    const balances = await fetchUserBalances(userAddress, tokenSymbol);

    const bridgeFees = await fetchFeesForAllChains(
      balances,
      targetChainId,
      amount,
      userAddress,
      tokenSymbol
    );

    // Calculate the remaining amount needed on the target chain
    const currentBalance = balances[targetChainId] || 0;
    const remainingAmount = amount - currentBalance;

    if (remainingAmount <= 0) {
      return []; // No bridging needed
    }

    // Check if there are enough funds across all chains
    const totalAvailableToBridge = Object.keys(balances)
      .filter((chain) => chain !== targetChainId)
      .reduce((sum, chain) => sum + balances[chain], 0);

    if (totalAvailableToBridge < remainingAmount) {
      return {
        error: "Insufficient balance to bridge the required amount.",
        currentBalance: totalAvailableToBridge,
        requiredAmount: remainingAmount,
      };
    }

    // Sort chains by bridging fees to targetChainId
    const routes = bridgeFees
      .filter(
        (fee) =>
          fee.toChainId === targetChainId && fee.fee !=null && fee.fee !=undefined && balances[fee.fromChainId] > 0
      )
      .map((fee) => {
        console.log(
          `From Chain: ${fee.fromChainId}, Balance: ${
            balances[fee.fromChainId]
          }, Fee: ${fee.fee}`
        );
        return {
          chain: fee.fromChainId,
          balance: balances[fee.fromChainId],
          fee: fee?.fee
        };
      })
      .sort((a, b) => a.fee - b.fee); // Sort by fee in ascending order

    console.log("Filtered and Sorted Routes:", routes);

    const selectedRoutes: Route[] = [];
    let totalBridged = 0;

    for (const route of routes) {
      if (totalBridged >= remainingAmount) break;

      const bridgeAmount = Math.min(
        route.balance,
        remainingAmount - totalBridged
      );
      totalBridged += bridgeAmount;

      selectedRoutes.push({
        chain: route.chain,
        amount: parseFloat(bridgeAmount.toFixed(4)),
        fee: parseFloat(route.fee.toFixed(4)),
      });
    }
    return selectedRoutes;
  } catch (error) {
    console.log(`Error occured while calculating efficient fee :: ${error}`);
    throw error;
  }
};
