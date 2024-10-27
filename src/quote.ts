import axios, { AxiosResponse } from 'axios';

// Define the expected structure of the response data
interface QuoteResponse {
  sourceToken: string;
  destinationToken: string;
  amount: string;
  fees: number;
  estimatedGas: number;
  [key: string]: any; // Additional fields if needed
}

async function getQuote(
  fromChainId: string,
  fromTokenAddress: string,
  toChainId: string,
  toTokenAddress: string,
  fromAmount: string,
  userAddress: string,
  uniqueRoutesPerBridge: boolean,
  sort: string,
  singleTxOnly: boolean,
  isContractCall: boolean
): Promise<QuoteResponse | null> {
  const apiKey = "YourAPIKeyHere"; // Replace with your actual API key

  const params = {
    fromChainId,
    fromTokenAddress,
    toChainId,
    toTokenAddress,
    fromAmount,
    userAddress,
    uniqueRoutesPerBridge,
    sort,
    singleTxOnly,
    isContractCall,
  };

  try {
    console.log("Fetching quote with parameters:", params);

    const response: AxiosResponse<QuoteResponse> = await axios.get(
      'https://api.socket.tech/v2/quote',
      {
        headers: {
          "API-KEY": apiKey,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        params,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
      console.error("Error status:", error.response?.status);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
}

// Example usage with actual data
const fromChainId = "137"; // Polygon (MATIC)
const fromTokenAddress = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"; // USDC on Polygon
const toChainId = "56"; // Binance Smart Chain (BSC)
const toTokenAddress = "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3"; // BUSD on BSC
const fromAmount = "100000000"; // Amount in the smallest unit (e.g., 100 USDC if using 6 decimals)
const userAddress = "0x3e8cB4bd04d81498aB4b94a392c334F5328b237b"; // User's wallet address
const uniqueRoutesPerBridge = true; // Flag for unique routes
const sort = "fast"; // Sorting criteria
const singleTxOnly = true; // Whether to allow only single transaction
const isContractCall = false; // Whether it's a contract call

getQuote(
  fromChainId,
  fromTokenAddress,
  toChainId,
  toTokenAddress,
  fromAmount,
  userAddress,
  uniqueRoutesPerBridge,
  sort,
  singleTxOnly,
  isContractCall
).then((quote) => {
  if (quote) {
    console.log("Quote:", JSON.stringify(quote, null, 2));
  }
});
