// backend/database/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Problem = require('../models/Problem.js');

const seedProblems = [
    {
        title: 'Two Sum',
        statement: `Given an array of integers and a target value, return the indices of the two numbers that add up to the target.

### Input Format
- First line contains an integer N (the size of the array).
- Second line contains N space-separated integers representing the array.
- Third line contains a single integer, the target value.

### Output Format
- Print the two 0-based indices of the elements that sum to the target, separated by a space, in ascending order.

### Example
**Input:**
4
2 7 11 15
9

**Output:**
0 1`,
        difficulty: 'Easy',
        tags: ['Arrays', 'Hash Table'],
        examples: [
            {
                input: "4\n2 7 11 15\n9",
                output: "0 1",
                explanation: "Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1."
            }
        ],
        hiddenTestCases: [
            {
                input: "3\n3 2 4\n6",
                output: "1 2"
            },
            {
                input: "2\n3 3\n6",
                output: "0 1"
            }
        ]
    },
    {
        title: 'Fibonacci Number',
        statement: `The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. That is:
F(0) = 0, F(1) = 1
F(n) = F(n-1) + F(n-2), for n > 1.

Given n, calculate F(n).

### Input Format
- A single integer n.

### Output Format
- Print the n-th Fibonacci number.

### Example
**Input:**
4

**Output:**
3`,
        difficulty: 'Easy',
        tags: ['Math', 'Dynamic Programming'],
        examples: [
            {
                input: "4",
                output: "3",
                explanation: "F(4) = F(3) + F(2) = 2 + 1 = 3."
            }
        ],
        hiddenTestCases: [
            {
                input: "10",
                output: "55"
            },
            {
                input: "30",
                output: "832040"
            }
        ]
    }
];

const seedDB = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected.');

        console.log('Clearing existing problems...');
        await Problem.deleteMany({});

        console.log('Inserting seed problems...');
        await Problem.insertMany(seedProblems);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
