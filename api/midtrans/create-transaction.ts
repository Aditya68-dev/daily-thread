import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  body?: any;
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    if (typeof res.status === 'function') {
      return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
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
    // Parse request body if not parsed yet
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        // use as is
      }
    } else if (!payload) {
      // Read body stream if needed
      payload = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({});
          }
        });
      });
    }

    if (!payload || !payload.transaction_details || !payload.transaction_details.order_id) {
      const errorPayload = { error: 'Invalid transaction payload. transaction_details.order_id is required.' };
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

    const snapEndpoint = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    // Midtrans Basic Auth: base64(serverKey + ':')
    const authHeader = `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;

    const midtransResponse = await fetch(snapEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    const resultData = await midtransResponse.json();

    if (typeof res.status === 'function') {
      return res.status(midtransResponse.status).json(resultData);
    }
    res.statusCode = midtransResponse.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(resultData));
  } catch (error: any) {
    console.error('Midtrans create-transaction backend error:', error.message || error);
    const errorPayload = { error: 'Internal server error while communicating with Midtrans gateway.' };
    if (typeof res.status === 'function') {
      return res.status(500).json(errorPayload);
    }
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(errorPayload));
  }
}
