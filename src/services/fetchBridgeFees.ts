interface BridgeFees {
  [route: string]: number;
}
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
const tokenAddressesByChainID = {
  1: { // Ethereum
    USDC: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  137: { // Polygon
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  },
  56: { // Binance Smart Chain
    USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  },
  43114: { // Avalanche
    USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  },
  250: { // Fantom
    USDC: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
  },
  42161: { // Arbitrum
    USDC: "0xFF970A61A04b1cA14834A43f5de4533ebDDB5CC8",
  },
  10: { // Optimism
    USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
  },
  1666600000: { // Harmony
    USDC: "0x985458e523db3d53125813ed68c274899e9dfab4",
  },
  42220: { // Celo
    USDC: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  }
};

const fetchBridgeFees = async (
  fromChainId: string,
  targetChainId: string,
  amount: number,
  userAddress: string,
  tokenSymbol: string
): Promise<BridgeFees> => {
  // Define addresses for assets
  // Fetch asset addresses using chain IDs and token symbol
  const fromAssetAddress = tokenAddressesByChainID[Number(fromChainId)]?.[tokenSymbol];
  const toAssetAddress = tokenAddressesByChainID[Number(targetChainId)]?.[tokenSymbol];

  const uniqueRoutesPerBridge = true; // Returns the best route for a given DEX/bridge combination
  const sort = "output"; // Options: "output", "gas", "time"
  const singleTxOnly = true;

  try {
    const response = await getQuote(
      Number(fromChainId),
      fromAssetAddress,
      Number(targetChainId),
      toAssetAddress,
      amount * 1e6, // As USDC is 6 decimals
      userAddress,
      uniqueRoutesPerBridge,
      sort,
      singleTxOnly
    );

    if (!response.ok) {
      const errorText = await response.text(); // Fetch detailed error information
      const bridgeFee = { fromChainId, toChainId: targetChainId, fee: null };
      console.error(`Failed to fetch quote: ${response.status} ${response.statusText} - ${errorText}`);
      return bridgeFee;
    }

    // Parse the JSON response
    const data = await response.json();

    // Use the function to find the cheapest route
    const cheapestRoute = findCheapestRoute(data?.result?.routes);

    // Extract fee from the cheapest route or return a default value if not found
    const fee = cheapestRoute?.totalGasFeesInUsd || undefined; // Default to 0 if no fee found
    const bridgeFee = { fromChainId, toChainId: targetChainId, fee };

    console.log('Calculated cheapest bridge fee:', bridgeFee);

    return bridgeFee;

  } catch (error: any) {
    console.error(`Error fetching bridge fees: ${error.message}`);
    throw error; // Optionally rethrow or handle as needed
  }
};






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
): Promise<Response> {
  const url = `https://api.socket.tech/v2/quote?fromChainId=${fromChainId}&fromTokenAddress=${fromTokenAddress}&toChainId=${toChainId}&toTokenAddress=${toTokenAddress}&fromAmount=${fromAmount}&userAddress=${userAddress}&uniqueRoutesPerBridge=${uniqueRoutesPerBridge}&sort=${sort}&singleTxOnly=${singleTxOnly}`;

  // console.log(url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "API-KEY": API_KEY as string,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  return response;
}

// Function to find the route with the least totalGasFeesInUsd
function findCheapestRoute(routes: Route[]): Route | null {
  if (routes.length === 0) return null;
  return routes.reduce((cheapest, current) => {
    return current.totalGasFeesInUsd < cheapest.totalGasFeesInUsd
      ? current
      : cheapest;
  });
}


// Function to call fetchBridgeFees for each chainId
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
        return bridgeFee; // Return the bridge fee directly
      }
    } catch (error: any) {
      console.error(`Error fetching fees for chain ${fromChainId}:`, error);
      return { fromChainId, error: error.message || 'Unknown error' }; // More explicit error handling
    }
  });

  // Wait for all promises to resolve
  const allResults = await Promise.all(promises);
  console.log("All fees fetched:", allResults);
  return allResults.filter(result => result); // Filter out undefined results
};
