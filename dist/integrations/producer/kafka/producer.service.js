"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.producer = void 0;
const producer_tkafka_1 = require("./producer.tkafka");
class ProducerService {
    constructor() {
        this.producers = new Map();
    }
    /**
     * @description Publish Message to Topic
     * @param {string} topic
     * @param {Message} message
     */
    async produce(topic, message) {
        try {
            const producer = await this.getProducer(topic);
            await producer.produce(message);
            console.log('Kafka Producer Message Published :: ', message);
        }
        catch (error) {
            console.log('Kafka Producer Error :: ', error);
        }
    }
    /**
     * @description Maintain a producer for each topic
     * @param {string} topic
     * @returns
     */
    async getProducer(topic) {
        let producer = this.producers.get(topic);
        if (!producer) {
            producer = new producer_tkafka_1.KafkaProducer(topic);
            await producer.connect();
            this.producers.set(topic, producer);
        }
        return producer;
    }
}
exports.producer = new ProducerService();
