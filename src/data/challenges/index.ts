/**
 * @fileoverview Sample Benchmark Challenges
 * @module @mcp/intellibench/data/challenges
 * @version 1.0.0
 */

import type { Challenge } from '../../shared/types/index.js';
import { ChallengeCategory, Difficulty } from '../../shared/types/index.js';

export const challenges: Challenge[] = [
    // === CODE GENERATION CHALLENGES ===
    {
        id: 'codegen_001',
        title: 'Implement a Stack Data Structure',
        description: `Implement a generic Stack data structure with the following operations:
- \`push(item)\`: Add an item to the top
- \`pop()\`: Remove and return the top item
- \`peek()\`: Return the top item without removing
- \`isEmpty()\`: Check if the stack is empty
- \`size()\`: Return the number of items`,
        category: ChallengeCategory.CODE_GENERATION,
        difficulty: 3,
        difficultyTier: Difficulty.EASY,
        requirements: [
            'Implement all five methods correctly',
            'Handle edge cases (empty stack)',
            'Use TypeScript generics',
        ],
        hints: ['Consider using an array as the underlying storage'],
        templates: [{
            language: 'typescript',
            template: `class Stack<T> {\n  // Implement your solution here\n}`,
            signature: 'class Stack<T> { push, pop, peek, isEmpty, size }',
        }],
        testCases: [
            { id: 'tc1', name: 'Basic push/pop', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc2', name: 'Empty stack', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc3', name: 'Peek operation', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc4', name: 'Size tracking', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc5', name: 'Edge cases', input: null, expectedOutput: true, isHidden: true, points: 20 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['data-structure', 'stack', 'generics'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'codegen_002',
        title: 'Debounce Function Implementation',
        description: `Implement a \`debounce\` function that delays invoking a function until after a specified wait time has elapsed since the last time it was invoked.`,
        category: ChallengeCategory.CODE_GENERATION,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Delay function execution by the specified wait time',
            'Reset the timer on subsequent calls',
            'Preserve the correct `this` context and arguments',
        ],
        templates: [{
            language: 'typescript',
            template: `function debounce<T extends (...args: any[]) => any>(\n  func: T,\n  wait: number\n): (...args: Parameters<T>) => void {\n  // Implement your solution\n}`,
            signature: 'function debounce(func, wait): Function',
        }],
        testCases: [
            { id: 'tc1', name: 'Basic debounce', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Timer reset', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Context preservation', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Arguments passing', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['function', 'utility', 'timing'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    // === BUG DETECTION CHALLENGES ===
    {
        id: 'bugfix_001',
        title: 'Fix the Binary Search Bug',
        description: `The following binary search implementation has a subtle bug. Find and fix it.

\`\`\`typescript
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length;
  
  while (left < right) {
    const mid = (left + right) / 2;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
\`\`\``,
        category: ChallengeCategory.BUG_DETECTION,
        difficulty: 4,
        difficultyTier: Difficulty.EASY,
        requirements: ['Identify the bug', 'Fix it without changing the algorithm logic', 'Explain why it was a bug'],
        templates: [{
            language: 'typescript',
            template: `function binarySearch(arr: number[], target: number): number {\n  // Fix the implementation\n}`,
            signature: 'function binarySearch(arr, target): number',
        }],
        testCases: [
            { id: 'tc1', name: 'Find existing', input: [[1, 2, 3, 4, 5], 3], expectedOutput: 2, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Not found', input: [[1, 2, 3, 4, 5], 6], expectedOutput: -1, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Edge cases', input: [[1], 1], expectedOutput: 0, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Large array', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['bug', 'binary-search', 'algorithm'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    // === ALGORITHM CHALLENGES ===
    {
        id: 'algo_001',
        title: 'Find All Anagram Indices',
        description: `Given a string \`s\` and a non-empty string \`p\`, find all the start indices of \`p\`'s anagrams in \`s\`. Return the indices in ascending order.`,
        category: ChallengeCategory.ALGORITHM_DESIGN,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Time complexity should be O(n)',
            'Handle large inputs efficiently',
            'Return empty array if no anagrams found',
        ],
        hints: ['Consider using a sliding window approach', 'Use frequency maps'],
        templates: [{
            language: 'typescript',
            template: `function findAnagrams(s: string, p: string): number[] {\n  // Implement your solution\n}`,
            signature: 'function findAnagrams(s, p): number[]',
        }],
        testCases: [
            { id: 'tc1', name: 'Multiple anagrams', input: ['cbaebabacd', 'abc'], expectedOutput: [0, 6], isHidden: false, points: 25 },
            { id: 'tc2', name: 'No anagrams', input: ['hello', 'abc'], expectedOutput: [], isHidden: false, points: 25 },
            { id: 'tc3', name: 'Overlapping', input: ['abab', 'ab'], expectedOutput: [0, 1, 2], isHidden: false, points: 25 },
            { id: 'tc4', name: 'Large input', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['algorithm', 'sliding-window', 'string'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    // === REFACTORING CHALLENGES ===
    {
        id: 'refactor_001',
        title: 'Refactor Nested Callbacks',
        description: `Refactor the following callback hell into clean, readable async/await code:

\`\`\`javascript
function fetchUserData(userId, callback) {
  getUser(userId, (err, user) => {
    if (err) return callback(err);
    getPosts(user.id, (err, posts) => {
      if (err) return callback(err);
      getComments(posts[0].id, (err, comments) => {
        if (err) return callback(err);
        callback(null, { user, posts, comments });
      });
    });
  });
}
\`\`\``,
        category: ChallengeCategory.REFACTORING,
        difficulty: 4,
        difficultyTier: Difficulty.EASY,
        requirements: [
            'Convert to async/await syntax',
            'Maintain the same functionality',
            'Add proper error handling',
        ],
        templates: [{
            language: 'typescript',
            template: `async function fetchUserData(userId: string) {\n  // Refactor here\n}`,
            signature: 'async function fetchUserData(userId): Promise<{user, posts, comments}>',
        }],
        testCases: [
            { id: 'tc1', name: 'Success case', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc2', name: 'Error handling', input: null, expectedOutput: true, isHidden: false, points: 35 },
            { id: 'tc3', name: 'Type safety', input: null, expectedOutput: true, isHidden: true, points: 35 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['refactor', 'async', 'clean-code'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    // === SECURITY CHALLENGES ===
    {
        id: 'security_001',
        title: 'Fix SQL Injection Vulnerability',
        description: `The following code is vulnerable to SQL injection. Identify and fix the vulnerability:

\`\`\`typescript
async function getUserByEmail(email: string) {
  const query = \`SELECT * FROM users WHERE email = '\${email}'\`;
  return await db.query(query);
}
\`\`\``,
        category: ChallengeCategory.SECURITY,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Identify the SQL injection vulnerability',
            'Fix using parameterized queries',
            'Explain the security implications',
        ],
        templates: [{
            language: 'typescript',
            template: `async function getUserByEmail(email: string) {\n  // Fix the vulnerability\n}`,
            signature: 'async function getUserByEmail(email): Promise<User>',
        }],
        testCases: [
            { id: 'tc1', name: 'Normal input', input: 'test@example.com', expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Injection attempt', input: "'; DROP TABLE users;--", expectedOutput: true, isHidden: false, points: 50 },
            { id: 'tc3', name: 'Special chars', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['security', 'sql-injection', 'database'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

export default challenges;
