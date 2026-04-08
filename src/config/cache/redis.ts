import { createClient } from "redis";
import config from "../config.ts";
import logger from "../log/logger.ts";


const redisClient = createClient({
    url: config.redis.url,
}
)

redisClient.on("error",(err)=>{
    logger.error("Error Connecting Redis Server")
})


export default redisClient;