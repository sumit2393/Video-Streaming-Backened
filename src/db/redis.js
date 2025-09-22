// src/db/redis.js
import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_HOST,
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log("Redis connected ✅");
  }
}

export { client, connectRedis };
