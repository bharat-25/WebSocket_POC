"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouters = void 0;
const express_1 = __importDefault(require("express"));
const express_2 = require("express");
const user_controller_1 = require("../controller/user.controller");
const userRoute = express_1.default.Router();
class UserRouter {
    constructor() {
        this.router = (0, express_2.Router)();
    }
    userRouter() {
        this.router.post("/register", user_controller_1.userController.register);
        this.router.post("/login", user_controller_1.userController.login);
        return this.router;
    }
}
exports.userRouters = new UserRouter();
