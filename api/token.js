const TOKEN_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export default async function handler(request, response) {
    const tokenAddress = request.query.address;
    const apiKey = process.env.SOLANATRACKER_API_KEY;

    if (typeof tokenAddress !== 'string' || !TOKEN_ADDRESS_PATTERN.test(tokenAddress)) {
        return response.status(400).json({ error: 'A valid Solana token address is required.' });
    }

    if (!apiKey) {
        return response.status(500).json({ error: 'SOLANATRACKER_API_KEY is not configured.' });
    }

    try {
        const upstreamResponse = await fetch(`https://data.solanatracker.io/tokens/${tokenAddress}`, {
            headers: {
                'x-api-key': apiKey,
                Accept: 'application/json'
            }
        });

        if (!upstreamResponse.ok) {
            return response.status(upstreamResponse.status).json({ error: 'Unable to retrieve token data.' });
        }

        response.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
        return response.status(200).json({ data: await upstreamResponse.json() });
    } catch (error) {
        return response.status(502).json({ error: 'Token data provider is unavailable.' });
    }
}