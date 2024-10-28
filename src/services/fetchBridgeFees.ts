import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not defined in .env file");
}

interface Route {
  totalGasFeesInUsd: number;
  fromToken: string;
  toToken: string;
  estimatedTime: number;
}

interface BridgeFees {
  fromChainId: string;
  toChainId: string;
  fee: number | undefined;
}

// Map of token addresses by chain ID for various networks
const tokenAddressesByChainID = {
  1: { USDC: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },       // Ethereum
  137: { USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" },      // Polygon
  56: { USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d" },       // Binance Smart Chain
  43114: { USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" },    // Avalanche
  250: { USDC: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75" },      // Fantom
  42161: { USDC: "0xFF970A61A04b1cA14834A43f5de4533ebDDB5CC8" },    // Arbitrum
  10: { USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607" },       // Optimism
  1666600000: { USDC: "0x985458e523db3d53125813ed68c274899e9dfab4" }, // Harmony
  42220: { USDC: "0x765DE816845861e75A25fCA122bb6898B8B1282a" }     // Celo
};

/**
 * Fetch bridge fees between two chains for a given token and user address.
 * 
 * @param fromChainId - The ID of the source chain
 * @param targetChainId - The ID of the destination chain
 * @param amount - The amount of the token to transfer (in base units)
 * @param userAddress - The user’s wallet address
 * @param tokenSymbol - The symbol of the token (e.g., "USDC")
 * @returns An object containing the source and destination chain IDs and the calculated bridge fee
 */
const fetchBridgeFees = async (
  fromChainId: string,
  targetChainId: string,
  amount: number,
  userAddress: string,
  tokenSymbol: string
): Promise<BridgeFees> => {
  const fromAssetAddress = tokenAddressesByChainID[Number(fromChainId)]?.[tokenSymbol];
  const toAssetAddress = tokenAddressesByChainID[Number(targetChainId)]?.[tokenSymbol];

  const uniqueRoutesPerBridge = true; // Ensure unique routes for each bridge
  const sort = "output"; // Sort routes by output, other options are "gas" and "time"
  const singleTxOnly = true; // Fetch single transaction only for simplicity

  try {
    const response = await getQuote(
      Number(fromChainId),
      fromAssetAddress,
      Number(targetChainId),
      toAssetAddress,
      amount * 1e6, // Adjust for USDC 6 decimal places
      userAddress,
      uniqueRoutesPerBridge,
      sort,
      singleTxOnly
    );

    const data = response.data;
    const cheapestRoute = findCheapestRoute(data?.result?.routes);

    const fee = cheapestRoute?.totalGasFeesInUsd || undefined;
    const bridgeFee = { fromChainId, toChainId: targetChainId, fee };

    console.log('Calculated cheapest bridge fee:', bridgeFee);

    return bridgeFee;

  } catch (error: any) {
    console.error(`Error fetching bridge fees: ${error.message}`);
    throw error;
  }
};

/**
 * Gets a quote from the bridge API for transferring a specific token between chains.
 * 
 * @param fromChainId - ID of the source chain
 * @param fromTokenAddress - Token address on the source chain
 * @param toChainId - ID of the destination chain
 * @param toTokenAddress - Token address on the destination chain
 * @param fromAmount - Amount of the token to transfer (in base units)
 * @param userAddress - User's wallet address initiating the transfer
 * @param uniqueRoutesPerBridge - Flag for unique bridge routes per transaction
 * @param sort - Sorting criteria for routes (e.g., "output", "gas", "time")
 * @param singleTxOnly - Flag to restrict to a single transaction
 * @returns A Promise resolving to the response from the API
 */
async function getQuote(
  fromChainId: number,
  fromTokenAddress: string,
  toChainId: number,
  toTokenAddress: string,
  fromAmount: number,
  userAddress: string,
  uniqueRoutesPerBridge: boolean,
  sort: string,
  singleTxOnly: boolean
) {
  const url = `https://api.socket.tech/v2/quote?fromChainId=${fromChainId}&fromTokenAddress=${fromTokenAddress}&toChainId=${toChainId}&toTokenAddress=${toTokenAddress}&fromAmount=${fromAmount}&userAddress=${userAddress}&uniqueRoutesPerBridge=${uniqueRoutesPerBridge}&sort=${sort}&singleTxOnly=${singleTxOnly}`;

  const response = await axios.get(url, {
    headers: {
      "API-KEY": API_KEY as string,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return response;
}

/**
 * Finds the route with the lowest gas fees in USD.
 * 
 * @param routes - Array of available routes with fee information
 * @returns The route object with the lowest gas fee or null if no routes are available
 */
function findCheapestRoute(routes: Route[]): Route | null {
  if (!routes || routes.length === 0) return null;
  return routes.reduce((cheapest, current) => (
    current.totalGasFeesInUsd < cheapest.totalGasFeesInUsd ? current : cheapest
  ));
}

/**
 * Fetches bridge fees for all available chains except the target chain.
 * 
 * @param balances - An object containing the user’s token balances by chain ID
 * @param targetChainId - The chain ID to bridge the token to
 * @param amount - The amount of the token to transfer
 * @param userAddress - The user’s wallet address
 * @param tokenSymbol - The token symbol to filter by (e.g., "USDC")
 * @returns A Promise that resolves to an array of bridge fees for each eligible chain
 */
export const fetchFeesForAllChains = async (
  balances: { [key: string]: number },
  targetChainId: string,
  amount: number,
  userAddress: string,
  tokenSymbol: string
) => {
  const promises = Object.entries(balances).map(async ([fromChainId, balance]) => {
    try {
      if (fromChainId !== targetChainId) {
        const bridgeFee = await fetchBridgeFees(fromChainId, targetChainId, balance, userAddress, tokenSymbol);
        console.log(`Fees for chain ${fromChainId}:`, bridgeFee);
        return bridgeFee;
      }
    } catch (error: any) {
      console.error(`Error fetching fees for chain ${fromChainId}:`, error);
      return { fromChainId, error: error.message || 'Unknown error' };
    }
  });

  // Wait for all promises to resolve and filter out undefined results
  const allResults = await Promise.all(promises);
  console.log("All fees fetched:", allResults);
  return allResults.filter(result => result);
};
