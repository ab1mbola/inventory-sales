"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSale = exports.getSales = void 0;
const prisma_1 = require("../utils/prisma");
const getSales = async (req, res) => {
    try {
        const sales = await prisma_1.prisma.sale.findMany({
            include: {
                items: {
                    include: { product: true }
                },
                customer: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(sales);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
};
exports.getSales = getSales;
const createSale = async (req, res) => {
    try {
        const { items, paymentMethod, userId, amountReceived, changeAmount, customerName, customerPhone, customerId } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Sale must contain at least one item' });
        }
        const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        const totalCost = items.reduce((sum, item) => sum + (Number(item.cost) * Number(item.quantity)), 0);
        const sale = await prisma_1.prisma.$transaction(async (tx) => {
            const newSale = await tx.sale.create({
                data: {
                    totalAmount,
                    totalCost,
                    paymentMethod,
                    amountReceived: amountReceived ? Number(amountReceived) : null,
                    changeAmount: changeAmount ? Number(changeAmount) : null,
                    customerName: customerName || null,
                    customerPhone: customerPhone || null,
                    customerId: customerId || null,
                    userId: userId || null,
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            quantity: Number(item.quantity),
                            price: Number(item.price),
                            cost: Number(item.cost)
                        }))
                    }
                },
                include: {
                    items: {
                        include: { product: true }
                    },
                    customer: true
                }
            });
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stockLevel: { decrement: Number(item.quantity) } }
                });
            }
            return newSale;
        }, {
            maxWait: 20000,
            timeout: 20000
        });
        res.status(201).json(sale);
    }
    catch (error) {
        console.error('Sale creation error:', error);
        res.status(500).json({ error: 'Failed to process sale. Check stock levels or database connectivity.' });
    }
};
exports.createSale = createSale;
