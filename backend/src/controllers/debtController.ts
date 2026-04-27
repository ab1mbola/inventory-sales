import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getDebtors = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        sales: {
          where: {
            paymentMethod: 'CREDIT'
          }
        },
        payments: true
      }
    });

    const debtorStats = customers.map(customer => {
      const totalCreditSales = customer.sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
      const totalAmountPaidOnCreditSales = customer.sales.reduce((sum, sale) => sum + Number(sale.amountReceived || 0), 0);
      const totalRepayments = customer.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

      const totalOwed = totalCreditSales - totalAmountPaidOnCreditSales - totalRepayments;

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        totalOwed: Math.max(0, totalOwed),
        lastPaymentDate: customer.payments.length > 0 ? customer.payments[customer.payments.length - 1].createdAt : null,
        creditLimit: Number(customer.creditLimit || 0)
      };
    }).filter(d => d.totalOwed > 0);

    res.json(debtorStats);
  } catch (error) {
    console.error('Fetch Debtors Error:', error);
    res.status(500).json({ error: 'Failed to fetch debtors' });
  }
};

export const getCustomerDebtDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          where: { paymentMethod: 'CREDIT' },
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch debt details' });
  }
};

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { customerId, amount, method, note } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({ error: 'Customer ID and amount are required' });
    }

    const payment = await prisma.customerPayment.create({
      data: {
        customerId,
        amount: Number(amount),
        method: method || 'CASH',
        note: note || '',
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
};
