import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/debt', debtRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Inventory API is running' });
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on port ${port} (Network Accessible)`);
});

