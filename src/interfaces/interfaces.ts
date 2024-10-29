export interface Route {
  chain: string;
  amount: number;
  fee: number;
  expectedTime: number;
}

export interface InsufficientBalanceResponse {
  error: string;
  currentBalance: number;
  requiredAmount: number;
}

export interface BridgeFees {
  fromChainId: string;
  toChainId: string;
  fee: number | undefined;
  minTime: number
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