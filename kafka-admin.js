import { kafkaClient } from "./kafka-client.js";

async function setup() {
  const admin = kafkaClient.admin();

  console.log("Kafka admin connecting...");
  await admin.connect();
  console.log("Kafka admin connected success");

  await admin.createTopics({
    topics: [{ topic: "location-update", numPartitions: 2 }],
  });
  console.log("Topics added success");

  await admin.disconnect();
  console.log("Topics disconnect");
}

setup();
