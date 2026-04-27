"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// app.get("/", (req, res) => {
//   res.send("ROOT WORKS");
// });
app.get("/", (req, res) => {
    res.json({ message: "API is working" });
});
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const saleRoutes_1 = __importDefault(require("./routes/saleRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const debtRoutes_1 = __importDefault(require("./routes/debtRoutes"));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/customers', customerRoutes_1.default);
app.use('/api/debt', debtRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/sales', saleRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Inventory API is running' });
});
app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server is running on port ${port} (Network Accessible)`);
});
