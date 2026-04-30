import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './utils/prisma';

const app = express();
const port = process.env.PORT || 5000;

// Test DB connection and bootstrap tables
prisma.$connect()
  .then(async () => {
    console.log('Successfully connected to the database');
    // Ensure CompanySettings table exists
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CompanySettings" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "logo" TEXT,
            "copyrightText" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
        );
      `);
      console.log('Database tables verified.');
    } catch (e) {
      console.error('Table verification failed:', e);
    }
  })
  .catch((err) => console.error('CRITICAL: Database connection failed:', err));

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Inventory API is running' });
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on port ${port} (Network Accessible)`);
});

// Last update: 04/27/2026 22:14:19
