import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (body: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Only allow GET
  if (req.method !== 'GET') {
    if (typeof res.status === 'function') {
      return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Use GET.' }));
    return;
  }

  // Securely get Server Key from backend environment variable
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    const errorPayload = { 
      error: 'MIDTRANS_SERVER_KEY is not configured on the backend server. Please set MIDTRANS_SERVER_KEY in your Vercel Environment Variables.' 
    };
    if (typeof res.status === 'function') {
      return res.status(500).json(errorPayload);
    }
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(errorPayload));
    return;
  }

  try {
    // Extract order_id from query parameters
    let orderId = req.query?.order_id;
    if (!orderId) {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      orderId = parsedUrl.searchParams.get('order_id') || undefined;
    }

    if (!orderId) {
      const errorPayload = { error: 'Missing required query parameter: order_id' };
      if (typeof res.status === 'function') {
        return res.status(400).json(errorPayload);
      }
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(errorPayload));
      return;
    }

    // Determine environment (Production vs Sandbox)
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true' || 
                         process.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';

    const statusEndpoint = isProduction
      ? `https://api.midtrans.com/v2/${encodeURIComponent(String(orderId))}/status`
      : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(String(orderId))}/status`;

    // Midtrans Basic Auth: base64(serverKey + ':')
    const authHeader = `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;

    const midtransResponse = await fetch(statusEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': authHeader
      }
    });

    const statusData = await midtransResponse.json();

    if (typeof res.status === 'function') {
      return res.status(midtransResponse.status).json(statusData);
    }
    res.statusCode = midtransResponse.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(statusData));
  } catch (error: any) {
    console.error('Midtrans status check backend error:', error.message || error);
    const errorPayload = { error: 'Internal server error while querying Midtrans transaction status.' };
    if (typeof res.status === 'function') {
      return res.status(500).json(errorPayload);
    }
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(errorPayload));
  }
}
