// src/services/fetchBridgeFees.ts

interface BridgeFees {
    [route: string]: number;
  }
  
  export const fetchBridgeFees = async (): Promise<BridgeFees> => {
    const bridgeFees: BridgeFees = {
      "Arbitrum->Polygon": 1,    // In USDC
      "Base->Polygon": 0.5,
      "Gnosis->Polygon": 0.7,
      "Blast->Polygon": 0.2
    };
  
    // Ideally, fetch live fees from an external source if available
    return bridgeFees;
  };
  