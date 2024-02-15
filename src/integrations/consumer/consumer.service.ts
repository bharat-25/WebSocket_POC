import { ConsumerOptions, IConsumer } from "../../interface/kafka.interface";
import { KafkaConsumer } from "./consumer.kafka";
import { KAFKA_CONFIG } from "../../interface/config";
import { activityConsumer } from "./activity.consumer";

class ConsumerService {
  private readonly consumers: IConsumer[] = [];

  /**
   * @description Start Consumer for Topic
   * @param {ConsumerOptions} payload
   */
  async consume({
    topic,
    consumerConfig,
    onMessage,
    consumerConcurrency,
  }: ConsumerOptions) {
    try {
      const consumer = new KafkaConsumer(topic, consumerConfig);
      await consumer.connect();
      const data=await consumer.consumeEachMessage(onMessage, consumerConcurrency);
      console.log("data is ",data,typeof data)
      return data;
      // this.consumers.push(consumer);
    } catch (error) {
      console.log("Kafka Consumer Error :: ", error);
    }
  }

  /**
   * @description Initiate Consumer for Kafka Topics
   */
  async initiateConsumer() {
    try {
     const data= await Promise.all([this.post()]);
     return data;
    } catch (error) {
      console.log("Kafka Initiate Consumer Error :: ", error);
    }
  }

  /**
   * @description Consumer for Specific Kafka Topic
   */
  async post() {
    const topicPartition = KAFKA_CONFIG.TOPICS.KAFKA_EVENTS.numPartitions;
    const data: ConsumerOptions = {
      topic: {
        topics: [KAFKA_CONFIG.TOPICS.KAFKA_EVENTS.topic],
        fromBeginning: false,
      },
      consumerConfig: {
        groupId: `group_${KAFKA_CONFIG.TOPICS.KAFKA_EVENTS.topic}`,
      },
      onMessage: activityConsumer.postActivity,
      consumerConcurrency: topicPartition,
    };
   const result= await this.consume(data);
   return result;
  }

  async callBackForTest(key: string, value: any) {
    console.log("Kafka Consume Key ::", key);
    console.log("Kafka Consume Value ::", value);
  }

  async disconnectConsumers() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}

export const consumer = new ConsumerService();
