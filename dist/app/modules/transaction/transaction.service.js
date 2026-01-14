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
exports.TransactionService = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const email_service_1 = require("../../../services/email.service");
const transaction_model_1 = require("../transaction/transaction.model");
const user_model_1 = require("../user/user.model");
const sendMoney = (senderId, recipientPhone, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const sender = yield user_model_1.User.findById(senderId).session(session);
        const recipient = yield user_model_1.User.findOne({ phoneNo: recipientPhone }).session(session);
        // Validation and fee calculation
        if (amount < 50)
            throw new Error('Minimum amount is 50 Taka');
        const fee = amount > 100 ? 5 : 0;
        const totalDeduct = amount + fee;
        // Update admin earnings
        const admin = yield user_model_1.User.findOne({ role: 'admin' }).session(session);
        if (!admin)
            throw new Error('Admin not found');
        // Create transaction
        const transaction = new transaction_model_1.Transaction({
            from: senderId,
            to: recipient._id,
            amount,
            fee,
            adminEarnings: fee,
            type: 'send',
            transactionId: (0, uuid_1.v4)(),
        });
        const [updatedSender, updatedRecipient] = yield Promise.all([
            user_model_1.User.findByIdAndUpdate(senderId, { $inc: { balance: -totalDeduct } }, { session, new: true }),
            user_model_1.User.findByIdAndUpdate(recipient._id, { $inc: { balance: amount } }, { session, new: true }),
            user_model_1.User.findByIdAndUpdate(admin._id, { $inc: { balance: fee } }, { session, new: true }),
            transaction.save({ session }),
        ]);
        yield session.commitTransaction();
        // Send email notifications (don't block if email fails)
        try {
            const currentDate = new Date().toLocaleString();
            // Email to sender
            yield email_service_1.EmailService.sendTransactionEmail(sender.email, sender.name, {
                type: 'send',
                amount,
                recipientName: recipient.name,
                fee,
                newBalance: updatedSender.balance,
                transactionId: transaction.transactionId,
                date: currentDate,
            });
            // Email to recipient
            yield email_service_1.EmailService.sendTransactionEmail(recipient.email, recipient.name, {
                type: 'receive',
                amount,
                senderName: sender.name,
                newBalance: updatedRecipient.balance,
                transactionId: transaction.transactionId,
                date: currentDate,
            });
        }
        catch (error) {
            console.error('Failed to send transaction emails:', error);
        }
        return transaction;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const cashIn = (agentId, userPhone, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const agent = yield user_model_1.User.findById(agentId).session(session);
        const user = yield user_model_1.User.findOne({ phoneNo: userPhone }).session(session);
        if (!agent || !user)
            throw new Error('Invalid agent or user');
        if (agent.balance < amount)
            throw new Error('Agent insufficient balance');
        // Create transaction
        const transaction = new transaction_model_1.Transaction({
            from: agentId,
            to: user._id,
            amount,
            fee: 0,
            adminEarnings: 0,
            type: 'cash-in',
            transactionId: (0, uuid_1.v4)(),
        });
        yield Promise.all([
            user_model_1.User.findByIdAndUpdate(agentId, { $inc: { balance: -amount } }, { session, new: true }),
            user_model_1.User.findByIdAndUpdate(user._id, { $inc: { balance: amount } }, { session, new: true }),
            transaction.save({ session }),
        ]);
        yield session.commitTransaction();
        return transaction;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const agentCashIn = (adminId, userPhone, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.User.findOne({ phoneNo: userPhone }).session(session);
        if (!user)
            throw new Error('Invalid agent or user');
        // Create transaction
        const transaction = new transaction_model_1.Transaction({
            from: adminId,
            to: user._id,
            amount,
            fee: 0,
            adminEarnings: 0,
            type: 'cash-in',
            transactionId: (0, uuid_1.v4)(),
        });
        yield Promise.all([
            user_model_1.User.findByIdAndUpdate(user._id, { $inc: { balance: amount } }, { session, new: true }),
            transaction.save({ session }),
        ]);
        yield session.commitTransaction();
        return transaction;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const cashOut = (userId, agentPhone, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.User.findById(userId).session(session);
        // console.log(agentPhone, userId, amount);
        const agent = yield user_model_1.User.findOne({
            phoneNo: agentPhone,
            role: 'agent',
            isApproved: true,
        }).session(session);
        console.log(agent, 'agent');
        if (!user || !agent)
            throw new Error('Invalid user or agent');
        const fee = amount * 0.015;
        const totalDeduct = amount + fee;
        if (user.balance < totalDeduct)
            throw new Error('Insufficient balance');
        // Update admin
        const admin = yield user_model_1.User.findOne({ role: 'admin' }).session(session);
        if (!admin)
            throw new Error('Admin not found');
        const agentAmount = amount - amount * 0.01; // Agent keeps 99%
        const agentIncome = amount * 0.01; // Agent earns 1%
        const adminEarnings = amount * 0.005 + 5; // 0.5% + fixed 5 Taka
        // Create transaction
        const transaction = new transaction_model_1.Transaction({
            from: userId,
            to: agent._id,
            amount,
            fee,
            adminEarnings,
            type: 'cash-out',
            transactionId: (0, uuid_1.v4)(),
        });
        yield Promise.all([
            user_model_1.User.findByIdAndUpdate(userId, { $inc: { balance: -totalDeduct } }, { session, new: true }),
            user_model_1.User.findByIdAndUpdate(agent._id, { $inc: { balance: agentAmount, income: agentIncome } }, { session, new: true }),
            user_model_1.User.findByIdAndUpdate(admin._id, { $inc: { balance: adminEarnings } }, { session, new: true }),
            transaction.save({ session }),
        ]);
        yield session.commitTransaction();
        return transaction;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const getTransactions = (data, limit = 100) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = data.userId;
    if (!userId) {
        return [];
    }
    return transaction_model_1.Transaction.find({
        $or: [{ from: userId }, { to: userId }],
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('from to', 'name phoneNo role');
});
exports.TransactionService = {
    sendMoney,
    cashIn,
    agentCashIn,
    cashOut,
    getTransactions,
};
