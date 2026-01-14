"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const responseHandler_1 = __importDefault(require("../../../utils/responseHandler"));
const transaction_model_1 = require("./transaction.model");
const transaction_service_1 = require("./transaction.service");
const transaction_statistics_service_1 = require("./transaction.statistics.service");
const sendMoney = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body, 'req.body');
    const result = yield transaction_service_1.TransactionService.sendMoney(req.body.senderId, req.body.recipientPhone, req.body.amount);
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Send money successfully',
        data: result,
    });
}));
const cashIn = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req.body, 'req.body');
    const result = yield transaction_service_1.TransactionService.cashIn(req.body.agentId, req.body.recipientPhone, req.body.amount);
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Cash-in successfully',
        data: result,
    });
}));
const agentCashIn = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req.body, 'req.body');
    const result = yield transaction_service_1.TransactionService.agentCashIn(req.body.adminId, req.body.recipientPhone, req.body.amount);
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Cash-in successfully',
        data: result,
    });
}));
const cashOut = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req.body, 'req.body');
    const result = yield transaction_service_1.TransactionService.cashOut(req.body.userId, req.body.agentPhone, req.body.amount);
    console.log(result, 'result');
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Cash-out successfully',
        data: result,
    });
}));
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.query);
    const transactions = yield transaction_service_1.TransactionService.getTransactions(req.query);
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User history get successfully',
        data: transactions,
    });
});
const adminGetTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield transaction_model_1.Transaction.find()
        .populate('from to', 'name mobile role')
        .sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
});
const getDashboardStats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.query.userId;
    const role = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || req.query.role;
    let stats;
    if (role === 'admin') {
        stats = yield transaction_statistics_service_1.TransactionStatisticsService.getAdminDashboardStats();
    }
    else if (role === 'agent') {
        stats = yield transaction_statistics_service_1.TransactionStatisticsService.getAgentDashboardStats(userId);
    }
    else {
        stats = yield transaction_statistics_service_1.TransactionStatisticsService.getUserDashboardStats(userId);
    }
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: stats,
    });
}));
const getSystemMetrics = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const timeRange = req.query.timeRange || '7d';
    const metrics = yield transaction_statistics_service_1.TransactionStatisticsService.getSystemMetrics(timeRange);
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'System metrics retrieved successfully',
        data: metrics,
    });
}));
exports.TransactionController = {
    sendMoney,
    cashIn,
    agentCashIn,
    cashOut,
    getHistory,
    adminGetTransactions,
    getDashboardStats,
    getSystemMetrics,
};
