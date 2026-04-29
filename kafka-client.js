import { Kafka } from "kafkajs";

export const kafkaClient = new Kafka({
  clientId: "kafka-learn",
  brokers: ["localhost:9092"],
});
