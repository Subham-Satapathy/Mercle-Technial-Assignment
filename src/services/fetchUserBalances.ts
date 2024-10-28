import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not defined in .env file");
}

// Interface to define the balances by chain ID
interface Balances {
  [chain: string]: number;
}

/**
 * Fetches the balances of a specific token for a given user address across various chains.
 * 
 * @param userAddress - The address of the user whose balance is to be fetched
 * @param tokenSymbol - The symbol of the token to fetch the balance for
 * @returns A Promise that resolves to an object with chain IDs as keys and balance amounts as values
 */
export const fetchUserBalances = async (
  userAddress: string,
  tokenSymbol: string
): Promise<Balances> => {
  try {
    // Fetch balances for the specified token and user address
    const response = await fetchBalancesForToken(userAddress, tokenSymbol);
    console.log(`Balance of address '${userAddress}' for '${tokenSymbol}': ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    console.error(`Error occurred while fetching balances: ${error}`);
    throw error;
  }
};

/**
 * Fetches token balances from the API for a specific user address.
 * 
 * @param userAddress - The user’s address to query
 * @param tokenSymbol - The token symbol to filter by (e.g., "USDC")
 * @returns A Promise that resolves to the transformed data containing balances by chain
 */
const fetchBalancesForToken = async (
  userAddress: string,
  tokenSymbol: string
): Promise<Balances> => {
  try {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.socket.tech/v2/balances",
      headers: {
        Accept: "application/json",
        "API-KEY": API_KEY as string,
      },
      // Include user address as a query parameter
      params: { userAddress },
    };
    
    // Make the API call
    const response = await axios(config);
    
    // Transform the response data to accumulate balances by chain ID
    return transformData(response.data, tokenSymbol);

  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error message:", error.message);
      console.error("Axios error response:", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

/**
 * Transforms API response data to accumulate token balances by chain ID.
 * 
 * @param data - The raw response data from the API
 * @param tokenSymbol - The token symbol to filter by in the data
 * @returns An object containing the total balance of the specified token across chains
 */
const transformData = (data: any, tokenSymbol: string): Balances => {
  // Verify success status and ensure the result is an array
  if (!data.success || !Array.isArray(data.result)) {
    return {};
  }

  // Use reduce to accumulate amounts by chainId for the specified tokenSymbol
  return data.result.reduce((acc: Balances, item: any) => {
    if (item.symbol === tokenSymbol) {
      // Sum amounts if chainId already exists, else initialize it
      acc[item.chainId] = (acc[item.chainId] || 0) + item.amount;
    }
    return acc;
  }, {});
};
