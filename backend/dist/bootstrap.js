"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma_1 = require("./utils/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function bootstrap() {
    const email = 'admin@inventory.com';
    const password = 'password123';
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    try {
        const user = await prisma_1.prisma.user.upsert({
            where: { email },
            update: { password: hashedPassword },
            create: {
                email,
                password: hashedPassword,
                name: 'Admin User',
                role: 'OWNER'
            }
        });
        console.log('Admin user bootstrapped:', user.email);
    }
    catch (error) {
        console.error('Bootstrap failed:', error);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
bootstrap();
