import { fetchUserBalances } from "./fetchUserBalances";
import { fetchFeesForAllChains } from "./fetchBridgeFees";
import { Route, InsufficientBalanceResponse, BridgeFees } from "../interfaces/interfaces";

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

    // Step 3: Calculate the remaining amount needed on the target chain
    const currentBalance = balances[targetChainId] || 0;
    const remainingAmount = parseFloat((amount - currentBalance).toFixed(4));
    
    console.log(`Total amount required to bridge : ${remainingAmount}`);
    

    // If the current balance meets the requirement, no bridging is needed
    if (remainingAmount <= 0) return [];

    // Step 4: Check if the total available balance across all chains is sufficient
    const totalAvailableToBridge =
      parseFloat((Object.values(balances).reduce((sum, balance) => sum + balance, 0) -
      currentBalance).toFixed(4));

    console.log(`Total balance across chains : ${totalAvailableToBridge}`);
    

    if (totalAvailableToBridge < remainingAmount) {
      console.error('Insufficient balance to bridge the required amount.');
      return {};
    }

    // Step 5: Filter and sort routes by lowest bridging fees and positive balances
    const filteredRoutes = routes
      .filter(
        (route): route is BridgeFees =>
          route !== null &&
          route.fee !== null &&
          route.fee >= 0 &&
          balances[route.fromChainId] > 0
      )
      .map((route) => ({
        chain: route.fromChainId,
        balance: balances[route.fromChainId],
        fee: route.fee as number,
        minTime: route.minTime,
      }))
      .sort((a, b) => a.fee - b.fee);

    const selectedRoutes: Route[] = [];
    let totalBridged = 0;

    // Step 6: Select optimal routes until the required amount is bridged
    
    for (const route of filteredRoutes) {
      
      if (totalBridged >= remainingAmount){
        console.log('Bridging amount reached!!');
        break;
      } 
      
      console.log(`remaining :: ${parseFloat((remainingAmount - totalBridged).toFixed(4))}`);

      // Determine amount to bridge for the current route
      const bridgeAmount = Math.min(
        route.balance,
        parseFloat((remainingAmount - totalBridged).toFixed(4))
      )
      parseFloat((totalBridged += bridgeAmount).toFixed(4))

      console.log(`Bridging ${bridgeAmount} from ${route.chain}`);

      selectedRoutes.push({
        chain: route.chain,
        amount: parseFloat(bridgeAmount.toFixed(4)),
        fee: parseFloat(route.fee.toFixed(4)),
        expectedTime: route.minTime,
      });
    }

    return selectedRoutes;
  } catch (error) {
    console.error(`Error occurred while calculating efficient route: ${error}`);
    throw error;
  }
};
