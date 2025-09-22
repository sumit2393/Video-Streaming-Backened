import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'
import { client, connectRedis } from "./db/redis.js";

dotenv.config({
    path: './.env'
})


connectDB()
    .then(() => {
        const PORT = process.env.PORT
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });

(async () => {
  await connectRedis();

  try {
    await client.set("foo", "bar");
    const value = await client.get("foo");
    console.log("Redis value:", value);
  } catch (err) {
    console.error("Redis error:", err);
  } finally {
    // Optional: only quit when shutting down app
    await client.quit();
  }
})();