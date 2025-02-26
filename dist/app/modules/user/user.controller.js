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
exports.UserController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const user_service_1 = require("./user.service");
const responseHandler_1 = __importDefault(require("../../../utils/responseHandler"));
const getPendingAgents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const agents = yield user_service_1.UserService.getPendingAgents();
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User created successfully',
        data: agents,
    });
});
const approveAgent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserService.approveAgent(req.params.id);
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User approved successfully',
        data: result,
    });
});
const getBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.query);
    const balance = yield user_service_1.UserService.getBalance(req.query);
    console.log(balance);
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `User balance is ${balance}`,
        data: balance,
    });
});
const manageUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_service_1.UserService.getAllUsers(req.query.search);
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User retrieved successfully',
        data: users,
    });
});
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_service_1.UserService.blockUser(req.params.id);
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Status changed successfully',
        data: user,
    });
});
exports.UserController = {
    getPendingAgents,
    approveAgent,
    getBalance,
    manageUsers,
    blockUser,
};
