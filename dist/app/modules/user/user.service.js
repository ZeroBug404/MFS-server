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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
const getPendingAgents = () => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.User.find({ role: 'agent', isApproved: false });
});
const approveAgent = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield user_model_1.User.findByIdAndUpdate(agentId, { isApproved: true }, { new: true });
    if (!agent)
        throw new Error('Agent not found');
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
    const alreadyIsBlocked = yield user_model_1.User.findById(userId).select('isActive');
    if ((alreadyIsBlocked === null || alreadyIsBlocked === void 0 ? void 0 : alreadyIsBlocked.isActive) === false) {
        return user_model_1.User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
    }
    return user_model_1.User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
});
exports.UserService = {
    getPendingAgents,
    approveAgent,
    getBalance,
    getAllUsers,
    blockUser,
};
