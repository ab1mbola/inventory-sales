import express from 'express';
import cors from 'cors';

import { internal_unscoped_prisma as prisma } from './db/client.js';

const app = express();
const port = process.env.PORT || 5000;

// Test DB connection
prisma.$connect()
  .then(() => console.log('Successfully connected to the database'))
  .catch((err: any) => console.error('CRITICAL: Database connection failed:', err));

app.use(cors());
app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("ROOT WORKS");
// });

app.get("/", (req, res) => {
  res.json({ message: "API is working" });
});

import productRoutes from './routes/productRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import debtRoutes from './routes/debtRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import keepAliveRoutes from './routes/keepAliveRoutes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/debt', debtRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/cron', keepAliveRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mnemos API is running' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('UNHANDLED ERROR:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on port ${port} (Network Accessible)`);
});

export default app;

// Last update: 04/27/2026 22:14:19
