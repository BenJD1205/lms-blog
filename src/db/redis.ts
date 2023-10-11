import { Redis } from "ioredis";

const redisClient = () => {
    if(process.env.REDIS_PORT){
        console.log('Redis connected');
        return process.env.REDIS_PORT;
    }
    throw new Error('Redis connected failed');
}

export const redis  = new Redis(redisClient());