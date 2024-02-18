"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSocketConnection = void 0;
const user_model_1 = require("../model/user.model");
const chat_model_1 = __importDefault(require("../model/chat.model"));
const producer_service_1 = require("../integrations/producer/kafka/producer.service");
const push_notification_1 = require("../service/fcm/push-notification");
const kafka_1 = require("../integrations/consumer/kafka");
const consumer_service_1 = require("../integrations/consumer/consumer.service");
class SocketHandler {
    constructor(io) {
        this.io = io;
        /**
         * Object to map user mobile numbers to socket IDs, track online status of users..
         * Instance of KafkaManager for Kafka integration.
         */
        this.socketIdByUserMobile = {};
        this.onlineUsers = {};
        this.kafka = new kafka_1.KafkaManager();
        this.init();
    }
    /**
    * Initializes socket connection.
    */
    init() {
        this.io.on("connection", (socket) => {
            this.handleConnection(socket);
        });
    }
    /**
     * Handles new socket connection.
     */
    async handleConnection(socket) {
        console.log("User connected with socket ID", socket.id);
        socket.on("new-user-connect", (data) => this.handleUserConnect(socket, data));
        socket.on("disconnect", () => this.handleDisconnect(socket));
        socket.on("private-chat", async ({ message }) => await this.handlePrivateChat(socket, message));
        socket.on("typing", (data) => this.handleTyping(data));
        socket.on("stopTyping", (data) => this.handleStopTyping(data));
    }
    /**
     * Handles new user connection.
     */
    async handleUserConnect(socket, data) {
        const { senderMobileNo } = data;
        socket.data = data;
        this.socketIdByUserMobile[senderMobileNo] = socket.id;
        this.onlineUsers[senderMobileNo] = true;
        console.log(`User with mobile number ${senderMobileNo} is connected with socket ID ${socket.id}`);
        // Check for any pending messages for this user and send push notifications
        // this.sendPendingMessages(senderMobileNo);
    }
    /**
     * Handles socket disconnect.
     */
    handleDisconnect(socket) {
        const userMobile = Object.entries(this.socketIdByUserMobile).find(([_, id]) => id === socket.id)?.[0];
        if (userMobile) {
            delete this.socketIdByUserMobile[userMobile];
            delete this.onlineUsers[userMobile];
            console.log(`User with mobile number ${userMobile} disconnected`);
        }
    }
    /**
     * Handles private chat between users.
     */
    async handlePrivateChat(socket, message) {
        try {
            console.log("----------INSIDE PRIVATE CHAT-------------------");
            const { senderMobileNo, receiverMobileNo } = socket.data;
            const [senderUser, receiverUser] = await Promise.all([
                user_model_1.UserModel.findOne({ phone_number: senderMobileNo }),
                user_model_1.UserModel.findOne({ phone_number: receiverMobileNo }),
            ]);
            if (!senderUser || !receiverUser) {
                console.error("User not found");
                return;
            }
            const chat = await chat_model_1.default.create({
                senderId: senderUser.id,
                receiverId: receiverUser ? receiverUser.id : null,
                message,
            });
            const pendingMsgData = {
                senderId: senderUser.id,
                receiverId: receiverUser.id,
                message,
            };
            const messageData = {
                senderName: senderUser.name.toString(),
                receiverName: receiverUser ? receiverUser.name.toString() : null,
                message,
            };
            const kafkaMessage = { value: JSON.stringify(messageData) };
            console.log(kafkaMessage);
            await producer_service_1.producer.produce("KAFKA-TOPIC-PRODUCER", kafkaMessage);
            console.log(`${messageData.senderName} sending to ${messageData.receiverName} MESSAGE:`, message);
            if (receiverUser) {
                console.log("---------INSIDE IF RECEIVER_USER--------------");
                const receiverSocketId = this.socketIdByUserMobile[receiverMobileNo];
                if (receiverSocketId) {
                    console.log("--------------INSIDE IF receiverSocketId-----------------");
                    await this.kafka.connectToAdmin();
                    await this.kafka.createTopics();
                    await this.kafka.disconnectFromAdmin();
                    await consumer_service_1.consumer.initiateConsumer();
                    this.io.to(receiverSocketId).emit("private-chat", messageData);
                }
                else {
                    console.log("------------OFFLINE RECEIVER-------------------");
                    // Receiver is offline, save the message as pending
                    await this.savePendingMessage(pendingMsgData);
                }
            }
            else {
                console.log("RECEIVER NOT FOUND");
                // Receiver not found, save the message as pending
                await this.savePendingMessage(pendingMsgData);
            }
        }
        catch (error) {
            console.error("Error processing private chat:", error);
        }
    }
    /**
       * Handles typing event.
       */
    handleTyping(data) {
        const receiverSocketId = this.socketIdByUserMobile[data.receiverMobileNo];
        if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("typing", data);
        }
    }
    /**
      * Handles stop typing event.
      */
    handleStopTyping(data) {
        const receiverSocketId = this.socketIdByUserMobile[data.receiverMobileNo];
        if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("stopTyping", data);
        }
    }
    /**
       * Saves pending message to the database.
       */
    async savePendingMessage(pendingMsgData) {
        try {
            console.log(pendingMsgData);
            console.log("-----------SavePendingMessage---------------");
            // Save the message as pending in the database
            const chat = await chat_model_1.default.create({
                senderId: pendingMsgData.senderId,
                receiverId: pendingMsgData.receiverId,
                message: pendingMsgData.message,
                delivered: false, // Mark the message as not delivered
            });
            console.log("Message saved as pending:", chat);
        }
        catch (error) {
            console.log("SavePendingMessage ERRORRRRRRRRRRRRRRRRRRRRR");
            console.error("Error saving pending message:", error);
            throw error;
        }
    }
    /**
     * Sends pending messages to a user.
     */
    async sendPendingMessages(receiverMobileNo) {
        try {
            const pendingMessages = await this.getPendingMessages(receiverMobileNo);
            // Get an instance of PushNotificationService
            const pushNotificationService = push_notification_1.PushNotificationService.getInstance();
            // Send push notifications for pending messages
            for (const messageData of pendingMessages) {
                await pushNotificationService.sendPushNotification(messageData.receiverMobileNo, { title: "New Message", body: messageData.message });
                // Update the message as delivered
                await chat_model_1.default.updateOne({ _id: messageData._id }, { $set: { delivered: true } });
                console.log("Push notification sent and message marked as delivered:", messageData);
            }
        }
        catch (error) {
            console.error("Error sending pending messages:", error);
            // throw error;
        }
    }
    /**
     * Retrieves pending messages for a user.
     */
    async getPendingMessages(receiverMobileNo) {
        try {
            console.log("---------->inside try----------->");
            // const pendingMessages = await ChatModel.find({ receiverMobileNo, delivered: false });
            this.kafka = new kafka_1.KafkaManager();
            await this.kafka.connectToAdmin();
            await this.kafka.createTopics();
            await this.kafka.disconnectFromAdmin();
            const consumerData = await consumer_service_1.consumer.initiateConsumer();
            console.log("CONSUMER_DATA---------", consumerData);
        }
        catch (error) {
            console.error("Error retrieving pending messages:", error);
            throw error;
        }
    }
}
/**
 * Handles socket connection events.
 */
const handleSocketConnection = (io) => {
    new SocketHandler(io);
};
exports.handleSocketConnection = handleSocketConnection;
