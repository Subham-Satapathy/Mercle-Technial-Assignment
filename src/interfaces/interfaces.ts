export interface Route {
  chain: string;
  amount: number;
  fee: number;
  expectedTime: number | null;
}

export interface InsufficientBalanceResponse {
  error: string;
  currentBalance: number;
  requiredAmount: number;
}

export interface BridgeFees {
  fromChainId: string;
  toChainId: string;
  fee: number | null;
  minTime: number | null
}

export interface Balances {
  [chain: string]: number;
}

export interface ChainIds {
  [key: string]: string;
}

interface TokenAddresses {
  [token: string]: string; // Token name as the key and its address as the value
}

export interface TokenAddressesByChainID {
  [chainId: number]: TokenAddresses; // Chain ID as the key and a map of tokens as the value
}

export type Chain = {
  chain: string;
  balance: number;
  fee: number;
  minTime: number | null;
};