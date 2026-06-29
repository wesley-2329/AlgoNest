const express = require('express');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const { Worker } = require('bullmq');
const Redis = require('ioredis');

const app = express();
app.use(express.json());

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Dynamically check if Docker is available and running
let isDockerAvailable = false;
try {
    execSync('docker ps', { stdio: 'ignore' });
    isDockerAvailable = true;
    console.log('Docker daemon detected. Code will run inside sandboxed Docker containers.');
} catch (error) {
    console.log('Docker is not running or not installed. Running code directly on the host machine as a fallback.');
}

// Helper to run a single testcase
const runSingleTestCase = (language, code, input) => {
    return new Promise((resolve) => {
        const jobId = uuid();
        const jobDir = path.join(tempDir, jobId);
        fs.mkdirSync(jobDir, { recursive: true });

        const filenames = { cpp: 'main.cpp', python: 'main.py', java: 'Main.java' };
        const filePath = path.join(jobDir, filenames[language]);
        fs.writeFileSync(filePath, code);

        let child;
        const startTime = process.hrtime();
        const timeout = 10000; // 10 seconds

        if (isDockerAvailable) {
            const baseImage = `submittery-${language}-base`;
            const runCommands = {
                cpp: `g++ main.cpp -o main && ./main`,
                python: `python main.py`,
                java: `javac Main.java && java Main`
            };

            const args = [
                'run', '--rm', '-i',
                '--network', 'none', // Network isolation
                '--memory', '256m', // Memory limit
                '--cpus', '0.5', // CPU limit
                '-v', `${jobDir}:/usercode`,
                baseImage,
                'sh', '-c', runCommands[language]
            ];
            child = spawn('docker', args);
        } else {
            const hostRunCommands = {
                cpp: `g++ main.cpp -o main && ./main`,
                python: `python3 main.py`,
                java: `javac Main.java && java Main`
            };
            child = spawn('sh', ['-c', hostRunCommands[language]], {
                cwd: jobDir
            });
        }

        let stdout = '';
        let stderr = '';

        const timer = setTimeout(() => {
            child.kill('SIGKILL');
        }, timeout);

        child.stdin.write(input);
        child.stdin.end();

        child.stdout.on('data', (data) => { stdout += data.toString(); });
        child.stderr.on('data', (data) => { stderr += data.toString(); });

        child.on('close', (code, signal) => {
            clearTimeout(timer);
            const endTime = process.hrtime(startTime);
            const executionTime = endTime[0] * 1000 + endTime[1] / 1000000;

            let isCompilationError = false;
            if (code !== 0) {
                if (language === 'cpp' && !fs.existsSync(path.join(jobDir, 'main'))) {
                    isCompilationError = true;
                } else if (language === 'java' && !fs.existsSync(path.join(jobDir, 'Main.class'))) {
                    isCompilationError = true;
                }
            }

            fs.rm(jobDir, { recursive: true, force: true }, () => {});

            if (signal === 'SIGKILL') {
                resolve({ verdict: 'TLE', error: 'Time Limit Exceeded', output: stdout, executionTime });
            } else if (code !== 0) {
                if (isCompilationError) {
                    resolve({ verdict: 'CE', error: stderr, output: stdout, executionTime });
                } else {
                    resolve({ verdict: 'RE', error: stderr, output: stdout, executionTime });
                }
            } else {
                resolve({ verdict: 'OK', output: stdout, error: stderr, executionTime });
            }
        });
    });
};

// Helper to execute all testcases sequentially
const executeSubmission = async (language, code, hiddenTestCases) => {
    let finalVerdict = 'Accepted';
    let finalOutput = '';
    let maxTime = 0;
    let failedIdx = -1;

    if (!hiddenTestCases || hiddenTestCases.length === 0) {
        return {
            verdict: 'Compilation Error',
            output: 'No test cases found for this problem.',
            executionTime: 0,
            failedTestCaseIndex: 0
        };
    }

    for (let i = 0; i < hiddenTestCases.length; i++) {
        const testCase = hiddenTestCases[i];
        const runRes = await runSingleTestCase(language, code, testCase.input);
        const { verdict, output, error, executionTime } = runRes;
        
        if (executionTime > maxTime) {
            maxTime = executionTime;
        }

        if (verdict !== 'OK') {
            if (verdict === 'CE') finalVerdict = 'Compilation Error';
            else if (verdict === 'TLE') finalVerdict = 'Time Limit Exceeded';
            else finalVerdict = 'Runtime Error';
            
            finalOutput = error || output;
            failedIdx = i;
            break;
        }

        // Compare stdout with expected output (trimmed)
        if (output.trim() !== testCase.output.trim()) {
            finalVerdict = 'Wrong Answer';
            finalOutput = `Failed on Testcase ${i + 1}\nInput:\n${testCase.input}\nExpected:\n${testCase.output.trim()}\nGot:\n${output.trim()}`;
            failedIdx = i;
            break;
        }
    }

    return {
        verdict: finalVerdict,
        output: finalOutput,
        executionTime: Math.round(maxTime),
        failedTestCaseIndex: failedIdx
    };
};

// HTTP run custom code (used by Run button)
app.post('/run', async (req, res) => {
    const { language = 'python', code, input = '' } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Code is required.' });
    }

    try {
        const result = await runSingleTestCase(language, code, input);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Setup Redis & BullMQ worker
const redisConnection = new Redis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
    console.error('Redis connection error in worker:', err.message);
});

const worker = new Worker('submissionQueue', async (job) => {
    const { submissionId, code, language, hiddenTestCases } = job.data;
    console.log(`[Worker] Started processing submission ${submissionId}`);
    try {
        const result = await executeSubmission(language, code, hiddenTestCases);
        console.log(`[Worker] Finished submission ${submissionId} with verdict ${result.verdict}`);
        return {
            submissionId,
            ...result
        };
    } catch (err) {
        console.error(`[Worker] Error processing job: ${err.message}`);
        return {
            submissionId,
            verdict: 'Runtime Error',
            output: err.message,
            executionTime: 0,
            failedTestCaseIndex: 0
        };
    }
}, { connection: redisConnection });

const PORT = 7777;
app.listen(PORT, () => {
    console.log(`Runner server listening on port ${PORT}`);
});