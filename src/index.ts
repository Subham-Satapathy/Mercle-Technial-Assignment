import { Elysia } from "elysia";
import { calculateEfficientRoute } from "./services/calculateEfficientRoute";
import { findChainId, calculateTotalFees, mapChainName } from "./utils/Utils";

const app = new Elysia();

interface Route {
  chain: string;
  amount: number;
  fee: number;
}

/**
 * Fetches the most cost-efficient bridge path for asset transfers.
 *
 * GET /fetch-efficient-bridge-path
 * Query parameters:
 * - targetChain (string): The name of the target blockchain to which assets need to be bridged.
 * - amount (number): The amount of tokens to transfer to the target chain.
 * - tokenSymbol (string): The symbol of the token to be bridged (e.g., "USDC").
 * - userAddress (string): The user's wallet address.
 * - fastestRoute (boolean): Optional parameter to specify if the fastest route is preferred.
 *
 * @returns {Object} Response with success status, total bridge fee, and route details. 
 *                   In case of sufficient balance on the target chain, it returns a success message.
 */
app.get("/fetch-efficient-bridge-path", async ({ query, error }) => {
  try {
    // Normalize query parameters by trimming any whitespace around keys and values
    const normalizedQuery = Object.fromEntries(
      Object.entries(query).map(([key, value]) => [
        key.trim(),
        value?.toString().trim(),
      ])
    );

    // Destructure normalized parameters, converting strings to expected types where necessary
    const {
      targetChain,
      amount,
      tokenSymbol,
      userAddress,
      fastestRoute
    } = normalizedQuery;

    // Validate required parameters
    if (!targetChain || !amount || !tokenSymbol || !userAddress) {
      return error(400, {
        success: false,
        error: "Missing required parameters. Ensure targetChain, amount, tokenSymbol, and userAddress are provided.",
      });
    }

    // Retrieve chain ID for target chain and validate its support
    const targetChainId = findChainId(targetChain);
    if (!targetChainId) {
      return error(400, {
        success: false,
        error: `Unsupported chain name: ${targetChain}`,
      });
    }

    // Calculate the most cost-effective route for the asset transfer
    const routes = await calculateEfficientRoute(
      targetChainId as string,
      parseFloat(amount as string),
      userAddress as string,
      tokenSymbol as string
    );

    // If no bridging is needed (indicated by an empty route array), inform the user
    if (Array.isArray(routes) && routes.length === 0) {
      return {
        success: true,
        routes: [],
        message: "You already have sufficient funds on the target chain. No bridging is necessary!",
      };
    }

    // Calculate the total bridge fee and map chain IDs to chain names for each route
    const totalBridgeFee = calculateTotalFees(routes as Route[]);
    const routesWithChainName = mapChainName(routes as Route[]);

    // Return the route data with chain names and total fees
    return {
      success: true,
      totalFee: totalBridgeFee,
      routes: routesWithChainName,
    };
  } catch (err) {
    // Handle unexpected errors with a log message and a 500 status response
    console.error(`Error occurred while processing the bridge path request: ${err}`);
    return error(500, {
      success: false,
      error: "Internal Server Error",
    });
  }
});

export default app;
