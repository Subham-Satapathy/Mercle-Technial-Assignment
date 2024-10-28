const axios = require("axios");

interface Balances {
  [chain: string]: number;
}
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not defined in .env file");
}

export const fetchUserBalances = async (userAddress: string, tokenSymbol: string): Promise<Balances> => {
  try {
    // Simulate fetching balances
    const balances: Balances = {
      137: 50, // In USDC
      42161: 100, // In USDC
      100: 25, // In USDC
      81457: 30, // In USDC
    };
    const response = await fetchBalancesForToken(userAddress, tokenSymbol);
    console.log(`Balance of address '${userAddress}' to bridge '${tokenSymbol}' :: ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    console.log(`Error occured while calculating efficient fee :: ${error}`);
    throw error;
  }
};

// Function to fetch balances with a userAddress query parameter
const fetchBalancesForToken = async (userAddress: string, tokenSymbol: string): Promise<Balances> => {
  try {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.socket.tech/v2/balances",
      headers: {
        Accept: "application/json",
        "API-KEY": API_KEY as string,
      },
      params: {
        userAddress, // Adding userAddress as a query parameter
      },
    };
    const response = await axios(config);
    const transformedData = transformData(response.data, tokenSymbol);
    return transformedData;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

// Function to transform the data
const transformData = (data: any, tokenSymbol: string): Balances => {
  if (!data.success || !Array.isArray(data.result)) {
    return {};
  }

  // Use reduce to accumulate amounts by chainId for the specified tokenSymbol
  return data.result.reduce((acc: Record<number, number>, item: any) => {
    // Check if the item's symbol matches the specified tokenSymbol
    if (item.symbol === tokenSymbol) {
      // Accumulate the amount for the corresponding chainId
      if (acc[item.chainId]) {
        acc[item.chainId] += item.amount; // Sum amounts for duplicate chainIds
      } else {
        acc[item.chainId] = item.amount; // Initialize with the current amount
      }
    }
    return acc;
  }, {});
};
