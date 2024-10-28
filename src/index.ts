import { Elysia } from "elysia";
import { calculateEfficientRoute } from "./services/calculateEfficientRoute";
const app = new Elysia();
import { findChainId, calculateTotalFees, mapChainName } from "./utils/Utils";
interface Route {
  chain: string;
  amount: number;
  fee: number;
}


app.get("/fetch-efficient-bridge-path", async ({ query, error }) => {
  try {
    // Normalize the query parameters to handle empty spaces around parameter names and values
    const normalizedQuery = Object.fromEntries(
      Object.entries(query).map(([key, value]) => [
        key.trim(),
        value?.toString().trim(),
      ])
    );

    const { targetChain, amount, tokenSymbol, userAddress } = normalizedQuery;

    // Validate inputs
    if (!targetChain || !amount || !tokenSymbol || !userAddress) {
      return error(400, {
        success: false,
        error: "Missing required parameters",
      });
    }

    const targetChainId = findChainId(targetChain);

    console.log(`targetChainId : ${targetChainId}`);

    if(!targetChainId){
      return error(400, {
        success: false,
        error: "Unsupported chain name",
      });
    }

    const routes = await calculateEfficientRoute(
      targetChainId as string,
      parseFloat(amount as string),
      userAddress as string,
      tokenSymbol as string
    );

    const totalBridgeFee = calculateTotalFees(routes as Route)

    const routesWithChainName = mapChainName(routes as Route)
    
    
    return {
      success: true,
      totalFee: totalBridgeFee,
      routes: routesWithChainName,
    };
  } catch (err) {
    console.log(`Error occured while processing request :: ${error}`);
    return error(500, {
      success: false,
      error: "Internal Server Error",
    });
  }
});

export default app;
