const { GoogleGenerativeAI } = require('@google/generative-ai');
const Problem = require('../models/Problem.js');
const Submission = require('../models/Submission.js');

console.log('Attempting to use Gemini API Key:', process.env.GEMINI_API_KEY);
// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.explainProblem = async (req, res) => {
    try {
        const { problemId } = req.body;
        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const prompt = `Explain the following programming problem in a simple and clear way, as if you were explaining it to a beginner. Focus on the core logic and what is being asked. Here is the problem statement:\n\n---\n\n${problem.statement}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        res.json({ explanation: text });
    } catch (error) {
        console.error('AI explanation error:', error);
        res.status(500).json({ message: 'Failed to get explanation from AI.' });
    }
};

exports.debugCode = async (req, res) => {
    try {
        const { problemId, userCode, language, verdict, actualOutput } = req.body;
        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // For simplicity, we use the first test case for context.
        const testCase = problem.hiddenTestCases[0];

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const prompt = `
            You are an expert programming tutor. A student has submitted a solution to a programming problem, but it failed. Your task is to explain the mistake in a helpful and encouraging way without giving away the final correct code directly.

            Here is the context:
            - Problem Statement: "${problem.statement}"
            - Student's Code (in ${language}):
            \`\`\`${language}
            ${userCode}
            \`\`\`
            - Test Case Input: "${testCase.input}"
            - Expected Output: "${testCase.output}"
            - Student's Actual Output: "${actualOutput}"
            - Verdict: "${verdict}"

            Please explain what is likely wrong with the student's logic and provide a targeted hint to guide them toward the correct approach.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ explanation: text });
    } catch (error) {
        console.error('AI debug error:', error);
        res.status(500).json({ message: 'Failed to get debug explanation from AI.' });
    }
};

exports.reviewCode = async (req, res) => {
    try {
        const { language, code } = req.body;

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const prompt = `
            You are an expert code reviewer for a competitive programming platform.
            Analyze the following code written in ${language}.

            Provide a concise review focusing on:
            1.  **Correctness:** Are there any potential logic errors or bugs?
            2.  **Efficiency:** Can the time or space complexity be improved?
            3.  **Style and Readability:** Is the code clean, well-formatted, and easy to understand?

            Provide your feedback in clear, actionable points using markdown for formatting.

            Here is the code:
            \`\`\`${language}
            ${code}
            \`\`\`
        `;

        console.log("Sending request to Gemini API..."); 

        const result = await model.generateContent(prompt);
        console.log("Received response from Gemini API.");
        const text = result.response.text();

        res.json({ review: text });
    } catch (error) {
        console.error('AI review error:', error);
        res.status(500).json({ message: 'Failed to get code review from AI.' });
    }
};

// Progressive Hint Generator
exports.getHint = async (req, res) => {
    try {
        const { problemId, hintsRevealed = [] } = req.body;
        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        const hintLevel = hintsRevealed.length + 1;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

        const prompt = `
            You are a helpful coding coach. A student is working on the following programming problem:
            
            Title: "${problem.title}"
            Statement: "${problem.statement}"
            
            They have already received ${hintsRevealed.length} hints.
            Please generate Hint #${hintLevel} for this problem.
            
            Guidelines:
            - Hint 1: Offer a high-level conceptual hint about the problem statement or core goal.
            - Hint 2: Offer an algorithmic hint (e.g., which data structures or standard algorithms to use, or time complexity bounds).
            - Hint 3: Offer a pseudo-code or step-by-step logic structure without giving the final source code.
            - Hint 4+: Suggest potential edge cases, boundary conditions, or debugging tricks.
            
            Keep your hint concise, encouraging, and clear. Do NOT write full code in any language.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ hint: text, hintLevel });
    } catch (error) {
        console.error('AI hint error:', error);
        res.status(500).json({ message: 'Failed to generate hint.' });
    }
};

// AI Learning Coach
exports.getLearningCoach = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch user's submissions with problem details
        const submissions = await Submission.find({ userId }).populate('problemId');

        // Compile metrics
        let totalCount = submissions.length;
        let acceptedCount = 0;
        const tagStats = {};

        submissions.forEach(sub => {
            if (sub.verdict === 'Accepted') {
                acceptedCount++;
            }
            if (sub.problemId && sub.problemId.tags) {
                sub.problemId.tags.forEach(tag => {
                    if (!tagStats[tag]) {
                        tagStats[tag] = { total: 0, accepted: 0 };
                    }
                    tagStats[tag].total++;
                    if (sub.verdict === 'Accepted') {
                        tagStats[tag].accepted++;
                    }
                });
            }
        });

        // Determine weak vs strong topics
        const strongTopics = [];
        const weakTopics = [];
        
        Object.keys(tagStats).forEach(tag => {
            const stats = tagStats[tag];
            const rate = stats.accepted / stats.total;
            if (rate >= 0.7) {
                strongTopics.push(tag);
            } else if (rate < 0.5) {
                weakTopics.push(tag);
            }
        });

        const statsSummary = {
            totalSubmissions: totalCount,
            successRate: totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0,
            strongTopics,
            weakTopics,
        };

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const prompt = `
            You are an expert AI Learning Coach on a competitive coding platform.
            Analyze the user's coding statistics:
            - Total Submissions: ${statsSummary.totalSubmissions}
            - Success Rate: ${statsSummary.successRate}%
            - Strong Topics: ${statsSummary.strongTopics.join(', ') || 'None registered yet'}
            - Weak Topics (Success rate below 50%): ${statsSummary.weakTopics.join(', ') || 'None registered yet'}
            
            Provide:
            1. A concise overview of their performance.
            2. 3 highly specific learning actions (e.g. what kind of problems or algorithms they should practice).
            3. A personalized 3-step practice roadmap.
            
            Use clean markdown and bullet points. Make it sound professional, motivating, and smart.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({
            stats: statsSummary,
            coachAdvice: text
        });
    } catch (error) {
        console.error('AI learning coach error:', error);
        res.status(500).json({ message: 'Failed to get learning coach insights.' });
    }
};