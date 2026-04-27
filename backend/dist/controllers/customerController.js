"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomers = void 0;
const prisma_1 = require("../utils/prisma");
const getCustomers = async (req, res) => {
    try {
        const customers = await prisma_1.prisma.customer.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { sales: true }
                }
            }
        });
        res.json(customers);
    }
    catch (error) {
        console.error('Fetch Customers Error:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};
exports.getCustomers = getCustomers;
const createCustomer = async (req, res) => {
    try {
        const { name, email, phone, address, creditLimit } = req.body;
        if (!name)
            return res.status(400).json({ error: 'Name is required' });
        const customer = await prisma_1.prisma.customer.create({
            data: {
                name,
                email,
                phone,
                address,
                creditLimit: creditLimit ? Number(creditLimit) : null,
            },
        });
        res.json(customer);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Customer with this phone number already exists' });
        }
        res.status(500).json({ error: 'Failed to create customer' });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, creditLimit } = req.body;
        const customer = await prisma_1.prisma.customer.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                address,
                creditLimit: creditLimit ? Number(creditLimit) : null,
            },
        });
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update customer' });
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.customer.delete({ where: { id } });
        res.json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete customer' });
    }
};
exports.deleteCustomer = deleteCustomer;
