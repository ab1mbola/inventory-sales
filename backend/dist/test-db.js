"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./utils/prisma");
async function main() {
    try {
        const categories = await prisma_1.prisma.category.findMany();
        console.log('Connected! Categories count:', categories.length);
    }
    catch (e) {
        console.error('Failed to connect:', e);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
main();
