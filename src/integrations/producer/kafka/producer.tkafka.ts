import { IProducer } from '../../../interface/kafka.interface';
import { Producer, Message } from 'kafkajs';
import { KafkaManager } from './kafka';

export class KafkaProducer extends KafkaManager implements IProducer {
    private producer: Producer;
    private topic: string;

    constructor(topic: string) {
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
    async produce(message: Message) {
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
        } catch (err) {
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
