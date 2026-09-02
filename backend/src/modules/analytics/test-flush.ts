// import { redisAvailable } from "../../config/redis.js";
// import { redisService } from "../../infrastructure/redis/redis.services.js";
// import { flushClickBatch } from "./analytics.repository.js";

// const batchId = "11111111-1111-1111-1111-111111111111";

// const result = await flushClickBatch(batchId, [
//     {
//         shortCode: "5N2K2K",
//         clickCount: 5,
//     },
// ]);

// console.log(result);

// import { redis, redisAvailable } from "../../config/redis.js";
// import { redisService } from "../../infrastructure/redis/redis.services.js";

// await redis.connect();

// console.log("redisAvailable:", redisAvailable);

// const result = await redisService.scan(
//     "0",
//     "url:clicks:*",
//     10,
// );

// console.log(result);

// await redis.quit();

// import { redis } from "../../config/redis.js";
// import { flushPendingClicks } from "./analytics.worker.js";

// await redis.connect();

// await flushPendingClicks();

// await redis.quit();
import { redis } from "../../config/redis.js";
import { redisService } from "../../infrastructure/redis/redis.services.js";
await redis.connect();

const result = await redisService.consumeRateLimit(
    "rate-limit:test",
    10,
    86400,
);

console.log(result)

await redis.quit();

