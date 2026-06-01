import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { internal_unscoped_prisma as prisma } from './db/client';

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

import productRoutes from './routes/productRoutes';
import saleRoutes from './routes/saleRoutes';
import categoryRoutes from './routes/categoryRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import reportRoutes from './routes/reportRoutes';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import debtRoutes from './routes/debtRoutes';
import settingsRoutes from './routes/settingsRoutes';
import keepAliveRoutes from './routes/keepAliveRoutes';

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

// Last update: 04/27/2026 22:14:19
