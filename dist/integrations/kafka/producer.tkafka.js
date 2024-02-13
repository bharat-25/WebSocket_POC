"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaProducer = void 0;
const kafka_1 = require("./kafka");
class KafkaProducer extends kafka_1.KafkaManager {
    constructor(topic) {
        super();
        this.topic = topic;
        this.producer = this.kafka.producer({
            allowAutoTopicCreation: false,
            transactionTimeout: 30000,
        });
    }
    /**
     * @description Publish Message to Kafka Topic
     * @param {Message} message
     */
    async produce(message) {
        await this.producer.send({
            topic: this.topic,
            messages: [message],
            acks: -1,
        });
    }
    /**
     * @description Open Connection
     */
    async connect() {
        try {
            await this.producer.connect();
        }
        catch (err) {
            console.error('Failed to connect to Kafka.', err);
        }
    }
    /**
     * @description Close Connection
     */
    async disconnect() {
        await this.producer.disconnect();
    }
}
exports.KafkaProducer = KafkaProducer;
