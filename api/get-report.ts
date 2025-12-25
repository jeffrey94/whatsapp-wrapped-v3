import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'No ID provided' });
        }

        // Retrieve from Vercel KV
        const data = await kv.get(`report:${id}`);

        if (!data) {
            return res.status(404).json({ error: 'Report not found or expired' });
        }

        // Parse if it's a string (it should be stored as stringified JSON)
        const reportData = typeof data === 'string' ? JSON.parse(data) : data;

        return res.status(200).json({
            success: true,
            data: reportData
        });
    } catch (error) {
        console.error('Error getting report:', error);
        return res.status(500).json({ error: 'Failed to retrieve report' });
    }
}
