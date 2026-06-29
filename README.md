# AlgoNest 🚀

An AI-powered, production-grade collaborative coding and interview preparation platform featuring secure sandboxed execution, real-time sync, and asynchronous job processing.

## ✨ Key Features

### 1. In-House Execution Engine (Docker Fallback)
* Runs submitted code in C++, Python, and Java.
* Executes in an isolated container sandbox (`--network none`, memory/CPU limits) with a direct compile/run host fallback when Docker is not present.
* Provides detailed verdicts: `Accepted` (AC), `Wrong Answer` (WA), `Compilation Error` (CE), `Runtime Error` (RE), and `Time Limit Exceeded` (TLE).

### 2. Asynchronous Job Processing (Redis + BullMQ)
* Uses BullMQ and Redis to execute grading jobs asynchronously. 
* Emits real-time verdict updates directly to the client via Socket.IO immediately after processing.

### 3. Real-Time Pair Programming Rooms
* Shared Monaco coding workspace.
* Live code sync, remote cursor/selection tracking, shared execution console, and group chat.

### 4. Real-Time Interview Room
* Dedicated Interviewer and Candidate panels.
* Interviewer controls: lock/unlock Candidate editor, change assigned problems, reveal progressive AI hints, and write private notes.
* Interview feedback submission and review panels.

### 5. AI Assistant & Learning Coach (Google Gemini)
* **AI Learning Coach**: Evaluates past submissions and generates tailored action plans.
* **AI Hint Generator**: Progressive hints for problems.
* **Explain Code & Debug Wrong Code**: Simplifies logic and provides hints on runtime/logical bugs.
* **Code Review**: Analyzes correctness, style, and complexity.

---

## 🏗️ Architecture

```
Client (Vite React) <--> WebSockets / REST <--> Backend Server (Express)
                                                   |
                                            Enqueues Submissions
                                                   v
                                            Redis (BullMQ)
                                                   |
                                            Processed by
                                                   v
                                            Runner (Worker)
                                                   |
                                            Executes inside
                                                   v
                                         Sandbox (Docker/Host)
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or later)
* npm
* Redis (started via `brew services start redis`)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/wesley-2329/AlgoNest.git
   cd AlgoNest
   ```

2. **Run Backend Service:**
   ```bash
   cd backend
   npm install
   # Configure environment variables in backend/.env
   npm run dev
   ```

3. **Run Runner/Worker Service:**
   ```bash
   cd runner
   npm install
   node index.js
   ```

4. **Run Client Application:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

The application is available at `http://localhost:5173`.
