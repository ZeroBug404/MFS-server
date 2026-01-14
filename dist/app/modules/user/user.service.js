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
exports.UserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiErrors_1 = require("../../../errors/ApiErrors");
const user_model_1 = require("./user.model");
const email_service_1 = require("../../../services/email.service");
const getPendingAgents = () => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.User.find({ role: 'agent', isApproved: false });
});
const approveAgent = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield user_model_1.User.findByIdAndUpdate(agentId, { $set: { isApproved: true } }, { new: true });
    if (!agent)
        throw new Error('Agent not found');
    // Send approval email
    try {
        yield email_service_1.EmailService.sendAgentApprovalEmail(agent.email, agent.name);
    }
    catch (error) {
        console.error('Failed to send agent approval email:', error);
    }
    return agent;
});
const getBalance = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(data.userId).select('balance income');
    if (data.role === 'admin') {
        const totalSystemBalance = yield user_model_1.User.aggregate([
            { $group: { _id: null, total: { $sum: '$balance' } } },
        ]);
        return totalSystemBalance[0];
    }
    return user === null || user === void 0 ? void 0 : user.balance;
});
const getAllUsers = (search) => __awaiter(void 0, void 0, void 0, function* () {
    const query = search
        ? {
            $or: [
                { mobile: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ],
        }
        : {};
    return user_model_1.User.find(query);
});
const blockUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('isActive email name');
    if (!user)
        throw new ApiErrors_1.ApiError(http_status_1.default.NOT_FOUND, 'User not found');
    const newStatus = user.isActive === false;
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, { $set: { isActive: newStatus } }, { new: true });
    // Send status change email
    try {
        yield email_service_1.EmailService.sendAccountStatusEmail(user.email, user.name, newStatus ? 'unblocked' : 'blocked');
    }
    catch (error) {
        console.error('Failed to send account status email:', error);
    }
    return updatedUser;
});
const getMyProfile = (phoneNo) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ phoneNo }).select('-pin');
    if (!user)
        throw new ApiErrors_1.ApiError(http_status_1.default.NOT_FOUND, 'User not found');
    return user;
});
const updateMyProfile = (phoneNo, data) => __awaiter(void 0, void 0, void 0, function* () {
    const updateData = {};
    if (data.name)
        updateData.name = data.name;
    if (data.email)
        updateData.email = data.email;
    if (Object.keys(updateData).length === 0) {
        throw new ApiErrors_1.ApiError(http_status_1.default.BAD_REQUEST, 'No fields to update');
    }
    const user = yield user_model_1.User.findOneAndUpdate({ phoneNo }, { $set: updateData }, {
        new: true,
        runValidators: true,
    }).select('-pin');
    if (!user)
        throw new ApiErrors_1.ApiError(http_status_1.default.NOT_FOUND, 'User not found');
    return user;
});
const changePin = (phoneNo, oldPin, newPin) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ phoneNo });
    if (!user)
        throw new ApiErrors_1.ApiError(http_status_1.default.NOT_FOUND, 'User not found');
    // Verify old PIN
    const isPinMatched = yield user_model_1.User.isPasswordMatched(oldPin, user.pin);
    if (!isPinMatched) {
        throw new ApiErrors_1.ApiError(http_status_1.default.UNAUTHORIZED, 'Current PIN is incorrect');
    }
    // Update to new PIN
    user.pin = newPin;
    yield user.save();
    // Send PIN change confirmation email
    try {
        yield email_service_1.EmailService.sendPinChangeEmail(user.email, user.name);
    }
    catch (error) {
        console.error('Failed to send PIN change email:', error);
    }
    return { success: true };
});
exports.UserService = {
    getPendingAgents,
    approveAgent,
    getBalance,
    getAllUsers,
    blockUser,
    getMyProfile,
    updateMyProfile,
    changePin,
};
