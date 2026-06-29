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
        ],
        solutions: {
            cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n    int target;\n    cin >> target;\n\n    unordered_map<int, int> num_map;\n    for (int i = 0; i < n; i++) {\n        int complement = target - nums[i];\n        if (num_map.count(complement)) {\n            cout << num_map[complement] << " " << i << endl;\n            return 0;\n        }\n        num_map[nums[i]] = i;\n    }\n    return 0;\n}`,
            python: `import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    target = int(lines[n+1])\n\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            print(f"{num_map[complement]} {i}")\n            return\n        num_map[num] = i\n\nif __name__ == '__main__':\n    main()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) {\n            nums[i] = sc.nextInt();\n        }\n        int target = sc.nextInt();\n\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < n; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                System.out.println(map.get(complement) + " " + i);\n                return;\n            }\n            map.put(nums[i], i);\n        }\n    }\n}`,
            explanation: `### Approach: Hash Map (Single Pass)
By using a hash map, we can store elements and their indices as we iterate. For each element, we check if its complement (target - current element) already exists in the map. If it does, we have found our pair.

- **Time Complexity**: O(N) — We traverse the list containing N elements only once.
- **Space Complexity**: O(N) — The extra space required depends on the number of items stored in the hash map.`
        }
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
        ],
        solutions: {
            cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    if (n <= 1) {\n        cout << n << endl;\n        return 0;\n    }\n    int prev2 = 0, prev1 = 1, current = 0;\n    for (int i = 2; i <= n; i++) {\n        current = prev1 + prev2;\n        prev2 = prev1;\n        prev1 = current;\n    }\n    cout << current << endl;\n    return 0;\n}`,
            python: `import sys\n\ndef main():\n    line = sys.stdin.read().strip()\n    if not line: return\n    n = int(line)\n    if n <= 1:\n        print(n)\n        return\n    prev2, prev1 = 0, 1\n    for _ in range(2, n + 1):\n        current = prev1 + prev2\n        prev2 = prev1\n        prev1 = current\n    print(prev1)\n\nif __name__ == '__main__':\n    main()`,
            java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        if (n <= 1) {\n            System.out.println(n);\n            return;\n        }\n        int prev2 = 0, prev1 = 1, current = 0;\n        for (int i = 2; i <= n; i++) {\n            current = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = current;\n        }\n        System.out.println(current);\n    }\n}`,
            explanation: `### Approach: Space Optimized Iterative DP
Instead of maintaining a complete dynamic programming array, we only need to keep track of the two preceding values (F(i-1) and F(i-2)) to calculate the current Fibonacci number.

- **Time Complexity**: O(N) — Linear loop up to N.
- **Space Complexity**: O(1) — Only standard integer placeholders are kept.`
        }
    },
    {
        title: 'Reverse String',
        statement: `Given a string, write a program to output its characters in reverse order.

### Input Format
- First line contains an integer N (the length of the string).
- Second line contains a string of length N.

### Output Format
- Print the reversed string.

### Example
**Input:**
5
hello

**Output:**
olleh`,
        difficulty: 'Easy',
        tags: ['Two Pointers', 'String'],
        examples: [
            {
                input: "5\nhello",
                output: "olleh",
                explanation: "Reversing 'hello' gives 'olleh'."
            }
        ],
        hiddenTestCases: [
            {
                input: "8\nalgonest",
                output: "tsenogla"
            },
            {
                input: "1\na",
                output: "a"
            }
        ],
        solutions: {
            cpp: `#include <iostream>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        string s;\n        cin >> s;\n        reverse(s.begin(), s.end());\n        cout << s << endl;\n    }\n    return 0;\n}`,
            python: `import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if len(lines) < 2: return\n    s = lines[1]\n    print(s[::-1])\n\nif __name__ == '__main__':\n    main()`,
            java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            if (sc.hasNext()) {\n                String s = sc.next();\n                StringBuilder sb = new StringBuilder(s);\n                System.out.println(sb.reverse().toString());\n            }\n        }\n    }\n}`,
            explanation: `### Approach: Two Pointers Swap / Reverse
Swap elements from the beginning (index 0) and the end (index N-1) moving towards the middle.

- **Time Complexity**: O(N) — Linear traversal swaps N/2 times.
- **Space Complexity**: O(1) — In-place reversing requiring constant auxiliary storage.`
        }
    },
    {
        title: 'Valid Parentheses',
        statement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

### Input Format
- A single line containing the string.

### Output Format
- Print 'true' if valid, or 'false' otherwise.

### Example
**Input:**
()[]{}

**Output:**
true`,
        difficulty: 'Easy',
        tags: ['Stack', 'String'],
        examples: [
            {
                input: "()[]{}",
                output: "true",
                explanation: "All brackets are closed correctly and in order."
            }
        ],
        hiddenTestCases: [
            {
                input: "(]",
                output: "false"
            },
            {
                input: "{[]}",
                output: "true"
            }
        ],
        solutions: {
            cpp: `#include <iostream>\n#include <string>\n#include <stack>\n\nusing namespace std;\n\nbool isValid(string s) {\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '{' || c == '[') {\n            st.push(c);\n        } else {\n            if (st.empty()) return false;\n            if (c == ')' && st.top() != '(') return false;\n            if (c == '}' && st.top() != '{') return false;\n            if (c == ']' && st.top() != '[') return false;\n            st.pop();\n        }\n    }\n    return st.empty();\n}\n\nint main() {\n    string s;\n    if (cin >> s) {\n        cout << (isValid(s) ? "true" : "false") << endl;\n    }\n    return 0;\n}`,
            python: `import sys\n\ndef isValid(s):\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n\ndef main():\n    s = sys.stdin.read().strip()\n    if not s: return\n    print("true" if isValid(s) else "false")\n\nif __name__ == '__main__':\n    main()`,
            java: `import java.util.*;\n\npublic class Main {\n    public static boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(' || c == '{' || c == '[') {\n                stack.push(c);\n            } else {\n                if (stack.isEmpty()) return false;\n                char top = stack.peek();\n                if (c == ')' && top != '(') return false;\n                if (c == '}' && top != '{') return false;\n                if (c == ']' && top != '[') return false;\n                stack.pop();\n            }\n        }\n        return stack.isEmpty();\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            System.out.println(isValid(s) ? "true" : "false");\n        }\n    }\n}`,
            explanation: `### Approach: Stack matching
Iterate over the bracket string. When encountering an opening bracket, push it to the stack. When seeing a closing bracket, check if it matches the bracket currently at the top of the stack.

- **Time Complexity**: O(N) — Single pass parsing.
- **Space Complexity**: O(N) — Worst case all characters pushed to stack.`
        }
    },
    {
        title: 'Binary Search',
        statement: `Given a sorted array of integers of size N, write a program to search for a target value. If it exists, output its 0-based index. Otherwise, output -1.

### Input Format
- First line contains N (the array size).
- Second line contains N sorted integers.
- Third line contains the target value.

### Output Format
- Print the 0-based index of the target, or -1 if not found.

### Example
**Input:**
5
1 2 3 4 5
3

**Output:**
2`,
        difficulty: 'Easy',
        tags: ['Binary Search', 'Algorithms'],
        examples: [
            {
                input: "5\n1 2 3 4 5\n3",
                output: "2",
                explanation: "3 is found at index 2."
            }
        ],
        hiddenTestCases: [
            {
                input: "6\n-1 0 3 5 9 12\n9",
                output: "4"
            },
            {
                input: "6\n-1 0 3 5 9 12\n2",
                output: "-1"
            }
        ],
        solutions: {
            cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n    int target;\n    cin >> target;\n\n    int left = 0, right = n - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) {\n            cout << mid << endl;\n            return 0;\n        } else if (nums[mid] < target) {\n            left = mid + 1;\n        } else {\n            right = mid - 1;\n        }\n    }\n    cout << -1 << endl;\n    return 0;\n}`,
            python: `import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    target = int(lines[n+1])\n\n    left, right = 0, n - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if nums[mid] == target:\n            print(mid)\n            return\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    print(-1)\n\nif __name__ == '__main__':\n    main()`,
            java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) {\n            nums[i] = sc.nextInt();\n        }\n        int target = sc.nextInt();\n\n        int left = 0, right = n - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) {\n                System.out.println(mid);\n                return;\n            }\n            if (nums[mid] < target) {\n                left = mid + 1;\n            } else {\n                right = mid - 1;\n            }\n        }\n        System.out.println(-1);\n    }\n}`,
            explanation: `### Approach: Binary Search (Divide and Conquer)
Find the target by halving the search space. Adjust pointers \`left\` and \`right\` based on comparing the middle value with target.

- **Time Complexity**: O(log N) — Splitting search space in half each iteration.
- **Space Complexity**: O(1) — Pure iterative structure.`
        }
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
