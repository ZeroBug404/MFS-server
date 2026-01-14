"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_controller_1 = require("./user.controller");
const router = express_1.default.Router();
router.get('/balance', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN), user_controller_1.UserController.getBalance);
router.get('/manage', user_controller_1.UserController.manageUsers);
// User Profile Routes (authenticated users)
router.get('/profile/me', (0, auth_1.default)(user_1.ENUM_USER_ROLE.USER, user_1.ENUM_USER_ROLE.AGENT, user_1.ENUM_USER_ROLE.ADMIN), user_controller_1.UserController.getMyProfile);
router.patch('/profile/me', (0, auth_1.default)(user_1.ENUM_USER_ROLE.USER, user_1.ENUM_USER_ROLE.AGENT, user_1.ENUM_USER_ROLE.ADMIN), user_controller_1.UserController.updateMyProfile);
router.patch('/profile/change-pin', (0, auth_1.default)(user_1.ENUM_USER_ROLE.USER, user_1.ENUM_USER_ROLE.AGENT, user_1.ENUM_USER_ROLE.ADMIN), user_controller_1.UserController.changePin);
// Admin Routes
router.patch('/admin/agents/:id/approve', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN), user_controller_1.UserController.approveAgent);
router.patch('/admin/:id/block', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN), user_controller_1.UserController.blockUser);
exports.UserRoutes = router;
