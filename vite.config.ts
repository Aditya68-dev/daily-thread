import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function midtransApiPlugin(): Plugin {
  return {
    name: 'midtrans-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlObj = new URL(req.url || '', 'http://localhost:3000');
        const pathname = urlObj.pathname;

        // 1. Create Midtrans Snap Transaction
        if (pathname === '/api/midtrans/create-transaction' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const serverKey = process.env.MIDTRANS_SERVER_KEY;
              if (!serverKey) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                res.end(JSON.stringify({ 
                  error: 'MIDTRANS_SERVER_KEY belum diatur di environment variable backend. Silakan tambahkan MIDTRANS_SERVER_KEY di file .env lokal atau dashboard hosting.' 
                }));
                return;
              }

              const payload = JSON.parse(body);
              const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true' || 
                                   process.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';

              const snapEndpoint = isProduction
                ? 'https://app.midtrans.com/snap/v1/transactions'
                : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

              const auth = Buffer.from(serverKey + ':').toString('base64');

              const midtransRes = await fetch(snapEndpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Basic ${auth}`
                },
                body: JSON.stringify(payload)
              });

              const data = await midtransRes.json();
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = midtransRes.status;
              res.end(JSON.stringify(data));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
            }
          });
          return;
        }

        // 2. Check Midtrans Transaction Status
        if (pathname === '/api/midtrans/status' && req.method === 'GET') {
          try {
            const orderId = urlObj.searchParams.get('order_id');
            if (!orderId) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing order_id parameter' }));
              return;
            }

            const serverKey = process.env.MIDTRANS_SERVER_KEY;
            if (!serverKey) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ 
                error: 'MIDTRANS_SERVER_KEY belum diatur di environment variable backend. Silakan tambahkan MIDTRANS_SERVER_KEY di file .env lokal atau dashboard hosting.' 
              }));
              return;
            }

            const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true' || 
                                 process.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';

            const statusEndpoint = isProduction
              ? `https://api.midtrans.com/v2/${encodeURIComponent(orderId)}/status`
              : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`;

            const auth = Buffer.from(serverKey + ':').toString('base64');

            const statusRes = await fetch(statusEndpoint, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${auth}`
              }
            });

            const statusData = await statusRes.json();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = statusRes.status;
            res.end(JSON.stringify(statusData));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Failed to check Midtrans status' }));
          }
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), midtransApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

