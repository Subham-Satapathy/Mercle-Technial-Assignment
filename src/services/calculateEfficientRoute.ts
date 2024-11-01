import { fetchUserBalances } from "./fetchUserBalances";
import { fetchFeesForAllChains } from "./fetchBridgeFees";
import {
  Route,
  InsufficientBalanceResponse,
  BridgeFees,
  Chain,
} from "../interfaces/interfaces";

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
    const routes = await fetchFeesForAllChains(
      balances,
      targetChainId,
      userAddress,
      tokenSymbol
    );
    console.log(`routes: ${JSON.stringify(routes)}`);

    // Step 3: Calculate the remaining amount needed on the target chain
    const currentBalance = balances[targetChainId] || 0;
    const remainingAmount = Math.max(
      0,
      parseFloat((amount - currentBalance).toFixed(4))
    );
    console.log(`Total amount required to bridge: ${remainingAmount}`);

    // If the current balance meets the requirement, no bridging is needed
    if (remainingAmount <= 0) return [];

    // Step 4: Check if the total available balance across all chains is sufficient
    const totalAvailableToBridge: number = parseFloat(
      Object.entries(balances)
        .reduce((sum, [chainId, balance]) => {
          // Only sum balances that are not from the targetChainId
          return chainId !== targetChainId ? sum + balance : sum; // Sum only if not the targetChainId
        }, 0)
        .toFixed(4) // Format total to 4 decimal places
    );

    console.log(`Total balance across chains: ${totalAvailableToBridge}`);

    if (totalAvailableToBridge < remainingAmount) {
      console.error("Insufficient balance to bridge the required amount.");
      return {};
    }

    // Step 5: Filter routes with positive balances and create a desired object by mapping
    const filteredRoutes = routes
      .filter((route): route is BridgeFees => route.fee >= 0 && balances[route.fromChainId] > 0)
      .map((route) => ({
        chain: route.fromChainId,
        balance: balances[route.fromChainId],
        fee: route.fee as number,
        minTime: route.minTime,
      }));
    

    // Find all valid combinations of routes
    const allCombinations = findAllCombinations(
      filteredRoutes,
      remainingAmount
    );


    // Step 6: Get the combination with the least fee
    const leastFeeCombination = getLeastFeeCombination(allCombinations);
    if (leastFeeCombination) {
      console.log("Combination with the least fee:", leastFeeCombination);
    } else {
      console.log("No combinations available.");
      return [];
    }

    // Step 7: Select optimal routes until the required amount is bridged
    return getAmountRequiredFromChains(leastFeeCombination, remainingAmount);
  } catch (error) {
    console.error(`Error occurred while calculating efficient route: ${error}`);
    throw error;
  }
};

/**
 * Finds all combinations of chains that can bridge the target amount.
 *
 * @param chains - The array of chains with their balances and fees.
 * @param targetAmount - The amount needed to be bridged.
 *
 * @returns An array of combinations that meet the target amount.
 */
function findAllCombinations(
  chains: Chain[],
  targetAmount: number
): { total: number; fee: number; route: Chain[] }[] {
  const results: { total: number; fee: number; route: Chain[] }[] = [];

  function backtrack(
    totalBalance: number,
    feeSoFar: number,
    index: number,
    route: Chain[]
  ): void {
    // Check if we have met or exceeded the target amount
    if (totalBalance >= targetAmount) {
      results.push({ total: totalBalance, fee: feeSoFar, route: [...route] });
      return; // Found a valid combination
    }

    // Stop if we have considered all chains
    if (index >= chains.length) return;

    const chain = chains[index];

    // Case 1: Skip this chain
    backtrack(totalBalance, feeSoFar, index + 1, route);

    // Case 2: Use this chain if balance allows it
    if (chain.balance > 0) {
      route.push(chain); // Add current chain to route
      const newTotalBalance = totalBalance + chain.balance; // Update total balance
      const newFee = feeSoFar + chain.fee; // Update fee
      backtrack(newTotalBalance, newFee, index + 1, route); // Continue backtracking
      route.pop(); // Backtrack to explore other routes
    }
  }

  // Start the backtracking with totalBalance of 0
  backtrack(0, 0, 0, []);
  return results;
}

/**
 * Gets the combination with the least fee from the array of combinations.
 *
 * @param combinations - The array of combinations to evaluate.
 *
 * @returns The combination with the least fee, or null if none exist.
 */
function getLeastFeeCombination(
  combinations: { total: number; fee: number; route: Chain[] }[]
): { total: number; fee: number; route: Chain[] } | null {
  // Check if the input array is empty
  if (combinations.length === 0) {
    return null; // Return null if there are no combinations
  }

  // Use Array.reduce to find the combination with the least fee
  return combinations.reduce((prev, current) =>
    current.fee < prev.fee ? current : prev
  );
}

/**
 * Selects optimal routes based on the least fee combination and the required remaining amount.
 *
 * @param leastFeeCombination - The combination with the least fee.
 * @param remainingAmount - The amount still required to be bridged.
 *
 * @returns An array of selected routes that bridge the required amount.
 */
function getAmountRequiredFromChains(
  leastFeeCombination: { total: number; fee: number; route: Chain[] },
  remainingAmount: number
): Route[] {
  const selectedRoutes: Route[] = [];
  let totalBridged = 0;

  for (const route of leastFeeCombination.route) {
    if (totalBridged >= remainingAmount) {
      break;
    }

    const currentRemaining = parseFloat(
      (remainingAmount - totalBridged).toFixed(4)
    );
    // Determine amount to bridge for the current route
    const bridgeAmount = Math.min(route.balance, currentRemaining);
    totalBridged += bridgeAmount; // Update total bridged amount

    console.log(`Bridging ${bridgeAmount} from ${route.chain}`);

    selectedRoutes.push({
      chain: route.chain,
      amount: parseFloat(bridgeAmount.toFixed(4)),
      fee: parseFloat(route.fee.toFixed(4)),
      expectedTime: route.minTime,
    });
  }

  console.log(`remaining: ${parseFloat((remainingAmount - totalBridged).toFixed(4))}`);
  return selectedRoutes;
}
