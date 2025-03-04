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
exports.dbConnect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("../config/index"));
const logger_1 = require("./logger");
const dbConnect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!index_1.default.database_url) {
            logger_1.errorLog.error('❌ No MONGO_URI found in .env file');
            // process.exit(1)
        }
        yield mongoose_1.default.connect(index_1.default.database_url);
        logger_1.log.info(`🗄️  Database connected ❤️‍🔥`);
    }
    catch (err) {
        logger_1.errorLog.error(`❌ Error connecting to database: ${err}`);
    }
});
exports.dbConnect = dbConnect;
