import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({ error: 'No data provided' });
        }

        // Generate a short unique ID (8 chars)
        const id = generateShortId();

        // Store in Vercel KV with 30 day expiration (in seconds)
        const thirtyDays = 30 * 24 * 60 * 60;
        await kv.set(`report:${id}`, JSON.stringify(data), { ex: thirtyDays });

        return res.status(200).json({
            success: true,
            id,
            expiresIn: '30 days'
        });
    } catch (error) {
        console.error('Error saving report:', error);
        return res.status(500).json({ error: 'Failed to save report' });
    }
}

// Generate a short, URL-friendly ID
function generateShortId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
