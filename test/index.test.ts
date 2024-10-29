// test/index.test.ts
import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import app from '../src/index'; // Adjust the import to point to your app file

describe('Elysia - Bridge Path API', () => {
    let server: any;

    beforeAll(async () => {
        server = await app.listen(3000); // Start the server before tests
    });

    afterAll(async () => {
        await server.stop(); // Close the server after tests
    });

    it('should return a successful response for valid parameters', async () => {
        const response = await fetch('http://localhost:3000/fetch-efficient-bridge-path?targetChain=Arbitrum&amount=100&tokenSymbol=USDC&userAddress=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.routes).toBeDefined(); // Check if routes are present
        expect(data.totalFee).toBeDefined(); // Check if totalFee is calculated
    });

    it('should return an error for missing parameters', async () => {
        const response = await fetch('http://localhost:3000/fetch-efficient-bridge-path?targetChain=Ethereum&amount=100'); // Missing tokenSymbol and userAddress
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Missing required parameters');
    });

    it('should return an error for unsupported target chain', async () => {
        const response = await fetch('http://localhost:3000/fetch-efficient-bridge-path?targetChain=UnsupportedChain&amount=100&tokenSymbol=USDC&userAddress=0x1234567890abcdef');
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Unsupported chain name');
    });

    it('should indicate no bridging is necessary if sufficient funds exist', async () => {
        // Assuming that your mock setup or actual implementation can handle this
        const response = await fetch('http://localhost:3000/fetch-efficient-bridge-path?targetChain=Arbitrum&amount=8&tokenSymbol=USDC&userAddress=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045&fastestRoute=false');
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.message).toContain('sufficient funds on the target chain');
    });
});
