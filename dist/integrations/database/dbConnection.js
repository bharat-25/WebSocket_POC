"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_connection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require("../../config/env");
const url = process.env.DB_CONNECTION_URL;
const DB_connection = async () => {
    try {
        await mongoose_1.default.connect(url);
        console.log("Succesfully connected to the database");
        // logger.log({level:"info",message:`Succesfully connected to the db`});
    }
    catch (e) {
        console.log("Database connection Error");
        // logger.log({level:"error",message:"ERRRRRR"});
    }
};
exports.DB_connection = DB_connection;
