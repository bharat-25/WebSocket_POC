"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationService = void 0;
const admin = __importStar(require("firebase-admin"));
class PushNotificationService {
    constructor() {
        // Load Firebase service account key
        const serviceAccount = require("/home/admin188/Desktop/WebSocket_POC/firebaseConfig.json");
        // Initialize Firebase admin SDK
        this.adminInstance = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FCM_URL
        });
    }
    static getInstance() {
        if (!PushNotificationService.instance) {
            PushNotificationService.instance = new PushNotificationService();
        }
        return PushNotificationService.instance;
    }
    async sendPushNotification(receiverFCMToken, payload) {
        const message = {
            token: receiverFCMToken,
            notification: {
                title: payload.title,
                body: payload.body
            }
        };
        try {
            console.log("PUSH NOTIFICATION MESSAGE: ", message);
            await this.adminInstance.messaging().send(message);
            console.log("Push notification sent successfully");
        }
        catch (error) {
            console.error("Error sending push notification:", error);
            throw error;
        }
    }
}
exports.PushNotificationService = PushNotificationService;
