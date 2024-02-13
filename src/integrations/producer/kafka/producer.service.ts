import { Message } from 'kafkajs';
import { IProducer } from '../../../interface/kafka.interface';
import { KafkaProducer } from './producer.tkafka';
class ProducerService {
    private readonly producers = new Map<string, IProducer>();

    /**
     * @description Publish Message to Topic
     * @param {string} topic
     * @param {Message} message
     */
    async produce(topic: string, message: Message) {
        try {
            const producer = await this.getProducer(topic);
            await producer.produce(message);
            console.log('Kafka Producer Message Published :: ',message);
        } catch (error) {
            console.log('Kafka Producer Error :: ', error);
        }
    }

    /**
     * @description Maintain a producer for each topic
     * @param {string} topic
     * @returns
     */
    private async getProducer(topic: string) {
        let producer = this.producers.get(topic);
        if (!producer) {
            producer = new KafkaProducer(topic);
            await producer.connect();
            this.producers.set(topic, producer);
        }
        return producer;
    }
}

export const producer = new ProducerService();
