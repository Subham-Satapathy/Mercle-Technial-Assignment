// src/index.ts

import Elysia from 'elysia';
import { calculateEfficientRoute } from './services/calculateEfficientRoute';

const app = new Elysia();

app.get('/api/find-route', async (req) => {
    const { targetChain, amount, tokenAddress, userAddress } = req.query;

    if (!targetChain || !amount || !tokenAddress || !userAddress) {
        return {
            success: false,
            message: 'Missing required query parameters'
        };
    }

    const routes = await calculateEfficientRoute(
        targetChain as string,
        parseFloat(amount as string),
        userAddress as string
    );

    return {
        success: true,
        routes,
    };
});

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));
