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

/**
 * Calculates the most cost-effective bridging routes to transfer the specified amount to the target chain.
 * 
 * @param targetChainId - The chain ID of the destination chain where the amount needs to be transferred.
 * @param amount - The required amount of tokens to transfer to the target chain.
 * @param userAddress - The user's wallet address.
 * @param tokenSymbol - The symbol of the token to be bridged (e.g., "USDC").
 * 
 * @returns A promise that resolves to an array of optimal `Route` objects representing each chain's bridging route, 
 *          or an `InsufficientBalanceResponse` if there are insufficient funds to bridge the required amount.
 */
export const calculateEfficientRoute = async (
  targetChainId: string,
  amount: number,
  userAddress: string,
  tokenSymbol: string
): Promise<Route[] | InsufficientBalanceResponse> => {
  try {
    // Step 1: Fetch the user's token balances on all chains
    const balances = await fetchUserBalances(userAddress, tokenSymbol);

    // Step 2: Fetch bridging fees for all chains to the target chain
    const bridgeFees = await fetchFeesForAllChains(
      balances,
      targetChainId,
      amount,
      userAddress,
      tokenSymbol
    );

    // Step 3: Calculate the remaining amount needed on the target chain
    const currentBalance = balances[targetChainId] || 0;
    const remainingAmount = amount - currentBalance;

    // If the current balance meets the requirement, no bridging is needed
    if (remainingAmount <= 0) return [];

    // Step 4: Check if the total available balance across all chains is sufficient
    const totalAvailableToBridge = Object.values(balances).reduce((sum, balance) => sum + balance, 0) - currentBalance;
    
    if (totalAvailableToBridge < remainingAmount) {
      return {
        error: "Insufficient balance to bridge the required amount.",
        currentBalance: totalAvailableToBridge,
        requiredAmount: remainingAmount,
      };
    }

    // Step 5: Filter and sort routes by lowest bridging fees and positive balances
    const routes = bridgeFees
      .filter(
        (fee) => fee.fee !== undefined && fee.fee >= 0 && balances[fee.fromChainId] > 0
      )
      .map((fee) => ({
        chain: fee.fromChainId,
        balance: balances[fee.fromChainId],
        fee: fee.fee as number,  // Assert 'fee' is non-null by this point
      }))
      .sort((a, b) => a.fee - b.fee);

    console.log("Filtered and Sorted Routes:", routes);

    const selectedRoutes: Route[] = [];
    let totalBridged = 0;

    // Step 6: Select optimal routes until the required amount is bridged
    for (const route of routes) {
      if (totalBridged >= remainingAmount) break;

      // Determine amount to bridge for the current route
      const bridgeAmount = Math.min(route.balance, remainingAmount - totalBridged);
      totalBridged += bridgeAmount;

      selectedRoutes.push({
        chain: route.chain,
        amount: parseFloat(bridgeAmount.toFixed(4)),
        fee: parseFloat(route.fee.toFixed(4)),
      });
    }

    return selectedRoutes;
  } catch (error) {
    console.error(`Error occurred while calculating efficient route: ${error}`);
    throw error;
  }
};
