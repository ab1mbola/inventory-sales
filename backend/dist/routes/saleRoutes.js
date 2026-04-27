"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const saleController_1 = require("../controllers/saleController");
const router = (0, express_1.Router)();
router.get('/', saleController_1.getSales);
router.post('/', saleController_1.createSale);
exports.default = router;
