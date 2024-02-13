"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouters = void 0;
const express_1 = __importDefault(require("express"));
const express_2 = require("express");
const chat_controller_1 = require("../controller/chat.controller");
const chatRoute = express_1.default.Router();
class ChatRouter {
    constructor() {
        this.router = (0, express_2.Router)();
    }
    chatRouter() {
        this.router.get("/", chat_controller_1.chatController.chat);
        return this.router;
    }
}
exports.chatRouters = new ChatRouter();
