"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
class ChatController {
    async chat(req, res) {
        try {
            res.sendFile(__dirname + '../../public/index.html');
        }
        catch (error) {
            console.error("Error:", error);
        }
    }
}
exports.chatController = new ChatController();
