"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const constant_1 = require("./constant/constant");
const dbConnection_1 = require("./integrations/database/dbConnection");
const chat_routes_1 = require("./routes/chat.routes");
const user_routes_1 = require("./routes/user.routes");
const socket_connection_1 = require("./integrations/socket/socket.connection");
const push_notification_1 = require("./service/fcm/push-notification");
const appConfig_1 = __importDefault(require("./config/appConfig"));
const kafka_1 = require("./integrations/kafka/kafka");
class App {
    constructor() {
        this.callback = () => {
            console.log(`Server listing on port: ${this.port}`);
        };
        this.app = (0, express_1.default)();
        try {
            this.kafka = new kafka_1.KafkaManager();
        }
        catch (error) {
            console.error(`Error initializing KafkaManager: ${error}`);
        }
        this.startApp();
        (0, dbConnection_1.DB_connection)();
        (0, socket_connection_1.SOCKET)();
        push_notification_1.pushNotification.initializeFirebase();
    }
    /**
     * @description Steps to Start the Express Sever
     */
    startApp() {
        this.app = (0, express_1.default)();
        this.port = appConfig_1.default.env.PORT;
        this.loadGlobalMiddleWare();
        this.loadRouter();
        this.Server();
        this.kafka.connectToAdmin();
        this.kafka.createTopics();
        this.kafka.metadataOfTopics();
        this.kafka.disconnectFromAdmin();
    }
    /**
   * @description Load global Middlewares
   */
    loadGlobalMiddleWare() {
        this.chatContext = constant_1.chatContext;
        this.userContext = constant_1.userContext;
        this.app.use(express_1.default.json());
        // this.port = portNumber;
    }
    /**
   * @description Load All Routes
   */
    loadRouter() {
        this.app.use(this.chatContext, chat_routes_1.chatRouters.chatRouter());
        this.app.use(this.userContext, user_routes_1.userRouters.userRouter());
    }
    /**
   * @description handler for Express server when initialising server
   */
    Server() {
        this.app.listen(this.port, this.callback);
    }
}
new App();
