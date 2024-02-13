"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../model/user.model");
class UserService {
    constructor() {
        this.bcryptSaltRounds = 5;
        this.jwtSecret = process.env.Access_JWT_SECRET;
        this.jwtExpiration = process.env.JWT_TIME;
    }
    async register(userData) {
        try {
            const { name, email, password, phone_number } = userData;
            const encryptPass = await bcrypt_1.default.hash(password, this.bcryptSaltRounds);
            const registerdata = new user_model_1.UserModel({
                name,
                email,
                password: encryptPass,
                phone_number,
            });
            await registerdata.save();
            return registerdata;
        }
        catch (error) {
            console.error("Error in UserService - register:", error);
            throw new Error("Failed to register user");
        }
    }
    ;
    async login(userID, email) {
        try {
            const token = jsonwebtoken_1.default.sign({ userID, email }, this.jwtSecret, {
                expiresIn: this.jwtExpiration,
            });
            return token;
        }
        catch (error) {
            console.error("Error in UserService - login:", error.message);
            throw new Error("Failed to generate login token");
        }
    }
}
exports.userService = new UserService();
