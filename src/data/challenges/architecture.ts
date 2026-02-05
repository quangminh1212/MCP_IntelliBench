/**
 * @fileoverview Architecture Design Challenges
 * @module @mcp/intellibench/data/challenges/architecture
 * @version 1.0.0
 */

import type { Challenge } from '../../shared/types/index.js';
import { ChallengeCategory, Difficulty } from '../../shared/types/index.js';

export const architectureChallenges: Challenge[] = [
    {
        id: 'arch_001',
        title: 'Design a URL Shortener',
        description: `Design a URL shortening service like bit.ly. The system should:
- Generate short URLs from long URLs
- Redirect short URLs to original URLs
- Handle high traffic (1M+ requests/day)
- Support custom short URLs
- Track click analytics`,
        category: ChallengeCategory.ARCHITECTURE,
        difficulty: 7,
        difficultyTier: Difficulty.HARD,
        requirements: [
            'Design the database schema',
            'Choose appropriate data structures',
            'Handle URL collision',
            'Design for scalability',
            'Include caching strategy',
        ],
        templates: [{
            language: 'typescript',
            template: `/**\n * URL Shortener System Design\n *\n * // Provide your design here\n */\n\ninterface URLShortenerDesign {\n  // Define your architecture\n}`,
            signature: 'System design document',
        }],
        testCases: [
            { id: 'tc1', name: 'Core functionality', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Scalability', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Database design', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Trade-offs discussed', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 600,
        memoryLimit: 256,
        tags: ['architecture', 'system-design', 'scalability'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'arch_002',
        title: 'Design Event-Driven Architecture',
        description: `Design an event-driven e-commerce order processing system:
- Order placed → Inventory check → Payment processing → Shipping
- Handle failures and retries
- Ensure eventual consistency
- Support order tracking`,
        category: ChallengeCategory.ARCHITECTURE,
        difficulty: 8,
        difficultyTier: Difficulty.HARD,
        requirements: [
            'Define event schemas',
            'Design message queues/topics',
            'Handle failure scenarios',
            'Implement saga pattern for transactions',
            'Include monitoring/observability',
        ],
        templates: [{
            language: 'typescript',
            template: `/**\n * Event-Driven Order Processing System\n */\n\n// Define events\ninterface OrderPlacedEvent {\n  // Define\n}\n\n// Define architecture`,
            signature: 'Event-driven architecture design',
        }],
        testCases: [
            { id: 'tc1', name: 'Event schemas', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Failure handling', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Saga pattern', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Observability', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 600,
        memoryLimit: 256,
        tags: ['architecture', 'event-driven', 'microservices'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'arch_003',
        title: 'Design a Rate Limiter',
        description: `Design a distributed rate limiter that:
- Limits requests per user/IP
- Works across multiple servers
- Supports different rate limit tiers
- Handles burst traffic
- Returns appropriate headers`,
        category: ChallengeCategory.ARCHITECTURE,
        difficulty: 7,
        difficultyTier: Difficulty.HARD,
        requirements: [
            'Choose rate limiting algorithm',
            'Design for distributed systems',
            'Handle edge cases',
            'Minimize latency impact',
        ],
        templates: [{
            language: 'typescript',
            template: `/**\n * Distributed Rate Limiter Design\n */\n\ninterface RateLimiterConfig {\n  // Define configuration\n}\n\nclass DistributedRateLimiter {\n  // Design the implementation\n}`,
            signature: 'Rate limiter architecture',
        }],
        testCases: [
            { id: 'tc1', name: 'Algorithm choice', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Distributed design', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Edge cases', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Performance', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 600,
        memoryLimit: 256,
        tags: ['architecture', 'rate-limiting', 'distributed-systems'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'arch_004',
        title: 'Design a Chat Application',
        description: `Design a real-time chat application supporting:
- 1-on-1 and group chats
- Message delivery status (sent, delivered, read)
- Offline message sync
- File/image sharing
- Push notifications`,
        category: ChallengeCategory.ARCHITECTURE,
        difficulty: 8,
        difficultyTier: Difficulty.EXPERT,
        requirements: [
            'Design real-time communication layer',
            'Handle presence detection',
            'Design message storage',
            'Plan for offline sync',
            'Consider end-to-end encryption',
        ],
        templates: [{
            language: 'typescript',
            template: `/**\n * Real-time Chat Application Architecture\n */\n\n// Define message types\ninterface Message {\n  // Define\n}\n\n// Design the architecture`,
            signature: 'Chat application architecture',
        }],
        testCases: [
            { id: 'tc1', name: 'Real-time design', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc2', name: 'Message delivery', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc3', name: 'Offline sync', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc4', name: 'Scalability', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc5', name: 'Security', input: null, expectedOutput: true, isHidden: true, points: 20 },
        ],
        maxScore: 100,
        timeLimit: 600,
        memoryLimit: 256,
        tags: ['architecture', 'real-time', 'websocket'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'arch_005',
        title: 'Design a Plugin System',
        description: `Design a plugin architecture for an IDE/editor:
- Load plugins dynamically
- Plugins can extend UI, add commands, modify behavior
- Handle plugin dependencies
- Sandbox plugins for security
- Support hot reload`,
        category: ChallengeCategory.ARCHITECTURE,
        difficulty: 7,
        difficultyTier: Difficulty.HARD,
        requirements: [
            'Define plugin API/interface',
            'Design plugin lifecycle',
            'Handle versioning and dependencies',
            'Implement sandboxing strategy',
        ],
        templates: [{
            language: 'typescript',
            template: `/**\n * Plugin System Architecture\n */\n\ninterface Plugin {\n  // Define plugin interface\n}\n\ninterface PluginManager {\n  // Define manager interface\n}`,
            signature: 'Plugin system design',
        }],
        testCases: [
            { id: 'tc1', name: 'Plugin interface', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Lifecycle management', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Dependencies', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Security sandboxing', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 600,
        memoryLimit: 256,
        tags: ['architecture', 'plugin', 'extensibility'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'arch_006',
        title: 'Design a Search Engine',
        description: `Design a search system for an e-commerce platform:
- Full-text search on products
- Faceted filtering
- Typo tolerance and suggestions
- Relevance ranking
- Search analytics`,
        category: ChallengeCategory.ARCHITECTURE,
        difficulty: 8,
        difficultyTier: Difficulty.EXPERT,
        requirements: [
            'Choose search technology',
            'Design indexing strategy',
            'Implement relevance scoring',
            'Handle real-time updates',
            'Plan for scale',
        ],
        templates: [{
            language: 'typescript',
            template: `/**\n * E-commerce Search Engine Design\n */\n\ninterface SearchQuery {\n  // Define\n}\n\ninterface SearchResult {\n  // Define\n}\n\n// Design the architecture`,
            signature: 'Search engine architecture',
        }],
        testCases: [
            { id: 'tc1', name: 'Technology choice', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc2', name: 'Indexing strategy', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc3', name: 'Relevance ranking', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc4', name: 'Real-time updates', input: null, expectedOutput: true, isHidden: false, points: 20 },
            { id: 'tc5', name: 'Scalability', input: null, expectedOutput: true, isHidden: true, points: 20 },
        ],
        maxScore: 100,
        timeLimit: 600,
        memoryLimit: 256,
        tags: ['architecture', 'search', 'elasticsearch'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'arch_007',
        title: 'Design CQRS Pattern',
        description: `Implement CQRS (Command Query Responsibility Segregation) for a banking system:
- Separate read and write models
- Event sourcing for transactions
- Eventual consistency handling
- Audit trail`,
        category: ChallengeCategory.ARCHITECTURE,
        difficulty: 8,
        difficultyTier: Difficulty.EXPERT,
        requirements: [
            'Define command and query models',
            'Implement event sourcing',
            'Handle consistency',
            'Design projection updates',
        ],
        templates: [{
            language: 'typescript',
            template: `/**\n * CQRS Banking System Design\n */\n\n// Commands\ninterface TransferMoneyCommand {\n  // Define\n}\n\n// Events\ninterface MoneyTransferredEvent {\n  // Define\n}\n\n// Design the architecture`,
            signature: 'CQRS architecture design',
        }],
        testCases: [
            { id: 'tc1', name: 'Command model', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Query model', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Event sourcing', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Consistency handling', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 600,
        memoryLimit: 256,
        tags: ['architecture', 'cqrs', 'event-sourcing'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

export default architectureChallenges;
