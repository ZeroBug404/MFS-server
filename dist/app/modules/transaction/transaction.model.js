"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const TransactionSchema = new mongoose_1.Schema({
    from: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    to: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    fee: {
        type: Number,
        default: 0,
    },
    adminEarnings: {
        type: Number,
        default: 0,
    },
    type: {
        type: String,
        enum: ['send', 'cash-in', 'cash-out'],
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.Transaction = (0, mongoose_1.model)('Transaction', TransactionSchema);
