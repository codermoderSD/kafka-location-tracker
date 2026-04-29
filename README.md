# kafka-learning

Small learning project demonstrating an Express server integrated with Socket.IO and Kafka (kafkajs).

**Prerequisites**

- Docker / Docker Compose
- Node.js (v16+ recommended; tested with Node v24)
- pnpm (recommended) or npm

**Quick setup (recommended order)**

1. Start Kafka (docker-compose):

```bash
docker compose up -d
```

2. Install dependencies:

Using pnpm:

```bash
pnpm install
```

Or with npm:

```bash
npm install
```

3. Create Kafka topics (run the admin helper):

```bash
node kafka-admin.js
```

4. Start the app:

```bash
node index.js
```

The server will start on `http://localhost:8000` by default (or the port in `PORT`).

The server exposes a simple health endpoint:

- GET /health — returns { "healthy": true }

**Files of interest**

- `docker-compose.yml` — brings up a single-node Kafka broker on `localhost:9092`.
- `kafka-client.js` — creates and exports a kafkajs `Kafka` client configured for `localhost:9092`.
- `kafka-admin.js` — admin helper that connects and creates the `location-update` topic.
- `index.js` — main Express + Socket.IO server.
- `public/index.html` — a minimal client example (if present).

**Why the order matters**

- Docker Compose must be running before `kafka-admin.js` and the app so that the Kafka broker is available on `localhost:9092`.
- `kafka-admin.js` creates required topics once the broker is up.

**How Kafka is used in this project**

- The project uses `kafkajs` to interact with Kafka. The client is initialized in `kafka-client.js` with:

```js
import { Kafka } from "kafkajs";
export const kafkaClient = new Kafka({
  clientId: "kafka-learn",
  brokers: ["localhost:9092"],
});
```

- `kafka-admin.js` uses `kafkaClient.admin()` to create topics programmatically. This is useful for local development to ensure the topics your producers/consumers expect exist before starting the app.

- Typical usage pattern in apps that integrate Kafka:
  - Admin: create/manage topics and partitions.
  - Producer: send messages to topics.
  - Consumer: subscribe to topics and read messages (with consumer groups for scaling).

- In this repository the `location-update` topic is created with 2 partitions. Partitions help scale consumption and provide ordering guarantees per partition.

**Kafka concepts (brief)**

- Topic: a named stream of records to which producers write and consumers read.
- Partition: a topic is split into partitions; ordering is guaranteed within a partition but not across partitions. Partitions enable parallelism.
- Broker: a Kafka server instance that stores partitions and serves clients.
- Consumer group: a group of consumers that coordinate to read different partitions of a topic — each partition is processed by only one consumer in the group.
- Offset: the position of a record within a partition; consumers track offsets to resume processing.

**Troubleshooting**

- If `kafka-admin.js` fails to connect, verify Docker is running and Kafka is reachable on `localhost:9092`.
- If you see the Socket.IO error `Cannot read properties of undefined (reading 'server')`, ensure `index.js` imports and uses the `Server` class from Socket.IO, not `Socket`:

```js
import { Server } from "socket.io";
const io = new Server();
io.attach(server);
```

**Optional: add a start script**

Add to `package.json` to simplify starting the app:

```json
"scripts": {
  "start": "node index.js"
}
```

**Next steps / ideas**

- Add a Socket.IO client example that produces/consumes messages via Kafka.
- Add consumer code to `index.js` that listens to `location-update` and emits Socket.IO events to connected clients.
- Add environment-driven broker addresses for remote/deployed environments.
