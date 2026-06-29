const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { executeSubmission } = require('../utils/codeRunner.js');

const redisConnection = new Redis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
    console.error('[Worker] Redis connection error:', err.message);
});

const startSubmissionWorker = () => {
    const worker = new Worker('submissionQueue', async (job) => {
        const { submissionId, code, language, hiddenTestCases } = job.data;
        console.log(`[Worker] Processing job for submission ${submissionId}...`);
        
        try {
            const result = await executeSubmission(language, code, hiddenTestCases);
            console.log(`[Worker] Submission ${submissionId} completed: ${result.verdict}`);
            return {
                submissionId,
                ...result
            };
        } catch (err) {
            console.error(`[Worker] Job error: ${err.message}`);
            return {
                submissionId,
                verdict: 'Runtime Error',
                output: err.message,
                executionTime: 0,
                failedTestCaseIndex: 0
            };
        }
    }, { connection: redisConnection });

    return worker;
};

module.exports = {
    startSubmissionWorker
};
