"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../modules/auth/auth.route");
const transaction_routes_1 = require("../modules/transaction/transaction.routes");
const user_routes_1 = require("../modules/user/user.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    { path: '/auth', route: auth_route_1.AuthRoutes },
    { path: '/transactions', route: transaction_routes_1.TreansactionRoutes },
    { path: '/users', route: user_routes_1.UserRoutes },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
