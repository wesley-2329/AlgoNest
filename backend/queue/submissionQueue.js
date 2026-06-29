const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Connect to local Redis instance
const redisConnection = new Redis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on('error', (err) => {
    console.error('Redis connection error in backend queue:', err.message);
});

const submissionQueue = new Queue('submissionQueue', {
    connection: redisConnection
});

module.exports = { submissionQueue, redisConnection };
