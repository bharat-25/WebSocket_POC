"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.KAFKA_CONFIG = void 0;
const appConfig_1 = __importDefault(require("../config/appConfig"));
exports.KAFKA_CONFIG = {
    TOPICS: {
        KAFKA_EVENTS: {
            topic: appConfig_1.default.env.KAFKA_TOPIC_PRODUCER || "DEFAULT_TOPIC",
            numPartitions: 3,
            replicationFactor: 1,
        },
    },
};
exports.Config = {
    KAFKA_HOST_1: 'localhost',
    KAFKA_PORT_1: 9092,
};
