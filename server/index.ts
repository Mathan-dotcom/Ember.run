import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount API router
app.use('/api', apiRouter);

// Root route
app.get('/', (_req, res) => {
  res.json({
    name: 'Ember.run Offchain Service',
    description: 'High-performance offchain cache & profile service for Monad curation market',
    endpoints: {
      health: '/api/health',
      curators: '/api/curators/leaderboard',
      drafts: '/api/drafts',
      analytics: '/api/analytics/protocol'
    }
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Ember.run Offchain Service running on http://localhost:${PORT}`);
  console.log(`📡 Connected to Monad Testnet (Chain ID 10143)`);
});
