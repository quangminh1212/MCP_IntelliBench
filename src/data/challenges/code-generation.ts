/**
 * @fileoverview Code Generation Challenges
 * @module @mcp/intellibench/data/challenges/code-generation
 * @version 1.0.0
 */

import type { Challenge } from '../../shared/types/index.js';
import { ChallengeCategory, Difficulty } from '../../shared/types/index.js';

export const codeGenerationChallenges: Challenge[] = [
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
            { id: 'tc1', name: 'Basic push/pop', input: { ops: ['push', 'push', 'pop'], vals: [1, 2] }, expectedOutput: 2, isHidden: false, points: 20 },
            { id: 'tc2', name: 'Empty stack', input: { ops: ['pop'] }, expectedOutput: undefined, isHidden: false, points: 20 },
            { id: 'tc3', name: 'Peek operation', input: { ops: ['push', 'peek'], vals: [42] }, expectedOutput: 42, isHidden: false, points: 20 },
            { id: 'tc4', name: 'Size tracking', input: { ops: ['push', 'push', 'push', 'size'], vals: [1, 2, 3] }, expectedOutput: 3, isHidden: false, points: 20 },
            { id: 'tc5', name: 'Edge cases', input: { ops: ['isEmpty', 'push', 'isEmpty'], vals: [1] }, expectedOutput: false, isHidden: true, points: 20 },
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
    {
        id: 'codegen_003',
        title: 'Implement Promise.all',
        description: `Implement your own version of \`Promise.all\` that takes an array of promises and returns a promise that:
- Resolves with an array of results when all promises resolve
- Rejects immediately when any promise rejects`,
        category: ChallengeCategory.CODE_GENERATION,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Handle mixed resolved/rejected promises',
            'Maintain order of results',
            'Handle empty array input',
            'Handle non-promise values in the array',
        ],
        templates: [{
            language: 'typescript',
            template: `function promiseAll<T>(promises: (T | Promise<T>)[]): Promise<T[]> {\n  // Implement your solution\n}`,
            signature: 'function promiseAll(promises): Promise<T[]>',
        }],
        testCases: [
            { id: 'tc1', name: 'All resolve', input: [[1, 2, 3]], expectedOutput: [1, 2, 3], isHidden: false, points: 25 },
            { id: 'tc2', name: 'One rejects', input: null, expectedOutput: 'error', isHidden: false, points: 25 },
            { id: 'tc3', name: 'Empty array', input: [[]], expectedOutput: [], isHidden: false, points: 25 },
            { id: 'tc4', name: 'Mixed values', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['promise', 'async', 'utility'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'codegen_004',
        title: 'Deep Clone Implementation',
        description: `Implement a deep clone function that creates a complete copy of an object, including nested objects, arrays, dates, and handles circular references.`,
        category: ChallengeCategory.CODE_GENERATION,
        difficulty: 7,
        difficultyTier: Difficulty.HARD,
        requirements: [
            'Clone nested objects and arrays',
            'Handle Date objects',
            'Handle circular references',
            'Handle special values (null, undefined, NaN)',
        ],
        templates: [{
            language: 'typescript',
            template: `function deepClone<T>(obj: T): T {\n  // Implement your solution\n}`,
            signature: 'function deepClone(obj): T',
        }],
        testCases: [
            { id: 'tc1', name: 'Simple object', input: { a: 1, b: { c: 2 } }, expectedOutput: { a: 1, b: { c: 2 } }, isHidden: false, points: 20 },
            { id: 'tc2', name: 'Array', input: [1, [2, 3]], expectedOutput: [1, [2, 3]], isHidden: false, points: 20 },
            { id: 'tc3', name: 'Date object', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc4', name: 'Circular reference', input: null, expectedOutput: true, isHidden: true, points: 20 },
            { id: 'tc5', name: 'Special values', input: { a: null, b: undefined }, expectedOutput: true, isHidden: true, points: 20 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['object', 'utility', 'recursion'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'codegen_005',
        title: 'Event Emitter Implementation',
        description: `Implement an EventEmitter class with the following methods:
- \`on(event, listener)\`: Subscribe to an event
- \`off(event, listener)\`: Unsubscribe from an event
- \`emit(event, ...args)\`: Emit an event with arguments
- \`once(event, listener)\`: Subscribe to an event only once`,
        category: ChallengeCategory.CODE_GENERATION,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Support multiple listeners per event',
            'Correctly remove listeners',
            'Once listeners should auto-remove after first call',
        ],
        templates: [{
            language: 'typescript',
            template: `class EventEmitter {\n  // Implement your solution\n}`,
            signature: 'class EventEmitter { on, off, emit, once }',
        }],
        testCases: [
            { id: 'tc1', name: 'Basic emit', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Multiple listeners', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Remove listener', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Once listener', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['class', 'events', 'pattern'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'codegen_006',
        title: 'LRU Cache Implementation',
        description: `Implement an LRU (Least Recently Used) Cache with the following operations:
- \`get(key)\`: Get the value, return -1 if not found
- \`put(key, value)\`: Insert or update the value
- Both operations should be O(1) time complexity`,
        category: ChallengeCategory.CODE_GENERATION,
        difficulty: 7,
        difficultyTier: Difficulty.HARD,
        requirements: [
            'O(1) time complexity for get and put',
            'Evict least recently used item when capacity is exceeded',
            'Update access order on get',
        ],
        templates: [{
            language: 'typescript',
            template: `class LRUCache {\n  constructor(capacity: number) {\n    // Implement\n  }\n  get(key: number): number {\n    // Implement\n  }\n  put(key: number, value: number): void {\n    // Implement\n  }\n}`,
            signature: 'class LRUCache { constructor, get, put }',
        }],
        testCases: [
            { id: 'tc1', name: 'Basic operations', input: { capacity: 2, ops: ['put', 'put', 'get'], args: [[1, 1], [2, 2], [1]] }, expectedOutput: 1, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Eviction', input: { capacity: 2, ops: ['put', 'put', 'put', 'get'], args: [[1, 1], [2, 2], [3, 3], [1]] }, expectedOutput: -1, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Update order', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Edge cases', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['cache', 'data-structure', 'optimization'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'codegen_007',
        title: 'Binary Search Tree Implementation',
        description: `Implement a Binary Search Tree with the following operations:
- \`insert(value)\`: Insert a new value
- \`search(value)\`: Check if a value exists
- \`delete(value)\`: Remove a value
- \`inorder()\`: Return values in sorted order`,
        category: ChallengeCategory.CODE_GENERATION,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Maintain BST property after insertions and deletions',
            'Handle edge cases (empty tree, single node)',
            'Implement proper deletion with successor/predecessor',
        ],
        templates: [{
            language: 'typescript',
            template: `class BST {\n  // Implement your solution\n}`,
            signature: 'class BST { insert, search, delete, inorder }',
        }],
        testCases: [
            { id: 'tc1', name: 'Insert and search', input: { ops: ['insert', 'insert', 'search'], vals: [5, 3, 3] }, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Inorder traversal', input: { ops: ['insert', 'insert', 'insert', 'inorder'], vals: [5, 3, 7] }, expectedOutput: [3, 5, 7], isHidden: false, points: 25 },
            { id: 'tc3', name: 'Delete leaf', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Delete with children', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['tree', 'data-structure', 'recursion'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

export default codeGenerationChallenges;
