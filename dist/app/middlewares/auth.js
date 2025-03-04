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
const http_status_1 = __importDefault(require("http-status"));
const ApiErrors_1 = require("../../errors/ApiErrors");
const config_1 = __importDefault(require("../../config"));
const jwtHelper_1 = require("../../helper/jwtHelper");
const auth = (...requiredRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //get authorization token from request --> headers
        const token = req.headers.authorization;
        if (!token) {
            throw new ApiErrors_1.ApiError(http_status_1.default.UNAUTHORIZED, 'You are not authorized');
        }
        let verifiedUser = null;
        // Verify Token
        verifiedUser = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.jwt.secret);
        console.log(verifiedUser);
        req.user = verifiedUser;
        if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
            throw new ApiErrors_1.ApiError(http_status_1.default.FORBIDDEN, 'Forbidden credentials');
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.default = auth;
