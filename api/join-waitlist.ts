import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Store email in a list with timestamp
    const entry = {
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
    };

    // Add to waitlist (using a list to store all emails)
    await kv.lpush('waitlist:emails', JSON.stringify(entry));

    return res.status(200).json({
      success: true,
      message: 'Added to waitlist',
    });
  } catch (error) {
    console.error('Error saving email:', error);
    return res.status(500).json({ error: 'Failed to save email' });
  }
}
