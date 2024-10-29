import { Route, ChainIds } from '../interfaces/interfaces';


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
    return Object.entries(chainIds).find(([, value]) => value === chainName.toLowerCase())?.[0];
  } catch (error) {
    console.error(`Error occurred while finding chainId: ${error}`);
    throw error;
  }
}

/**
 * Calculates the total fees from an array of routes.
 * @param routes - An array of Route objects.
 * @returns The total fee as a number rounded to four decimal places.
 */
export const calculateTotalFees = (routes: Route[]): number => {
  return parseFloat(routes.reduce((total, route) => total + route.fee, 0).toFixed(4));
};

/**
 * Calculates the total estimated time for an array of routes in seconds.
 * @param routes - An array of Route objects.
 * @returns The total estimated time in seconds.
 */
export const calculateTotalEstimatedTime = (routes: Route[]): number => {
  return routes.reduce((total, route) => total + route.expectedTime, 0);
};

/**
 * Maps the chain name to its corresponding chain ID.
 * @param routes - An array of Route objects.
 * @returns An array of Route objects with mapped chain IDs.
 */
export const mapChainName = (routes: Route[]): Route[] => {
  return routes.map(route => ({
    ...route,
    chain: chainIds[route.chain] ?? route.chain,
  }));
};

/**
 * Formats the estimated time from seconds to a readable string.
 * @param seconds - The time in seconds.
 * @returns A formatted string representing the time in hours or minutes.
 */
export const formatEstimatedTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(seconds / 3600);
  
  return hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : `${minutes} minute${minutes > 1 ? 's' : ''}`;
};

/**
 * Gets the routes with formatted expected time.
 * @param routes - An array of Route objects.
 * @returns An array of Route objects with formatted expected times.
 */
export const getTimeFormattedRoutes = (routes: Route[]): Route[] => {
  return routes.map(route => ({
    ...route,
    expectedTime: formatEstimatedTime(route.expectedTime),
  }));
};
