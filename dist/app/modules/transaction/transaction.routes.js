"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreansactionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const transaction_controller_1 = require("./transaction.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
// User/Agent
router.post('/send', (0, auth_1.default)(user_1.ENUM_USER_ROLE.USER), transaction_controller_1.TransactionController.sendMoney);
router.post("/cash-in", transaction_controller_1.TransactionController.cashIn);
router.post("/agent-cash-in", transaction_controller_1.TransactionController.agentCashIn);
router.post('/cash-out', (0, auth_1.default)(user_1.ENUM_USER_ROLE.USER), transaction_controller_1.TransactionController.cashOut);
router.get('/', 
// auth(ENUM_USER_ROLE.USER),
// auth(ENUM_USER_ROLE.ADMIN),
// auth(ENUM_USER_ROLE.AGENT),
transaction_controller_1.TransactionController.getHistory);
// Admin
router.get('/admin/transactions', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN), transaction_controller_1.TransactionController.adminGetTransactions);
exports.TreansactionRoutes = router;
