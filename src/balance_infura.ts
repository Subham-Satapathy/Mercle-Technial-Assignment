const { ethers } = require('ethers');

// Define the USDC contract address for each network
const usdcAddresses = {
    Polygon: "0x2791Bca1f11d6B24d0A3D1d4c7B4d0B0dB1E24D1", // USDC contract on Polygon
    Arbitrum: "0xFF970A61A04B1ca14586C5909B1AE4DC4fA16D51", // USDC contract on Arbitrum
    Base: "0xA0b86991c6218b36c1d19d4a2e9EB0cE3606EB48", // USDC contract on Base
    Gnosis: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8c7f54", // USDC contract on Gnosis
    Ethereum: "0xA0b86991c6218b36c1d19d4a2e9EB0cE3606EB48" // USDC contract on Ethereum
};

// Define the Infura project ID
const infuraProjectId = 'YOUR_INFURA_PROJECT_ID'; // Replace with your Infura Project ID

// Function to fetch USDC balance
async function fetchUSDCBalance(address) {
    const balances = {};

    // Create a provider for Ethereum using Infura
    const infuraProvider = new ethers.providers.InfuraProvider('mainnet', infuraProjectId);

    for (const chain in usdcAddresses) {
        let provider;

        // Use the appropriate provider for each chain
        if (chain === 'Ethereum') {
            provider = infuraProvider;
        } else {
            // For other networks, you can define separate providers or skip
            console.warn(`No provider set up for ${chain}. Skipping...`);
            continue;
        }

        try {
            // Fetch balance of the USDC contract for the user address
            const contract = new ethers.Contract(usdcAddresses[chain], [
                "function balanceOf(address) view returns (uint256)"
            ], provider);

            const balance = await contract.balanceOf(address);
            const formattedBalance = ethers.utils.formatUnits(balance, 6); // USDC has 6 decimals
            balances[chain] = formattedBalance;
        } catch (error) {
            console.error(`Error fetching balance from ${chain}:`, error);
            balances[chain] = 'Error';
        }
    }

    console.log('User USDC Balances:', balances);
}

// Example usage
const userAddress = "0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341"; // Replace with the actual user address
fetchUSDCBalance(userAddress).catch(console.error);
