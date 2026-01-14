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
exports.AuthService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const ApiErrors_1 = require("../../../errors/ApiErrors");
const jwtHelper_1 = require("../../../helper/jwtHelper");
const email_service_1 = require("../../../services/email.service");
const user_model_1 = require("../user/user.model");
const register = (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data.role === 'user')
        data.balance = 40;
    if (data.role === 'agent')
        data.balance = 100000;
    const result = yield user_model_1.User.create(data);
    // Send welcome email (don't block registration if email fails)
    try {
        yield email_service_1.EmailService.sendWelcomeEmail(result.email, result.name, result.role);
    }
    catch (error) {
        console.error('Failed to send welcome email:', error);
        // Continue with registration even if email fails
    }
    // Validate JWT configuration before creating tokens
    if (!config_1.default.jwt.secret || !config_1.default.jwt.refresh_secret) {
        throw new ApiErrors_1.ApiError(http_status_1.default.INTERNAL_SERVER_ERROR, 'JWT configuration is missing. Please check your environment variables.');
    }
    if (!config_1.default.jwt.expires_in || !config_1.default.jwt.refresh_expires_in) {
        throw new ApiErrors_1.ApiError(http_status_1.default.INTERNAL_SERVER_ERROR, 'JWT expiration configuration is missing. Please check your environment variables.');
    }
    const accessToken = jwtHelper_1.jwtHelpers.createToken({ contactNo: data.phoneNo, role: data.role }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelper_1.jwtHelpers.createToken({ contactNo: data.phoneNo, role: data.role }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNo, pin } = payload;
    const isUserExist = yield user_model_1.User.findOne({ phoneNo }).select('phoneNo pin role isActive');
    if (!isUserExist) {
        throw new ApiErrors_1.ApiError(http_status_1.default.NOT_FOUND, 'User does not exist');
    }
    if (isUserExist.isActive === false) {
        throw new ApiErrors_1.ApiError(http_status_1.default.FORBIDDEN, 'Your account has been blocked. Please contact support.');
    }
    if (isUserExist.pin &&
        !(yield user_model_1.User.isPasswordMatched(pin, isUserExist.pin))) {
        throw new ApiErrors_1.ApiError(http_status_1.default.UNAUTHORIZED, 'PIN is incorrect');
    }
    // Validate JWT configuration before creating tokens
    if (!config_1.default.jwt.secret || !config_1.default.jwt.refresh_secret) {
        throw new ApiErrors_1.ApiError(http_status_1.default.INTERNAL_SERVER_ERROR, 'JWT configuration is missing. Please check your environment variables.');
    }
    if (!config_1.default.jwt.expires_in || !config_1.default.jwt.refresh_expires_in) {
        throw new ApiErrors_1.ApiError(http_status_1.default.INTERNAL_SERVER_ERROR, 'JWT expiration configuration is missing. Please check your environment variables.');
    }
    //create access token & refresh token
    const { phoneNo: contactNo, role } = isUserExist;
    const accessToken = jwtHelper_1.jwtHelpers.createToken({ contactNo, role }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelper_1.jwtHelpers.createToken({ contactNo, role }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    //verify token
    // invalid token - synchronous
    let verifiedToken = null;
    try {
        verifiedToken = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.jwt.refresh_secret);
    }
    catch (err) {
        throw new ApiErrors_1.ApiError(http_status_1.default.FORBIDDEN, 'Invalid Refresh Token');
    }
    const { phoneNo } = verifiedToken;
    // checking deleted user's refresh token
    const isUserExist = yield user_model_1.User.isUserExist(phoneNo);
    if (!isUserExist) {
        throw new ApiErrors_1.ApiError(http_status_1.default.NOT_FOUND, 'User does not exist');
    }
    //generate new token
    const newAccessToken = jwtHelper_1.jwtHelpers.createToken({
        phoneNo: isUserExist.phoneNo,
        role: isUserExist.role,
    }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    return {
        accessToken: newAccessToken,
    };
});
exports.AuthService = {
    register,
    loginUser,
    refreshToken,
};
