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
exports.TransactionStatisticsService = void 0;
const user_model_1 = require("../user/user.model");
const transaction_model_1 = require("./transaction.model");
const getUserDashboardStats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    // Get all user transactions
    const allTransactions = yield transaction_model_1.Transaction.find({
        $or: [{ from: userId }, { to: userId }],
    })
        .sort({ createdAt: -1 })
        .populate('from to', 'name phoneNo role')
        .lean();
    // Today's transactions count
    const todayTransactions = allTransactions.filter(t => new Date(t.createdAt) >= today).length;
    // Monthly spending (money sent + fees)
    const monthlySpending = allTransactions
        .filter(t => new Date(t.createdAt) >= thisMonth && t.from.toString() === userId)
        .reduce((sum, t) => sum + t.amount + (t.fee || 0), 0);
    // Transaction history for chart (last 24 hours, grouped by 4-hour intervals)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const chartData = [];
    for (let i = 0; i < 6; i++) {
        const startTime = new Date(last24Hours.getTime() + i * 4 * 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
        const amount = allTransactions
            .filter(t => new Date(t.createdAt) >= startTime && new Date(t.createdAt) < endTime)
            .reduce((sum, t) => sum + t.amount, 0);
        chartData.push({
            time: startTime.getHours().toString().padStart(2, '0') + ':00',
            amount,
        });
    }
    // Recent transactions (last 10)
    const recentTransactions = allTransactions.slice(0, 10).map((t) => {
        var _a, _b, _c, _d;
        const isSender = ((_b = (_a = t.from) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) === userId;
        return {
            id: t._id,
            type: isSender ? 'send' : 'receive',
            amount: t.amount,
            recipient: ((_c = t.to) === null || _c === void 0 ? void 0 : _c.name) || '',
            sender: ((_d = t.from) === null || _d === void 0 ? void 0 : _d.name) || '',
            time: getTimeAgo(t.createdAt),
            status: 'completed',
        };
    });
    return {
        todayTransactions,
        monthlySpending,
        chartData,
        recentTransactions,
    };
});
const getAgentDashboardStats = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const agent = yield user_model_1.User.findById(agentId).select('income balance');
    // Get all agent transactions
    const allTransactions = yield transaction_model_1.Transaction.find({
        $or: [{ from: agentId }, { to: agentId }],
    })
        .sort({ createdAt: -1 })
        .populate('from to', 'name phoneNo role')
        .lean();
    // Today's transactions count
    const todayTransactions = allTransactions.filter(t => new Date(t.createdAt) >= today).length;
    // Commission earned
    const commissionEarned = (agent === null || agent === void 0 ? void 0 : agent.income) || 0;
    // Transaction history for chart
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const chartData = [];
    for (let i = 0; i < 6; i++) {
        const startTime = new Date(last24Hours.getTime() + i * 4 * 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
        const amount = allTransactions
            .filter(t => new Date(t.createdAt) >= startTime && new Date(t.createdAt) < endTime)
            .reduce((sum, t) => sum + t.amount, 0);
        chartData.push({
            time: startTime.getHours().toString().padStart(2, '0') + ':00',
            amount,
        });
    }
    // Recent transactions
    const recentTransactions = allTransactions.slice(0, 10).map((t) => {
        var _a, _b, _c, _d;
        const isSender = ((_b = (_a = t.from) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) === agentId;
        return {
            id: t._id,
            type: isSender ? 'send' : 'receive',
            amount: t.amount,
            recipient: ((_c = t.to) === null || _c === void 0 ? void 0 : _c.name) || '',
            sender: ((_d = t.from) === null || _d === void 0 ? void 0 : _d.name) || '',
            time: getTimeAgo(t.createdAt),
            status: 'completed',
        };
    });
    return {
        todayTransactions,
        commissionEarned,
        cashBalance: (agent === null || agent === void 0 ? void 0 : agent.balance) || 0,
        chartData,
        recentTransactions,
    };
});
const getAdminDashboardStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);
    // Total users (exclude admin)
    const totalUsers = yield user_model_1.User.countDocuments({ role: { $ne: 'admin' } });
    // Users from last month for growth calculation
    const usersLastMonth = yield user_model_1.User.countDocuments({
        role: { $ne: 'admin' },
        createdAt: { $lt: lastMonth },
    });
    // Calculate user growth percentage
    const userGrowth = usersLastMonth > 0
        ? (((totalUsers - usersLastMonth) / usersLastMonth) * 100).toFixed(1)
        : '0.0';
    // Active agents
    const activeAgents = yield user_model_1.User.countDocuments({
        role: 'agent',
        isApproved: true,
        isActive: true,
    });
    // System revenue (total balance in system)
    const systemBalance = yield user_model_1.User.aggregate([
        { $group: { _id: null, total: { $sum: '$balance' } } },
    ]);
    const currentRevenue = ((_a = systemBalance[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    // Get revenue from last month (approximation based on transaction volume)
    const allTransactions = yield transaction_model_1.Transaction.find()
        .sort({ createdAt: -1 })
        .populate('from to', 'name phoneNo role')
        .lean();
    const lastMonthRevenue = allTransactions
        .filter(t => new Date(t.createdAt) >= lastMonth && new Date(t.createdAt) < today)
        .reduce((sum, t) => sum + (t.adminEarnings || 0), 0);
    const previousMonthRevenue = allTransactions
        .filter(t => new Date(t.createdAt) < lastMonth)
        .reduce((sum, t) => sum + (t.adminEarnings || 0), 0);
    // Calculate revenue growth percentage
    const revenueGrowth = previousMonthRevenue > 0
        ? (((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
            100).toFixed(1)
        : '0.0';
    // Today's transactions count
    const todayTransactions = allTransactions.filter(t => new Date(t.createdAt) >= today).length;
    // Calculate system health (based on successful transactions, active users, etc.)
    const totalTransactions = allTransactions.length;
    const activeUsers = yield user_model_1.User.countDocuments({ isActive: true });
    const totalRegisteredUsers = yield user_model_1.User.countDocuments();
    // System health calculation:
    // - 40% based on active users ratio
    // - 30% based on transaction success rate (assuming all are successful)
    // - 30% based on agent approval rate
    const activeUserRatio = totalRegisteredUsers > 0 ? activeUsers / totalRegisteredUsers : 1;
    const transactionSuccessRate = 1; // All transactions in DB are successful
    const approvedAgents = yield user_model_1.User.countDocuments({
        role: 'agent',
        isApproved: true,
    });
    const totalAgents = yield user_model_1.User.countDocuments({ role: 'agent' });
    const agentApprovalRatio = totalAgents > 0 ? approvedAgents / totalAgents : 1;
    const systemHealth = (activeUserRatio * 40 +
        transactionSuccessRate * 30 +
        agentApprovalRatio * 30).toFixed(1);
    // Transaction history for chart
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const chartData = [];
    for (let i = 0; i < 6; i++) {
        const startTime = new Date(last24Hours.getTime() + i * 4 * 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
        const amount = allTransactions
            .filter(t => new Date(t.createdAt) >= startTime && new Date(t.createdAt) < endTime)
            .reduce((sum, t) => sum + t.amount, 0);
        chartData.push({
            time: startTime.getHours().toString().padStart(2, '0') + ':00',
            amount,
        });
    }
    return {
        totalUsers,
        activeAgents,
        systemRevenue: currentRevenue,
        todayTransactions,
        chartData,
        userGrowth: parseFloat(userGrowth),
        revenueGrowth: parseFloat(revenueGrowth),
        systemHealth: parseFloat(systemHealth),
    };
});
const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
    }
    else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
};
// System Metrics for Admin (detailed analytics for the Metrics page)
const getSystemMetrics = (timeRange = '7d') => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    // Calculate time range
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
        case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    // Get all transactions in the time range
    const allTransactions = yield transaction_model_1.Transaction.find({
        createdAt: { $gte: startDate },
    })
        .populate('from', 'name role _id')
        .populate('to', 'name role _id')
        .lean();
    // Total Volume
    const totalVolume = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    // Previous period volume for growth calculation
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousTransactions = yield transaction_model_1.Transaction.find({
        createdAt: { $gte: previousPeriodStart, $lt: startDate },
    }).lean();
    const previousVolume = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
    const volumeGrowth = previousVolume > 0
        ? parseFloat((((totalVolume - previousVolume) / previousVolume) * 100).toFixed(1))
        : 0;
    // Active Users (users who made transactions in the time range)
    const activeUserIds = new Set(allTransactions
        .map((t) => { var _a, _b; return typeof t.from === 'string' ? t.from : (_b = (_a = t.from) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString(); })
        .filter(Boolean));
    const activeUsers = activeUserIds.size;
    const previousActiveUserIds = new Set(previousTransactions
        .map((t) => { var _a, _b; return typeof t.from === 'string' ? t.from : (_b = (_a = t.from) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString(); })
        .filter(Boolean));
    const previousActiveUsers = previousActiveUserIds.size;
    const activeUsersGrowth = previousActiveUsers > 0
        ? parseFloat((((activeUsers - previousActiveUsers) / previousActiveUsers) *
            100).toFixed(1))
        : 0;
    // Success Rate (all transactions in DB are successful)
    const successRate = 100.0;
    const successRateChange = 0.0;
    // Revenue (admin earnings)
    const revenue = allTransactions.reduce((sum, t) => sum + (t.adminEarnings || 0), 0);
    const previousRevenue = previousTransactions.reduce((sum, t) => sum + (t.adminEarnings || 0), 0);
    const revenueGrowth = previousRevenue > 0
        ? parseFloat((((revenue - previousRevenue) / previousRevenue) * 100).toFixed(1))
        : 0;
    // Transaction Volume Chart Data (daily for 7d+, hourly for 24h)
    const isHourly = timeRange === '24h';
    const transactionVolumeData = [];
    if (isHourly) {
        // Hourly data for last 24 hours
        for (let i = 23; i >= 0; i--) {
            const hourStart = new Date(now);
            hourStart.setHours(now.getHours() - i, 0, 0, 0);
            const hourEnd = new Date(hourStart);
            hourEnd.setHours(hourStart.getHours() + 1);
            const hourTransactions = allTransactions.filter((t) => new Date(t.createdAt) >= hourStart && new Date(t.createdAt) < hourEnd);
            const amount = hourTransactions.reduce((sum, t) => sum + t.amount, 0);
            transactionVolumeData.push({
                date: hourStart.getHours() + ':00',
                amount,
            });
        }
    }
    else {
        // Daily data
        const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7;
        for (let i = days - 1; i >= 0; i--) {
            const dayStart = new Date(now);
            dayStart.setDate(now.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayStart.getDate() + 1);
            const dayTransactions = allTransactions.filter((t) => new Date(t.createdAt) >= dayStart && new Date(t.createdAt) < dayEnd);
            const amount = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
            const dateLabel = days === 7
                ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayStart.getDay()]
                : `${dayStart.getMonth() + 1}/${dayStart.getDate()}`;
            transactionVolumeData.push({
                date: dateLabel,
                amount,
            });
        }
    }
    // User Activity Data (active users per hour for 24h view, or per day)
    const userActivityData = [];
    if (isHourly) {
        for (let i = 23; i >= 0; i--) {
            const hourStart = new Date(now);
            hourStart.setHours(now.getHours() - i, 0, 0, 0);
            const hourEnd = new Date(hourStart);
            hourEnd.setHours(hourStart.getHours() + 1);
            const hourTransactions = allTransactions.filter((t) => new Date(t.createdAt) >= hourStart && new Date(t.createdAt) < hourEnd);
            const uniqueUsers = new Set(hourTransactions
                .map((t) => { var _a, _b; return typeof t.from === 'string' ? t.from : (_b = (_a = t.from) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString(); })
                .filter(Boolean)).size;
            userActivityData.push({
                time: hourStart.getHours() + ':00',
                users: uniqueUsers,
            });
        }
    }
    else {
        const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7;
        for (let i = days - 1; i >= 0; i--) {
            const dayStart = new Date(now);
            dayStart.setDate(now.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayStart.getDate() + 1);
            const dayTransactions = allTransactions.filter((t) => new Date(t.createdAt) >= dayStart && new Date(t.createdAt) < dayEnd);
            const uniqueUsers = new Set(dayTransactions
                .map((t) => { var _a, _b; return typeof t.from === 'string' ? t.from : (_b = (_a = t.from) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString(); })
                .filter(Boolean)).size;
            userActivityData.push({
                time: `${dayStart.getMonth() + 1}/${dayStart.getDate()}`,
                users: uniqueUsers,
            });
        }
    }
    // Revenue Distribution by transaction type
    const sendMoneyRevenue = allTransactions
        .filter((t) => t.type === 'send')
        .reduce((sum, t) => sum + (t.adminEarnings || 0), 0);
    const cashInRevenue = allTransactions
        .filter((t) => t.type === 'cash-in')
        .reduce((sum, t) => sum + (t.adminEarnings || 0), 0);
    const cashOutRevenue = allTransactions
        .filter((t) => t.type === 'cash-out')
        .reduce((sum, t) => sum + (t.adminEarnings || 0), 0);
    const totalRevenue = sendMoneyRevenue + cashInRevenue + cashOutRevenue;
    const revenueDistribution = [
        {
            name: 'Transfer Fees',
            value: totalRevenue > 0
                ? parseFloat(((sendMoneyRevenue / totalRevenue) * 100).toFixed(1))
                : 0,
        },
        {
            name: 'Cash In',
            value: totalRevenue > 0
                ? parseFloat(((cashInRevenue / totalRevenue) * 100).toFixed(1))
                : 0,
        },
        {
            name: 'Cash Out',
            value: totalRevenue > 0
                ? parseFloat(((cashOutRevenue / totalRevenue) * 100).toFixed(1))
                : 0,
        },
    ];
    // Agent Performance
    const agentTransactions = allTransactions.filter((t) => {
        const fromRole = typeof t.from === 'object' && t.from !== null && 'role' in t.from
            ? t.from.role
            : null;
        const toRole = typeof t.to === 'object' && t.to !== null && 'role' in t.to
            ? t.to.role
            : null;
        return fromRole === 'agent' || toRole === 'agent';
    });
    // Group by agent
    const agentStats = {};
    for (const transaction of agentTransactions) {
        const t = transaction;
        let agentId = null;
        let agentName = null;
        if (typeof t.from === 'object' &&
            t.from !== null &&
            'role' in t.from &&
            t.from.role === 'agent') {
            agentId =
                typeof t.from._id === 'string'
                    ? t.from._id
                    : ((_b = t.from._id) === null || _b === void 0 ? void 0 : _b.toString()) || null;
            agentName = t.from.name || 'Unknown';
        }
        else if (typeof t.to === 'object' &&
            t.to !== null &&
            'role' in t.to &&
            t.to.role === 'agent') {
            agentId =
                typeof t.to._id === 'string' ? t.to._id : ((_c = t.to._id) === null || _c === void 0 ? void 0 : _c.toString()) || null;
            agentName = t.to.name || 'Unknown';
        }
        if (agentId) {
            if (!agentStats[agentId]) {
                agentStats[agentId] = {
                    name: agentName || 'Unknown',
                    transactions: 0,
                    revenue: 0,
                };
            }
            agentStats[agentId].transactions++;
            agentStats[agentId].revenue += t.agentEarnings || 0;
        }
    }
    // Convert to array and get top 5
    const agentPerformance = Object.values(agentStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    return {
        totalVolume,
        volumeGrowth,
        activeUsers,
        activeUsersGrowth,
        successRate,
        successRateChange,
        revenue,
        revenueGrowth,
        transactionVolumeData,
        userActivityData,
        revenueDistribution,
        agentPerformance,
    };
});
exports.TransactionStatisticsService = {
    getUserDashboardStats,
    getAgentDashboardStats,
    getAdminDashboardStats,
    getSystemMetrics,
};
