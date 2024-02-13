import appConfig from "../config/appConfig";

export const KAFKA_CONFIG = {
    TOPICS: {
        KAFKA_EVENTS: {
            topic: appConfig.env.KAFKA_TOPIC_PRODUCER || "DEFAULT_TOPIC",
            numPartitions: 3,
            replicationFactor: 1,
        },
    },
};
export const Config = {
    KAFKA_HOST_1: 'localhost',
    KAFKA_PORT_1: 9092, 
};
