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
  
  const bridgeFees = await fetchFeesForAllChains(balances, targetChainId, amount, userAddress, tokenSymbol);

  // console.log(`bridgeFees :: ${JSON.stringify(bridgeFees)}`);
  

  // Calculate the remaining amount needed on the target chain
  const currentBalance = balances[targetChainId] || 0;
  const remainingAmount = amount - currentBalance;

  if (remainingAmount <= 0) {
    return []; // No bridging needed
  }

  // Check if there are enough funds across all chains
  const totalAvailableToBridge = Object.keys(balances)
    .filter(chain => chain !== targetChainId)
    .reduce((sum, chain) => sum + balances[chain], 0);

  if (totalAvailableToBridge < remainingAmount) {
    return {
      error: "Insufficient balance to bridge the required amount.",
      currentBalance: totalAvailableToBridge,
      requiredAmount: remainingAmount
    };
  }

  // Sort chains by bridging fees to targetChainId
  const routes = Object.keys(bridgeFees)
    .filter(chain => chain !== targetChainId && balances[chain] > 0)
    .map(chain => {
        const bridgeFee = bridgeFees.find(fee => fee.fromChainId === chain && fee.toChainId === targetChainId);
        return {
            chain,
            balance: balances[chain],
            fee: bridgeFee && bridgeFee != null ? bridgeFee.fee : Infinity, // Use the fee if found, otherwise Infinity
        };
    })
    .sort((a, b) => a.fee - b.fee);
    


  const selectedRoutes: Route[] = [];
  let totalBridged = 0;

  for (const route of routes) {
    if (totalBridged >= remainingAmount) break;

    const bridgeAmount = Math.min(route.balance, remainingAmount - totalBridged);
    totalBridged += bridgeAmount;

    selectedRoutes.push({
      chain: route.chain,
      amount: parseFloat(bridgeAmount.toFixed(4)),
      fee: parseFloat(route.fee.toFixed(4))
    });
  }
  return selectedRoutes;
  } catch (error) {
    console.log(`Error occured while calculating efficient fee :: ${error}`);
    throw error;
  }
  
};
