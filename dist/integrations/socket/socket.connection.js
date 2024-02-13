"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const socket_controller_1 = require("../../controller/socket.controller");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const port = process.env.SOCKET_PORT;
app.use(express_1.default.json());
const SOCKET = async () => {
    try {
        // Serve the chat application
        app.use("/chat", express_1.default.static(path_1.default.join(process.cwd(), "/public")));
        // Handle socket connection
        (0, socket_controller_1.handleSocketConnection)(io);
        server.listen(port, () => {
            console.log(`Socket.io server listening on port: ${port}`);
        });
    }
    catch (error) {
        console.error("Socket connection Error", error);
    }
};
exports.SOCKET = SOCKET;
