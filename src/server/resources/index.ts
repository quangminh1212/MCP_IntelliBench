/**
 * @fileoverview MCP Resources Definitions and Handlers
 * @module @mcp/intellibench/server/resources
 * @version 1.0.0
 */

import { MCP_RESOURCES } from '../../shared/constants/index.js';
import type { BenchmarkEngine } from '../../core/benchmark/engine.js';
import type { SessionManager } from '../../core/sessions/manager.js';
import type { ChallengeRepository } from '../../core/challenges/repository.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Service context for resource handlers
 */
export interface ResourceContext {
    benchmarkEngine: BenchmarkEngine;
    sessionManager: SessionManager;
    challengeRepository: ChallengeRepository;
}

/**
 * Resource read result
 */
export interface ResourceResult {
    contents: Array<{
        uri: string;
        mimeType: string;
        text?: string;
        blob?: string;
    }>;
}

// ============================================================================
// Resource Definitions
// ============================================================================

/**
 * MCP Resource definitions
 */
export const resourceDefinitions = [
    {
        uri: MCP_RESOURCES.CHALLENGES,
        name: 'Available Challenges',
        description: 'List of all available benchmark challenges with their categories and difficulties',
        mimeType: 'application/json',
    },
    {
        uri: `${MCP_RESOURCES.SESSIONS}/{sessionId}`,
        name: 'Session Details',
        description: 'Get details of a specific benchmark session',
        mimeType: 'application/json',
    },
    {
        uri: `${MCP_RESOURCES.RESULTS}/{sessionId}`,
        name: 'Session Results',
        description: 'Get comprehensive results for a completed session',
        mimeType: 'application/json',
    },
    {
        uri: MCP_RESOURCES.LEADERBOARD,
        name: 'Leaderboard',
        description: 'Current benchmark leaderboard',
        mimeType: 'application/json',
    },
];

// ============================================================================
// Resource Handlers
// ============================================================================

/**
 * Handle resource read requests from MCP clients
 */
export async function handleResourceRead(
    uri: string,
    context: ResourceContext
): Promise<ResourceResult> {
    // Parse the URI
    const url = new URL(uri);
    const path = url.pathname;
    const pathParts = path.split('/').filter(Boolean);

    // Route to appropriate handler
    if (uri === MCP_RESOURCES.CHALLENGES) {
        return await handleChallengesResource(context);
    }

    if (uri === MCP_RESOURCES.LEADERBOARD) {
        return await handleLeaderboardResource(context);
    }

    if (uri.startsWith(MCP_RESOURCES.SESSIONS) && pathParts.length >= 2) {
        const sessionId = pathParts[1];
        if (sessionId) {
            return await handleSessionResource(sessionId, context);
        }
    }

    if (uri.startsWith(MCP_RESOURCES.RESULTS) && pathParts.length >= 2) {
        const sessionId = pathParts[1];
        if (sessionId) {
            return await handleResultsResource(sessionId, context);
        }
    }

    throw new Error(`Unknown resource: ${uri}`);
}

// ============================================================================
// Handler Implementations
// ============================================================================

/**
 * Handle challenges resource
 */
async function handleChallengesResource(context: ResourceContext): Promise<ResourceResult> {
    const challenges = await context.challengeRepository.listChallenges({});

    const data = {
        totalChallenges: challenges.length,
        categories: groupByCategory(challenges),
        challenges: challenges.map((c) => ({
            id: c.id,
            title: c.title,
            category: c.category,
            difficulty: c.difficulty,
            difficultyTier: c.difficultyTier,
            maxScore: c.maxScore,
            tags: c.tags,
        })),
    };

    return {
        contents: [
            {
                uri: MCP_RESOURCES.CHALLENGES,
                mimeType: 'application/json',
                text: JSON.stringify(data, null, 2),
            },
        ],
    };
}

/**
 * Handle session resource
 */
async function handleSessionResource(
    sessionId: string,
    context: ResourceContext
): Promise<ResourceResult> {
    const session = await context.sessionManager.getSession(sessionId);

    if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
    }

    const data = {
        id: session.id,
        name: session.name,
        status: session.status,
        config: session.config,
        progress: {
            current: session.currentChallengeIndex + 1,
            total: session.challengeIds.length,
            completed: session.results.length,
        },
        startedAt: session.startedAt,
        completedAt: session.completedAt,
    };

    return {
        contents: [
            {
                uri: `${MCP_RESOURCES.SESSIONS}/${sessionId}`,
                mimeType: 'application/json',
                text: JSON.stringify(data, null, 2),
            },
        ],
    };
}

/**
 * Handle results resource
 */
async function handleResultsResource(
    sessionId: string,
    context: ResourceContext
): Promise<ResourceResult> {
    const results = await context.benchmarkEngine.getSessionResults(sessionId);

    return {
        contents: [
            {
                uri: `${MCP_RESOURCES.RESULTS}/${sessionId}`,
                mimeType: 'application/json',
                text: JSON.stringify(results, null, 2),
            },
        ],
    };
}

/**
 * Handle leaderboard resource
 */
async function handleLeaderboardResource(context: ResourceContext): Promise<ResourceResult> {
    const leaderboard = await context.benchmarkEngine.getLeaderboard({
        limit: 10,
        timeframe: 'all',
    });

    return {
        contents: [
            {
                uri: MCP_RESOURCES.LEADERBOARD,
                mimeType: 'application/json',
                text: JSON.stringify(leaderboard, null, 2),
            },
        ],
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

interface CategorySummary {
    name: string;
    count: number;
    difficulties: Record<string, number>;
}

function groupByCategory(
    challenges: Array<{ category: string; difficulty: number }>
): CategorySummary[] {
    const categoryMap = new Map<string, CategorySummary>();

    for (const challenge of challenges) {
        const existing = categoryMap.get(challenge.category);

        if (existing) {
            existing.count++;
            const diffKey = challenge.difficulty.toString();
            existing.difficulties[diffKey] = (existing.difficulties[diffKey] ?? 0) + 1;
        } else {
            const diffKey = challenge.difficulty.toString();
            categoryMap.set(challenge.category, {
                name: challenge.category,
                count: 1,
                difficulties: { [diffKey]: 1 },
            });
        }
    }

    return Array.from(categoryMap.values());
}
