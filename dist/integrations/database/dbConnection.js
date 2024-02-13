"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_connection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require("../../config/env");
const appConfig_1 = __importDefault(require("../../config/appConfig"));
const url = appConfig_1.default.env.DB_URL;
console.log("-------------->url is------__>", url);
const DB_connection = async () => {
    try {
        await mongoose_1.default.connect(url);
        console.log("Succesfully connected to the database");
    }
    catch (e) {
        console.log("Database connection Error");
    }
};
exports.DB_connection = DB_connection;
