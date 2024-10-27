const { Alchemy, Network } = require('alchemy-sdk');
const { ethers } = require('ethers');

// Define the USDC contract address for each network, including Ethereum
const usdcAddresses: Record<string, string> = {
    Polygon: "0x2791Bca1f11d6B24d0A3D1d4c7B4d0B0dB1E24D1", // USDC contract on Polygon
    Arbitrum: "0xFF970A61A04B1ca14586C5909B1AE4DC4fA16D51", // USDC contract on Arbitrum
    Base: "0xA0b86991c6218b36c1d19d4a2e9EB0cE3606EB48", // USDC contract on Base
    Gnosis: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8c7f54", // USDC contract on Gnosis
    Blast: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8c7f54", // USDC contract on Blast
    Ethereum: "0xA0b86991c6218b36c1d19d4a2e9EB0cE3606EB48"  // USDC contract on Ethereum
};

// Define the Alchemy settings for each network
const alchemySettings: Record<string, { apiKey: string; network: keyof typeof Network }> = {
    Polygon: { apiKey: 'H0rLcvLPzW91UG2buEzbfjIBJOM65NQA', network: Network.MATIC_MAINNET },
    Arbitrum: { apiKey: 'H0rLcvLPzW91UG2buEzbfjIBJOM65NQA', network: Network.ARB_MAINNET },
    Base: { apiKey: 'H0rLcvLPzW91UG2buEzbfjIBJOM65NQA', network: Network.BASE_MAINNET },
    Gnosis: { apiKey: 'H0rLcvLPzW91UG2buEzbfjIBJOM65NQA', network: Network.GNOSIS_MAINNET },
    Blast: { apiKey: 'H0rLcvLPzW91UG2buEzbfjIBJOM65NQA', network: Network.ETH_MAINNET },
    Ethereum: { apiKey: 'H0rLcvLPzW91UG2buEzbfjIBJOM65NQA', network: Network.ETH_MAINNET }  // Alchemy settings for Ethereum
};

// Function to fetch USDC balances concurrently
async function fetchUSDCBalance(address: string): Promise<void> {
    const balances: Record<string, string> = {}; // Define the type of balances

    await Promise.all(Object.keys(usdcAddresses).map(async (chain) => {
        const { apiKey, network } = alchemySettings[chain];
        const alchemy = new Alchemy({ apiKey, network });
        
        try {
            // Fetch balance of the USDC contract for the user address
            const balance = await alchemy.core.getTokenBalances(address, [usdcAddresses[chain]]);
            const usdcBalance = balance.tokenBalances[0]?.tokenBalance || '0'; // Check for balance or default to 0
            const formattedBalance = ethers.formatUnits(usdcBalance, 6); // USDC has 6 decimals
            balances[chain] = formattedBalance; // Correctly index the balances object
        } catch (error) {
            console.error(`Error fetching balance from ${chain}:`, error);
            balances[chain] = 'Error'; // Store error in balances object
        }
    }));

    console.log('User USDC Balances:', balances);
}

// Example usage
const userAddress = "0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341"; // Replace with the actual user address
fetchUSDCBalance(userAddress).catch(console.error);
