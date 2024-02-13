"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("../service/user.service");
const user_model_1 = require("../model/user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserController {
    // constructor() {
    //   // Bind methods to the instance of the class
    //   this.register = this.register.bind(this);
    //   this.login = this.login.bind(this);
    //   this.handleError = this.handleError.bind(this);
    // }
    async register(req, res) {
        try {
            if (req.body == undefined) {
                res.status(400).json({ Message: "Pls enter the all details" });
            }
            const { name, email, password, phone_number } = req.body;
            const existingUser = await this.isUserExist(req.body.email);
            if (existingUser) {
                return res.status(400).json({ message: "User already exists with this email" });
            }
            const userData = req.body;
            const newUser = await user_service_1.userService.register(userData);
            console.log(newUser);
            res.status(201).json({ message: "User registered successfully", user: newUser });
        }
        catch (error) {
            console.error("An error occurred:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    async isUserExist(email) {
        try {
            return await user_model_1.UserModel.findOne({ email });
        }
        catch (error) {
            console.error("Error occurred in isUserExist:", error);
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await user_model_1.UserModel.findOne({ email: email });
            if (!user) {
                return res.status(401).json({ error: "User not found" });
            }
            const isValidPassword = await bcrypt_1.default.compare(password.toString(), user?.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: "Wrong Password" });
            }
            const userId = user._id;
            const userToken = await user_service_1.userService.login(userId, email);
            res.status(200).json({ message: "Successfully login", Access_token: userToken });
        }
        catch (error) {
            // this.handleError(res, error);
            console.error("An error occurred:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    ;
}
exports.UserController = UserController;
exports.userController = new UserController();
