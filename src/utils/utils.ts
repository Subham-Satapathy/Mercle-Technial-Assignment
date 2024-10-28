import chainIds from "../constants/chainIds";

interface Route {
  chain: string;
  amount: number;
  fee: number;
}


export function findChainId(chainName: string): string | undefined {
  try {
    for (const [key, value] of Object.entries(chainIds)) {
      if (value === chainName.toLowerCase()) {
        return key;
      }
    }
    return undefined;
  } catch (error) {
    console.log(`Error occured while finding chainId :: ${error}`);
    throw error;
  }
}

export const calculateTotalFees = (routes: Route) => {
    let totalBridgeFee = 0;
    if (Array.isArray(routes) && routes.length >= 0) {
      routes.forEach((route) => {
        totalBridgeFee += route.fee;
      });
    }
    return parseFloat(totalBridgeFee.toFixed(4))
};

export const mapChainName = (routes: Route) => {
    return Array.isArray(routes)
        ? routes.map(route => ({ ...route, chain: chainIds[route.chain] ?? route.chain }))
        : { ...routes, chain: chainIds[routes.chain] ?? routes.chain };
}
