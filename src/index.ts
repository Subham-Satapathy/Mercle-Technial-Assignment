import { Elysia } from "elysia";
import { calculateEfficientRoute } from "./services/calculateEfficientRoute";
import { findChainId, transformDataToDesiredFormat } from "./utils/utils";
import { Route } from "./interfaces/interfaces";
const app = new Elysia();
import { HttpError } from './errors/HttpError';

/**
 * Fetches the most cost-efficient bridge path for asset transfers.
 *
 * GET /fetch-efficient-bridge-path
 * Query parameters:
 * - targetChain (string): The name of the target blockchain to which assets need to be bridged.
 * - amount (number): The amount of tokens to transfer to the target chain.
 * - tokenSymbol (string): The symbol of the token to be bridged (e.g., "USDC").
 * - userAddress (string): The user's wallet address.
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
    let { targetChain, amount, tokenSymbol, userAddress } = normalizedQuery;

    // Validate required parameters
    if (!targetChain || !amount || !tokenSymbol || !userAddress) {
      throw new HttpError("Missing required parameters. Ensure targetChain, amount, tokenSymbol, and userAddress are provided.", 400);
    }

    // Retrieve chain ID for target chain and validate its support
    const targetChainId = findChainId(targetChain);
    if (!targetChainId) {
      throw new HttpError(`Unsupported chain name: ${targetChain}`, 400);
    }

    // Calculate the most cost-effective route for the asset transfer
    const routes = await calculateEfficientRoute(
      targetChainId as string,
      parseFloat(amount as string),
      userAddress as string,
      tokenSymbol as string
    );

    if (Array.isArray(routes)) {
      // If no bridging is needed (indicated by an empty route array), inform the user
      if (routes.length === 0) {
        return {
          success: true,
          routes: [],
          message:
            "You already have sufficient funds on the target chain. No bridging is necessary!",
        };
      }
      //Transform result into final response
      const transformedResponse = transformDataToDesiredFormat(routes as Route[]);
      return transformedResponse;
    }

  } catch (err) {
    // Handle unexpected errors with a log message and a 500 status response
    if (err instanceof HttpError) {
      return error(err.statusCode, {
        success: false,
        error: err.message
      })
    }
    return error(500, {
      success: false,
      error: "Internal Server Error",
    });
  }
});

export default app;
