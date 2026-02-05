/**
 * @fileoverview Bug Detection and Fixing Challenges
 * @module @mcp/intellibench/data/challenges/bug-detection
 * @version 1.0.0
 */

import type { Challenge } from '../../shared/types/index.js';
import { ChallengeCategory, Difficulty } from '../../shared/types/index.js';

export const bugDetectionChallenges: Challenge[] = [
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
    {
        id: 'bugfix_002',
        title: 'Fix the Race Condition',
        description: `The following async code has a race condition. Fix it.

\`\`\`typescript
class Counter {
  private count = 0;

  async increment() {
    const current = this.count;
    await someAsyncOperation();
    this.count = current + 1;
  }

  getCount() {
    return this.count;
  }
}
\`\`\``,
        category: ChallengeCategory.BUG_DETECTION,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: ['Identify the race condition', 'Implement proper synchronization', 'Ensure thread-safe operations'],
        templates: [{
            language: 'typescript',
            template: `class Counter {\n  private count = 0;\n  // Fix the race condition\n}`,
            signature: 'class Counter { increment, getCount }',
        }],
        testCases: [
            { id: 'tc1', name: 'Sequential increments', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc2', name: 'Concurrent increments', input: null, expectedOutput: true, isHidden: false, points: 35 },
            { id: 'tc3', name: 'Many concurrent', input: null, expectedOutput: true, isHidden: true, points: 35 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['bug', 'concurrency', 'async'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'bugfix_003',
        title: 'Fix the Memory Leak',
        description: `The following code has a memory leak. Identify and fix it.

\`\`\`typescript
class EventManager {
  private handlers: Map<string, Function[]> = new Map();

  subscribe(event: string, handler: Function) {
    const handlers = this.handlers.get(event) || [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
  }

  emit(event: string, data: any) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(h => h(data));
  }
}

// Usage that causes memory leak
function setup() {
  const manager = new EventManager();
  setInterval(() => {
    manager.subscribe('tick', () => console.log('tick'));
  }, 1000);
}
\`\`\``,
        category: ChallengeCategory.BUG_DETECTION,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: ['Identify the memory leak source', 'Implement unsubscribe mechanism', 'Add cleanup functionality'],
        templates: [{
            language: 'typescript',
            template: `class EventManager {\n  // Fix the memory leak\n}`,
            signature: 'class EventManager { subscribe, unsubscribe, emit }',
        }],
        testCases: [
            { id: 'tc1', name: 'Subscribe and emit', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc2', name: 'Unsubscribe works', input: null, expectedOutput: true, isHidden: false, points: 35 },
            { id: 'tc3', name: 'No memory growth', input: null, expectedOutput: true, isHidden: true, points: 35 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['bug', 'memory-leak', 'events'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'bugfix_004',
        title: 'Fix the Infinite Loop',
        description: `The following recursive function has an issue that can cause infinite loops. Fix it.

\`\`\`typescript
function flatten(arr: any[]): any[] {
  const result: any[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

// This causes issues:
const obj: any = { nested: [] };
obj.nested.push(obj);
flatten([1, [2, obj]]); // Infinite loop!
\`\`\``,
        category: ChallengeCategory.BUG_DETECTION,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: ['Handle circular references', 'Maintain flatten functionality', 'Add depth limit option'],
        templates: [{
            language: 'typescript',
            template: `function flatten(arr: any[], maxDepth?: number): any[] {\n  // Fix the infinite loop\n}`,
            signature: 'function flatten(arr, maxDepth?): any[]',
        }],
        testCases: [
            { id: 'tc1', name: 'Normal flatten', input: [[1, [2, [3, 4]], 5]], expectedOutput: [1, 2, 3, 4, 5], isHidden: false, points: 25 },
            { id: 'tc2', name: 'Circular reference', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'With depth limit', input: [[1, [2, [3]]], 1], expectedOutput: [1, 2, [3]], isHidden: false, points: 25 },
            { id: 'tc4', name: 'Empty array', input: [[]], expectedOutput: [], isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['bug', 'recursion', 'circular-reference'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'bugfix_005',
        title: 'Fix the Floating Point Comparison',
        description: `The following function has issues with floating point comparisons. Fix it.

\`\`\`typescript
function calculateDiscount(price: number, discount: number): boolean {
  const discounted = price * (1 - discount);
  const expected = price - (price * discount);
  return discounted === expected;
}

// Returns false due to floating point errors:
calculateDiscount(19.99, 0.15);
\`\`\``,
        category: ChallengeCategory.BUG_DETECTION,
        difficulty: 4,
        difficultyTier: Difficulty.EASY,
        requirements: ['Handle floating point precision', 'Use epsilon comparison', 'Round to appropriate decimal places'],
        templates: [{
            language: 'typescript',
            template: `function calculateDiscount(price: number, discount: number): number {\n  // Fix floating point issues and return the discounted price\n}`,
            signature: 'function calculateDiscount(price, discount): number',
        }],
        testCases: [
            { id: 'tc1', name: 'Basic discount', input: [100, 0.1], expectedOutput: 90, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Precision issue', input: [19.99, 0.15], expectedOutput: 16.99, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Zero discount', input: [50, 0], expectedOutput: 50, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Full discount', input: [100, 1], expectedOutput: 0, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['bug', 'floating-point', 'precision'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'bugfix_006',
        title: 'Fix the Off-by-One Error',
        description: `The following pagination function has off-by-one errors. Fix them.

\`\`\`typescript
function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = page * pageSize;
  const end = start + pageSize - 1;
  return items.slice(start, end);
}

// Issues:
// paginate([1,2,3,4,5], 1, 2) returns [3] instead of [3,4]
// paginate([1,2,3,4,5], 0, 2) returns [1] instead of [1,2]
\`\`\``,
        category: ChallengeCategory.BUG_DETECTION,
        difficulty: 3,
        difficultyTier: Difficulty.EASY,
        requirements: ['Fix slice boundaries', 'Handle edge cases (last page)', '0-indexed pages'],
        templates: [{
            language: 'typescript',
            template: `function paginate<T>(items: T[], page: number, pageSize: number): T[] {\n  // Fix the off-by-one errors\n}`,
            signature: 'function paginate(items, page, pageSize): T[]',
        }],
        testCases: [
            { id: 'tc1', name: 'First page', input: [[1, 2, 3, 4, 5], 0, 2], expectedOutput: [1, 2], isHidden: false, points: 25 },
            { id: 'tc2', name: 'Middle page', input: [[1, 2, 3, 4, 5], 1, 2], expectedOutput: [3, 4], isHidden: false, points: 25 },
            { id: 'tc3', name: 'Last page', input: [[1, 2, 3, 4, 5], 2, 2], expectedOutput: [5], isHidden: false, points: 25 },
            { id: 'tc4', name: 'Out of bounds', input: [[1, 2, 3], 5, 2], expectedOutput: [], isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['bug', 'off-by-one', 'pagination'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

export default bugDetectionChallenges;
