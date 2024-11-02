import { ChainIds, Route } from '../interfaces/interfaces';


// Import the JSON and cast it
import chainIdsData from "../constants/chainIds.json";

const chainIds: ChainIds = chainIdsData as ChainIds;

/**
 * Finds the chain ID corresponding to the given chain name.
 * @param chainName - The name of the chain to find.
 * @returns The chain ID if found, otherwise null.
 */
export function findChainId(chainName: string): string | null {
  try {
    const chainId = Object.entries(chainIds).find(([, value]) => value === chainName.toLowerCase())?.[0];
    // Return null if chainId is undefined
    return chainId ?? null;
  } catch (error) {
    console.error(`Error occurred while finding chainId: ${error}`);
    throw error;
  }
}

/**
 * Formats the estimated time from seconds to a readable string.
 * @param seconds - The time in seconds.
 * @returns A formatted string representing the time in hours or minutes.
 */
export const formatEstimatedTime = (seconds: number | null): string => {
  if(seconds){
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(seconds / 3600);
    
    return hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return ''
};

/**
 * Transforms an array of route data into a structured format that summarizes total fees and expected times.
 *
 * @param inputData - An array of route objects, where each object contains:
 *   - chain: The name or identifier of the blockchain (string).
 *   - amount: The amount being transferred (number).
 *   - fee: The fee associated with the route (number).
 *   - expectedTime: The expected time to complete the transaction in seconds (number).
 * @returns A transformed object.
 * */

export const transformDataToDesiredFormat = (inputData: Route []) => {
  const result = inputData.reduce(
    (acc, item) => {
      // Sum total fees and expected times
      acc.totalFee += item.fee;
      acc.totalExpectedTime += item.expectedTime; // summing total seconds

      // Add each route's transformed data
      acc.routes.push({
        chain: chainIds[item.chain] ?? item.chain,
        amount: item.amount,
        fee: parseFloat(item.fee.toFixed(4)), // rounding fee to 4 decimal places
        expectedTime: formatEstimatedTime(item.expectedTime), // formatting time
      });

      return acc;
    },
    { success: 'true', totalFee: 0, totalExpectedTime: 0, routes: [] as any[] }
  );
  // Convert total expected time from seconds to the formatted string
  result.totalExpectedTime = formatEstimatedTime(result.totalExpectedTime);

  // Round total fee to 4 decimal places
  result.totalFee = parseFloat(result.totalFee.toFixed(4));

  return result;
};

