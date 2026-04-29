import http from "node:http";
import express from "express";
import { Server } from "socket.io";
import path from "node:path";
import { kafkaClient } from "./kafka-client.js";

async function main() {
  const PORT = process.env.PORT ?? 8000;

  const app = express();
  const server = http.createServer(app);
  const io = new Server();

  io.attach(server);

  // make producer
  const kafkaProducer = kafkaClient.producer();
  await kafkaProducer.connect();

  // make consumer (socket)
  const kafkaConsumer = kafkaClient.consumer({
    groupId: `socket-server-${PORT}`,
  });

  await kafkaConsumer.connect();
  await kafkaConsumer.subscribe({
    topics: ["location-update"],
    fromBeginning: true,
  });

  kafkaConsumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      const data = JSON.parse(message.value.toString());
      console.log(`KafkaConsumer Data Received`, { data });
      io.emit("server:location:update", { ...data });
      heartbeat();
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket:${socket.id}]: successfully connected`);

    socket.on("client:location:update", async (locData) => {
      const { latitude, longitude } = locData;
      console.log(latitude, longitude);

      // send to kafka
      await kafkaProducer.send({
        topic: "location-update",
        messages: [
          {
            key: socket.id,
            value: JSON.stringify({ id: socket.id, latitude, longitude }),
          },
        ],
      });
    });
  });

  app.use(express.static(path.resolve("./public")));

  app.get("/health", (req, res) => {
    return res.json({ healthy: true });
  });

  server.listen(PORT, () => {
    console.log(`Server started on http://localhost:8000`);
  });
}

main();
