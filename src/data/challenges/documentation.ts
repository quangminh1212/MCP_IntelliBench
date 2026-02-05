/**
 * @fileoverview Documentation Challenges
 * @module @mcp/intellibench/data/challenges/documentation
 * @version 1.0.0
 */

import type { Challenge } from '../../shared/types/index.js';
import { ChallengeCategory, Difficulty } from '../../shared/types/index.js';

export const documentationChallenges: Challenge[] = [
    {
        id: 'docs_001',
        title: 'Write JSDoc Documentation',
        description: `Add comprehensive JSDoc documentation to this utility module:

\`\`\`typescript
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
\`\`\``,
        category: ChallengeCategory.DOCUMENTATION,
        difficulty: 4,
        difficultyTier: Difficulty.EASY,
        requirements: [
            'Add @param, @returns, @example for each function',
            'Include type annotations',
            'Add @throws if applicable',
            'Write clear descriptions',
        ],
        templates: [{
            language: 'typescript',
            template: `/**\n * @fileoverview Utility functions for function manipulation\n */\n\n// Add JSDoc to all functions`,
            signature: 'JSDoc documented module',
        }],
        testCases: [
            { id: 'tc1', name: 'All functions documented', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc2', name: 'Params documented', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Examples included', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Types specified', input: null, expectedOutput: true, isHidden: true, points: 20 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['documentation', 'jsdoc', 'comments'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'docs_002',
        title: 'Write API Documentation',
        description: `Write OpenAPI/Swagger documentation for a REST API with these endpoints:

- POST /auth/login - Login with email/password, returns JWT
- POST /auth/register - Register new user
- GET /users/:id - Get user profile (requires auth)
- PUT /users/:id - Update user profile (requires auth)
- GET /posts - List posts with pagination
- POST /posts - Create post (requires auth)`,
        category: ChallengeCategory.DOCUMENTATION,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Define all request/response schemas',
            'Document authentication requirements',
            'Include example requests/responses',
            'Document error responses',
        ],
        templates: [{
            language: 'typescript',
            template: `// Write OpenAPI 3.0 specification in YAML or JSON\nopenapi: 3.0.0\ninfo:\n  title: API Documentation\n  version: 1.0.0\npaths:\n  # Define endpoints`,
            signature: 'OpenAPI 3.0 specification',
        }],
        testCases: [
            { id: 'tc1', name: 'All endpoints defined', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Schemas defined', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Auth documented', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Examples included', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['documentation', 'openapi', 'swagger'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'docs_003',
        title: 'Write README Documentation',
        description: `Write a comprehensive README.md for an open-source library called "data-validator" that provides runtime data validation.`,
        category: ChallengeCategory.DOCUMENTATION,
        difficulty: 4,
        difficultyTier: Difficulty.EASY,
        requirements: [
            'Include installation instructions',
            'Provide usage examples',
            'Document API reference',
            'Add badges and contributing guide',
        ],
        templates: [{
            language: 'typescript',
            template: `# data-validator\n\n<!-- Write comprehensive README -->`,
            signature: 'README.md file',
        }],
        testCases: [
            { id: 'tc1', name: 'Installation section', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Usage examples', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'API reference', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Contributing guide', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['documentation', 'readme', 'markdown'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'docs_004',
        title: 'Document Complex Algorithm',
        description: `Write detailed documentation explaining this algorithm:

\`\`\`typescript
function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  if (nums1.length > nums2.length) {
    [nums1, nums2] = [nums2, nums1];
  }
  const m = nums1.length, n = nums2.length;
  let low = 0, high = m;

  while (low <= high) {
    const partitionX = Math.floor((low + high) / 2);
    const partitionY = Math.floor((m + n + 1) / 2) - partitionX;

    const maxLeftX = partitionX === 0 ? -Infinity : nums1[partitionX - 1];
    const minRightX = partitionX === m ? Infinity : nums1[partitionX];
    const maxLeftY = partitionY === 0 ? -Infinity : nums2[partitionY - 1];
    const minRightY = partitionY === n ? Infinity : nums2[partitionY];

    if (maxLeftX <= minRightY && maxLeftY <= minRightX) {
      if ((m + n) % 2 === 0) {
        return (Math.max(maxLeftX, maxLeftY) + Math.min(minRightX, minRightY)) / 2;
      }
      return Math.max(maxLeftX, maxLeftY);
    }
    if (maxLeftX > minRightY) high = partitionX - 1;
    else low = partitionX + 1;
  }
  throw new Error('Invalid input');
}
\`\`\``,
        category: ChallengeCategory.DOCUMENTATION,
        difficulty: 7,
        difficultyTier: Difficulty.HARD,
        requirements: [
            'Explain the algorithm step by step',
            'Include time and space complexity',
            'Add visual diagrams (ASCII or description)',
            'Provide example walkthrough',
        ],
        templates: [{
            language: 'typescript',
            template: `/**\n * @algorithm Median of Two Sorted Arrays\n *\n * // Document the algorithm\n */`,
            signature: 'Algorithm documentation',
        }],
        testCases: [
            { id: 'tc1', name: 'Clear explanation', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc2', name: 'Complexity analysis', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Example walkthrough', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Diagrams/visuals', input: null, expectedOutput: true, isHidden: true, points: 20 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['documentation', 'algorithm', 'technical-writing'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'docs_005',
        title: 'Write TypeScript Type Documentation',
        description: `Document these complex TypeScript types with clear explanations:

\`\`\`typescript
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

type Prettify<T> = { [K in keyof T]: T[K] } & {};

type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends
  ((k: infer I) => void) ? I : never;

type ExtractRouteParams<T extends string> =
  T extends \`\${infer _Start}:\${infer Param}/\${infer Rest}\`
    ? { [K in Param | keyof ExtractRouteParams<Rest>]: string }
    : T extends \`\${infer _Start}:\${infer Param}\`
      ? { [K in Param]: string }
      : {};
\`\`\``,
        category: ChallengeCategory.DOCUMENTATION,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Explain what each type does',
            'Show usage examples',
            'Explain the conditional type logic',
            'Document edge cases',
        ],
        templates: [{
            language: 'typescript',
            template: `/**\n * TypeScript Utility Types Documentation\n */\n\n// Document each type`,
            signature: 'Type documentation with examples',
        }],
        testCases: [
            { id: 'tc1', name: 'All types explained', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc2', name: 'Usage examples', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc3', name: 'Logic explained', input: null, expectedOutput: true, isHidden: true, points: 40 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['documentation', 'typescript', 'types'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'docs_006',
        title: 'Write Changelog Entry',
        description: `Write a detailed changelog entry for version 2.0.0 of a library that includes:
- Breaking changes: API method renamed, dropped Node 14 support
- New features: Added streaming support, new validation methods
- Bug fixes: Fixed memory leak, fixed race condition
- Deprecations: Old config format deprecated`,
        category: ChallengeCategory.DOCUMENTATION,
        difficulty: 3,
        difficultyTier: Difficulty.EASY,
        requirements: [
            'Follow Keep a Changelog format',
            'Include migration guide for breaking changes',
            'Link to relevant issues/PRs',
            'Clear and concise descriptions',
        ],
        templates: [{
            language: 'typescript',
            template: `# Changelog\n\n## [2.0.0] - 2024-01-15\n\n<!-- Write changelog entry -->`,
            signature: 'CHANGELOG.md entry',
        }],
        testCases: [
            { id: 'tc1', name: 'All sections present', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Breaking changes clear', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Migration guide', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Proper format', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['documentation', 'changelog', 'versioning'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

export default documentationChallenges;
