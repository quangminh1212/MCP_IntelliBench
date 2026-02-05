/**
 * @fileoverview Test Generation Challenges
 * @module @mcp/intellibench/data/challenges/test-generation
 * @version 1.0.0
 */

import type { Challenge } from '../../shared/types/index.js';
import { ChallengeCategory, Difficulty } from '../../shared/types/index.js';

export const testGenerationChallenges: Challenge[] = [
    {
        id: 'test_001',
        title: 'Write Unit Tests for Calculator',
        description: `Write comprehensive unit tests for this Calculator class:

\`\`\`typescript
class Calculator {
  add(a: number, b: number): number { return a + b; }
  subtract(a: number, b: number): number { return a - b; }
  multiply(a: number, b: number): number { return a * b; }
  divide(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }
  power(base: number, exponent: number): number { return Math.pow(base, exponent); }
}
\`\`\``,
        category: ChallengeCategory.TEST_GENERATION,
        difficulty: 3,
        difficultyTier: Difficulty.EASY,
        requirements: [
            'Test all methods',
            'Include edge cases (zero, negative, large numbers)',
            'Test error conditions',
            'Achieve 100% code coverage',
        ],
        templates: [{
            language: 'typescript',
            template: `describe('Calculator', () => {\n  // Write your tests\n});`,
            signature: 'Jest/Vitest test suite for Calculator',
        }],
        testCases: [
            { id: 'tc1', name: 'All methods tested', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Edge cases covered', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Error handling tested', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Full coverage', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['testing', 'unit-test', 'coverage'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'test_002',
        title: 'Write Tests for Async Function',
        description: `Write tests for this async user service:

\`\`\`typescript
interface User { id: string; name: string; email: string; }

class UserService {
  constructor(private api: ApiClient) {}

  async getUser(id: string): Promise<User> {
    const response = await this.api.get(\`/users/\${id}\`);
    if (!response.ok) throw new Error('User not found');
    return response.data;
  }

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    const response = await this.api.post('/users', data);
    if (!response.ok) throw new Error('Failed to create user');
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    const response = await this.api.delete(\`/users/\${id}\`);
    if (!response.ok) throw new Error('Failed to delete user');
  }
}
\`\`\``,
        category: ChallengeCategory.TEST_GENERATION,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Mock the ApiClient',
            'Test success and failure cases',
            'Use async/await properly',
            'Test all methods',
        ],
        templates: [{
            language: 'typescript',
            template: `describe('UserService', () => {\n  let service: UserService;\n  let mockApi: jest.Mocked<ApiClient>;\n\n  beforeEach(() => {\n    // Setup\n  });\n\n  // Write your tests\n});`,
            signature: 'Jest/Vitest test suite with mocks',
        }],
        testCases: [
            { id: 'tc1', name: 'Get user success', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc2', name: 'Get user failure', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc3', name: 'Create user', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc4', name: 'Delete user', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc5', name: 'Mocking correct', input: null, expectedOutput: true, isHidden: true, points: 20 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['testing', 'async', 'mocking'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'test_003',
        title: 'Property-Based Testing',
        description: `Write property-based tests for a sorting function using fast-check or similar library. The function should satisfy these properties:
- Output length equals input length
- Output is sorted
- Output contains the same elements as input`,
        category: ChallengeCategory.TEST_GENERATION,
        difficulty: 7,
        difficultyTier: Difficulty.HARD,
        requirements: [
            'Use property-based testing',
            'Define at least 3 properties',
            'Use arbitrary generators',
            'Handle edge cases automatically',
        ],
        templates: [{
            language: 'typescript',
            template: `import * as fc from 'fast-check';\n\nfunction sort(arr: number[]): number[] {\n  return [...arr].sort((a, b) => a - b);\n}\n\ndescribe('sort - property based tests', () => {\n  // Write your property-based tests\n});`,
            signature: 'Property-based tests using fast-check',
        }],
        testCases: [
            { id: 'tc1', name: 'Length preserved', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Is sorted', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Same elements', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Uses generators', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['testing', 'property-based', 'fast-check'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'test_004',
        title: 'Integration Tests for REST API',
        description: `Write integration tests for a REST API using supertest or similar:

\`\`\`typescript
// API endpoints:
// GET /api/products - List all products
// GET /api/products/:id - Get product by ID
// POST /api/products - Create product
// PUT /api/products/:id - Update product
// DELETE /api/products/:id - Delete product
\`\`\``,
        category: ChallengeCategory.TEST_GENERATION,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Test all CRUD operations',
            'Test response status codes',
            'Test response body structure',
            'Test error responses',
        ],
        templates: [{
            language: 'typescript',
            template: `import request from 'supertest';\nimport { app } from './app';\n\ndescribe('Products API', () => {\n  // Write your integration tests\n});`,
            signature: 'Supertest integration tests',
        }],
        testCases: [
            { id: 'tc1', name: 'List products', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc2', name: 'Get product', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc3', name: 'Create product', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc4', name: 'Update product', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc5', name: 'Delete product', input: null, expectedOutput: true, isHidden: true, points: 20 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['testing', 'integration', 'api'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'test_005',
        title: 'Write Snapshot Tests',
        description: `Write snapshot tests for a React component:

\`\`\`tsx
interface UserCardProps {
  user: { name: string; email: string; avatar?: string; role: 'admin' | 'user' };
  onEdit?: () => void;
  onDelete?: () => void;
}

function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <div className="user-card">
      <img src={user.avatar || '/default-avatar.png'} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <span className={\`role-badge \${user.role}\`}>{user.role}</span>
      {onEdit && <button onClick={onEdit}>Edit</button>}
      {onDelete && <button onClick={onDelete}>Delete</button>}
    </div>
  );
}
\`\`\``,
        category: ChallengeCategory.TEST_GENERATION,
        difficulty: 4,
        difficultyTier: Difficulty.EASY,
        requirements: [
            'Create snapshots for different prop combinations',
            'Test with and without optional props',
            'Test different user roles',
        ],
        templates: [{
            language: 'typescript',
            template: `import { render } from '@testing-library/react';\n\ndescribe('UserCard', () => {\n  // Write snapshot tests\n});`,
            signature: 'React snapshot tests',
        }],
        testCases: [
            { id: 'tc1', name: 'Basic render', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'With actions', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Admin role', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Without avatar', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['testing', 'snapshot', 'react'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'test_006',
        title: 'Write E2E Tests',
        description: `Write E2E tests for a login flow using Playwright or Cypress:

Flow:
1. User visits /login
2. User enters email and password
3. User clicks submit
4. On success: redirect to /dashboard
5. On failure: show error message`,
        category: ChallengeCategory.TEST_GENERATION,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Test successful login',
            'Test failed login with wrong password',
            'Test form validation',
            'Test redirect behavior',
        ],
        templates: [{
            language: 'typescript',
            template: `import { test, expect } from '@playwright/test';\n\ntest.describe('Login Flow', () => {\n  // Write E2E tests\n});`,
            signature: 'Playwright E2E tests',
        }],
        testCases: [
            { id: 'tc1', name: 'Successful login', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc2', name: 'Failed login', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc3', name: 'Form validation', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc4', name: 'Redirect', input: null, expectedOutput: true, isHidden: true, points: 20 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['testing', 'e2e', 'playwright'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

export default testGenerationChallenges;
