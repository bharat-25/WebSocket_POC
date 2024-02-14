"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaManager = void 0;
const kafkajs_1 = require("kafkajs");
const config_1 = require("../../../interface/config");
class KafkaManager {
    constructor() {
        this.kafka = new kafkajs_1.Kafka(this.getConfiguration());
        this.admin = this.kafka.admin();
    }
    /**
     * @description Fetch Configuration for Kafka
     * @returns {KafkaConfig}
     */
    getConfiguration() {
        const broker = `${config_1.Config.KAFKA_HOST_1}:${config_1.Config.KAFKA_PORT_1}`;
        const creds = {
            clientId: 'kafka-poc-service',
            brokers: [broker],
            retry: {},
        };
        return creds;
    }
    /**
     * @description Create the topic if it has not been already created.
     */
    async createTopics() {
        try {
            const topicConfig = {
                topics: Object.values(config_1.KAFKA_CONFIG.TOPICS).map(topic => ({
                    topic: topic.topic,
                    numPartitions: topic.numPartitions,
                    replicationFactor: topic.replicationFactor
                }))
            };
            console.log('Creating', topicConfig);
            const res = await this.admin.createTopics(topicConfig);
            console.log('Kafka Topic Creation ::', res);
        }
        catch (error) {
            console.error('Kafka Error Topic Creation', error);
        }
    }
    /**
     * @description Read Metadata for Created Topics
     */
    async metadataOfTopics() {
        try {
            const metadata = await this.admin.fetchTopicMetadata();
            console.log('Kafka Topics Metadata ::', JSON.stringify(metadata));
        }
        catch (error) {
            console.error('Kafka Error Fetching Metadata', error);
        }
    }
    /**
     * @description Open Connection
     */
    async connectToAdmin() {
        try {
            console.log("inside try");
            await this.admin.connect();
            console.log("connection successfully");
        }
        catch (error) {
            console.log("inside catch-------------------->");
            console.error('Failed to connect to Kafka.', error);
        }
    }
    /**
     * @description Close Connection
     */
    async disconnectFromAdmin() {
        await this.admin.disconnect();
    }
}
exports.KafkaManager = KafkaManager;
