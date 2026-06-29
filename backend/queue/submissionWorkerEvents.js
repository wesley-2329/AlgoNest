const { QueueEvents } = require('bullmq');
const Submission = require('../models/Submission.js');
const { redisConnection } = require('./submissionQueue.js');

module.exports = (app) => {
    const queueEvents = new QueueEvents('submissionQueue', {
        connection: redisConnection
    });

    queueEvents.on('completed', async ({ jobId, returnvalue }) => {
        console.log(`[Queue] Job ${jobId} completed!`);
        if (!returnvalue) return;

        let data = returnvalue;
        if (typeof returnvalue === 'string') {
            try {
                data = JSON.parse(returnvalue);
            } catch (e) {
                console.error('Failed to parse returnvalue:', e.message);
                return;
            }
        }

        const { submissionId, verdict, output, executionTime, failedTestCaseIndex } = data;
        try {
            const submission = await Submission.findByIdAndUpdate(submissionId, {
                verdict,
                output,
                executionTime,
                failedTestCaseIndex
            }, { new: true });

            const io = app.get('io');
            if (io && submission) {
                console.log(`[Queue] Emitting submission-verdict to user-${submission.userId} for submission ${submissionId}`);
                io.to(`user-${submission.userId}`).emit('submission-verdict', submission);
            }
        } catch (err) {
            console.error('Failed to update submission from completed job:', err.message);
        }
    });

    queueEvents.on('failed', async ({ jobId, failedReason }) => {
        console.error(`[Queue] Job ${jobId} failed! Reason:`, failedReason);
    });
};
