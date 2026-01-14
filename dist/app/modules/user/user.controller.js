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
const ApiErrors_1 = require("../../../errors/ApiErrors");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const responseHandler_1 = __importDefault(require("../../../utils/responseHandler"));
const user_service_1 = require("./user.service");
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
const getMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const phoneNo = (_a = req.user) === null || _a === void 0 ? void 0 : _a.contactNo;
    if (!phoneNo) {
        throw new ApiErrors_1.ApiError(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    }
    const user = yield user_service_1.UserService.getMyProfile(phoneNo);
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
    });
}));
const updateMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const phoneNo = (_b = req.user) === null || _b === void 0 ? void 0 : _b.contactNo;
    if (!phoneNo) {
        throw new ApiErrors_1.ApiError(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    }
    const user = yield user_service_1.UserService.updateMyProfile(phoneNo, req.body);
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Profile updated successfully',
        data: user,
    });
}));
const changePin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const phoneNo = (_c = req.user) === null || _c === void 0 ? void 0 : _c.contactNo;
    if (!phoneNo) {
        throw new ApiErrors_1.ApiError(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    }
    const { oldPin, newPin } = req.body;
    if (!oldPin || !newPin) {
        throw new ApiErrors_1.ApiError(http_status_1.default.BAD_REQUEST, 'Old PIN and new PIN are required');
    }
    if (newPin.length !== 5) {
        throw new ApiErrors_1.ApiError(http_status_1.default.BAD_REQUEST, 'PIN must be exactly 5 digits');
    }
    yield user_service_1.UserService.changePin(phoneNo, oldPin, newPin);
    (0, responseHandler_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'PIN changed successfully',
        data: null,
    });
}));
exports.UserController = {
    getPendingAgents,
    approveAgent,
    getBalance,
    manageUsers,
    blockUser,
    getMyProfile,
    updateMyProfile,
    changePin,
};
