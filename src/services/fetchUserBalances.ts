// src/services/fetchUserBalances.ts

interface Balances {
    [chain: string]: number;
  }
  
  export const fetchUserBalances = async (userAddress: string): Promise<Balances> => {
    // Simulate fetching balances
    const balances: Balances = {
      Polygon: 50,    // In USDC
      Arbitrum: 100,     // In USDC
      Gnosis: 25,     // In USDC
      Blast: 30       // In USDC
    };
  
    // Normally, here you'd make an API call to fetch actual user balances.
    return balances;
  };
  