"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumer = void 0;
const consumer_kafka_1 = require("./consumer.kafka");
const config_1 = require("../../interface/config");
const activity_consumer_1 = require("./activity.consumer");
class ConsumerService {
    constructor() {
        this.consumers = [];
    }
    /**
     * @description Start Consumer for Topic
     * @param {ConsumerOptions} payload
     */
    async consume({ topic, consumerConfig, onMessage, consumerConcurrency, }) {
        try {
            const consumer = new consumer_kafka_1.KafkaConsumer(topic, consumerConfig);
            await consumer.connect();
            const data = await consumer.consumeEachMessage(onMessage, consumerConcurrency);
            console.log("data is ", data, typeof data);
            return data;
            // this.consumers.push(consumer);
        }
        catch (error) {
            console.log("Kafka Consumer Error :: ", error);
        }
    }
    /**
     * @description Initiate Consumer for Kafka Topics
     */
    async initiateConsumer() {
        try {
            const data = await Promise.all([this.post()]);
            return data;
        }
        catch (error) {
            console.log("Kafka Initiate Consumer Error :: ", error);
        }
    }
    /**
     * @description Consumer for Specific Kafka Topic
     */
    async post() {
        const topicPartition = config_1.KAFKA_CONFIG.TOPICS.KAFKA_EVENTS.numPartitions;
        const data = {
            topic: {
                topics: [config_1.KAFKA_CONFIG.TOPICS.KAFKA_EVENTS.topic],
                fromBeginning: false,
            },
            consumerConfig: {
                groupId: `group_${config_1.KAFKA_CONFIG.TOPICS.KAFKA_EVENTS.topic}`,
            },
            onMessage: activity_consumer_1.activityConsumer.postActivity,
            consumerConcurrency: topicPartition,
        };
        const result = await this.consume(data);
        return result;
    }
    async callBackForTest(key, value) {
        console.log("Kafka Consume Key ::", key);
        console.log("Kafka Consume Value ::", value);
    }
    async disconnectConsumers() {
        for (const consumer of this.consumers) {
            await consumer.disconnect();
        }
    }
}
exports.consumer = new ConsumerService();
