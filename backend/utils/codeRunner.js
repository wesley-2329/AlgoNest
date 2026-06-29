const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Dynamically check if Docker is available and running
let isDockerAvailable = false;
try {
    execSync('docker ps', { stdio: 'ignore' });
    isDockerAvailable = true;
    console.log('[Runner] Docker daemon detected. Code will execute inside sandboxed Docker containers.');
} catch (error) {
    console.log('[Runner] Docker is not running/installed. Falling back to direct host execution.');
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
        const timeout = 10000; // 10 seconds timeout

        if (isDockerAvailable) {
            const baseImage = `algonest-${language}-base`;
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

module.exports = {
    runSingleTestCase,
    executeSubmission
};
