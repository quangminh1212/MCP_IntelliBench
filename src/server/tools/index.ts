/**
 * @fileoverview MCP Tools Definitions and Handlers
 * @module @mcp/intellibench/server/tools
 * @version 1.0.0
 */

import { z } from 'zod';
import type { ChallengeCategory, Difficulty } from '../../shared/types/index.js';
import { MCP_TOOLS } from '../../shared/constants/index.js';
import type { BenchmarkEngine } from '../../core/benchmark/engine.js';
import type { SessionManager } from '../../core/sessions/manager.js';
import type { ChallengeRepository } from '../../core/challenges/repository.js';
import type { ScoringEngine } from '../../core/scoring/engine.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Service context for tool handlers
 */
export interface ToolContext {
    benchmarkEngine: BenchmarkEngine;
    sessionManager: SessionManager;
    challengeRepository: ChallengeRepository;
    scoringEngine: ScoringEngine;
}

/**
 * Tool call result
 */
export interface ToolResult {
    content: Array<{
        type: 'text';
        text: string;
    }>;
    isError?: boolean;
}

// ============================================================================
// Input Schemas
// ============================================================================

const StartSessionSchema = z.object({
    sessionName: z.string().optional().describe('Optional name for the benchmark session'),
    categories: z
        .array(z.string())
        .optional()
        .describe('Categories to include (e.g., ["code_generation", "bug_detection"])'),
    difficulty: z
        .enum(['easy', 'medium', 'hard', 'expert', 'all'])
        .optional()
        .describe('Difficulty level filter'),
    maxChallenges: z
        .number()
        .min(1)
        .max(50)
        .optional()
        .describe('Maximum number of challenges in the session'),
});

const GetChallengeSchema = z.object({
    sessionId: z.string().describe('The active session ID'),
});

const SubmitSolutionSchema = z.object({
    sessionId: z.string().describe('The active session ID'),
    challengeId: z.string().describe('The challenge ID being solved'),
    solution: z.string().describe('The submitted solution code'),
    language: z
        .enum(['typescript', 'javascript', 'python', 'java', 'csharp', 'go', 'rust', 'cpp'])
        .optional()
        .describe('Programming language of the solution'),
});

const GetResultsSchema = z.object({
    sessionId: z.string().describe('The session ID to get results for'),
});

const GetLeaderboardSchema = z.object({
    category: z.string().optional().describe('Optional category filter'),
    limit: z.number().min(1).max(100).optional().describe('Number of entries to return'),
    timeframe: z
        .enum(['daily', 'weekly', 'monthly', 'all'])
        .optional()
        .describe('Timeframe for the leaderboard'),
});

const ListChallengesSchema = z.object({
    category: z.string().optional().describe('Optional category filter'),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert', 'all']).optional(),
    limit: z.number().min(1).max(100).optional(),
});

const SessionStatusSchema = z.object({
    sessionId: z.string().describe('The session ID to check'),
});

const SkipChallengeSchema = z.object({
    sessionId: z.string().describe('The active session ID'),
    reason: z.string().optional().describe('Optional reason for skipping'),
});

// ============================================================================
// Tool Definitions
// ============================================================================

/**
 * MCP Tool definitions
 */
export const toolDefinitions = [
    {
        name: MCP_TOOLS.START_SESSION,
        description: `Start a new AI coding intelligence benchmark session. This will create a session with selected challenges based on the provided configuration.`,
        inputSchema: {
            type: 'object' as const,
            properties: {
                sessionName: {
                    type: 'string',
                    description: 'Optional name for the benchmark session',
                },
                categories: {
                    type: 'array',
                    items: { type: 'string' },
                    description:
                        'Categories to include: code_generation, bug_detection, refactoring, algorithm_design, test_generation, documentation, architecture, security',
                },
                difficulty: {
                    type: 'string',
                    enum: ['easy', 'medium', 'hard', 'expert', 'all'],
                    description: 'Difficulty level filter',
                },
                maxChallenges: {
                    type: 'number',
                    minimum: 1,
                    maximum: 50,
                    description: 'Maximum number of challenges in the session',
                },
            },
        },
    },
    {
        name: MCP_TOOLS.GET_CHALLENGE,
        description: `Get the next challenge in the current benchmark session. Returns the challenge details including description, requirements, and code template.`,
        inputSchema: {
            type: 'object' as const,
            properties: {
                sessionId: {
                    type: 'string',
                    description: 'The active session ID',
                },
            },
            required: ['sessionId'],
        },
    },
    {
        name: MCP_TOOLS.SUBMIT_SOLUTION,
        description: `Submit a solution for the current challenge. The solution will be evaluated and scored across multiple dimensions.`,
        inputSchema: {
            type: 'object' as const,
            properties: {
                sessionId: {
                    type: 'string',
                    description: 'The active session ID',
                },
                challengeId: {
                    type: 'string',
                    description: 'The challenge ID being solved',
                },
                solution: {
                    type: 'string',
                    description: 'The submitted solution code',
                },
                language: {
                    type: 'string',
                    enum: ['typescript', 'javascript', 'python', 'java', 'csharp', 'go', 'rust', 'cpp'],
                    description: 'Programming language of the solution',
                },
            },
            required: ['sessionId', 'challengeId', 'solution'],
        },
    },
    {
        name: MCP_TOOLS.GET_RESULTS,
        description: `Get comprehensive results for a completed benchmark session, including overall score, category breakdown, strengths, weaknesses, and recommendations.`,
        inputSchema: {
            type: 'object' as const,
            properties: {
                sessionId: {
                    type: 'string',
                    description: 'The session ID to get results for',
                },
            },
            required: ['sessionId'],
        },
    },
    {
        name: MCP_TOOLS.GET_LEADERBOARD,
        description: `Get the current leaderboard showing top AI coding performers.`,
        inputSchema: {
            type: 'object' as const,
            properties: {
                category: {
                    type: 'string',
                    description: 'Optional category filter',
                },
                limit: {
                    type: 'number',
                    minimum: 1,
                    maximum: 100,
                    description: 'Number of entries to return',
                },
                timeframe: {
                    type: 'string',
                    enum: ['daily', 'weekly', 'monthly', 'all'],
                    description: 'Timeframe for the leaderboard',
                },
            },
        },
    },
    {
        name: MCP_TOOLS.LIST_CHALLENGES,
        description: `List available benchmark challenges with optional filtering by category and difficulty.`,
        inputSchema: {
            type: 'object' as const,
            properties: {
                category: {
                    type: 'string',
                    description: 'Optional category filter',
                },
                difficulty: {
                    type: 'string',
                    enum: ['easy', 'medium', 'hard', 'expert', 'all'],
                    description: 'Difficulty filter',
                },
                limit: {
                    type: 'number',
                    minimum: 1,
                    maximum: 100,
                    description: 'Maximum number of challenges to return',
                },
            },
        },
    },
    {
        name: MCP_TOOLS.GET_SESSION_STATUS,
        description: `Get the current status of a benchmark session including progress and completed challenges.`,
        inputSchema: {
            type: 'object' as const,
            properties: {
                sessionId: {
                    type: 'string',
                    description: 'The session ID to check',
                },
            },
            required: ['sessionId'],
        },
    },
    {
        name: MCP_TOOLS.SKIP_CHALLENGE,
        description: `Skip the current challenge in the session. This will mark the challenge as skipped with zero score.`,
        inputSchema: {
            type: 'object' as const,
            properties: {
                sessionId: {
                    type: 'string',
                    description: 'The active session ID',
                },
                reason: {
                    type: 'string',
                    description: 'Optional reason for skipping',
                },
            },
            required: ['sessionId'],
        },
    },
];

// ============================================================================
// Tool Handlers
// ============================================================================

/**
 * Handle tool calls from MCP clients
 */
export async function handleToolCall(
    name: string,
    args: Record<string, unknown>,
    context: ToolContext
): Promise<ToolResult> {
    try {
        switch (name) {
            case MCP_TOOLS.START_SESSION:
                return await handleStartSession(args, context);

            case MCP_TOOLS.GET_CHALLENGE:
                return await handleGetChallenge(args, context);

            case MCP_TOOLS.SUBMIT_SOLUTION:
                return await handleSubmitSolution(args, context);

            case MCP_TOOLS.GET_RESULTS:
                return await handleGetResults(args, context);

            case MCP_TOOLS.GET_LEADERBOARD:
                return await handleGetLeaderboard(args, context);

            case MCP_TOOLS.LIST_CHALLENGES:
                return await handleListChallenges(args, context);

            case MCP_TOOLS.GET_SESSION_STATUS:
                return await handleGetSessionStatus(args, context);

            case MCP_TOOLS.SKIP_CHALLENGE:
                return await handleSkipChallenge(args, context);

            default:
                return createErrorResult(`Unknown tool: ${name}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        return createErrorResult(message);
    }
}

// ============================================================================
// Handler Implementations
// ============================================================================

async function handleStartSession(
    args: Record<string, unknown>,
    context: ToolContext
): Promise<ToolResult> {
    const input = StartSessionSchema.parse(args);

    const session = await context.benchmarkEngine.startSession({
        name: input.sessionName,
        categories: input.categories as ChallengeCategory[] | undefined,
        difficulty: mapDifficulty(input.difficulty),
        maxChallenges: input.maxChallenges,
    });

    return createSuccessResult({
        sessionId: session.id,
        sessionName: session.name,
        totalChallenges: session.challengeIds.length,
        estimatedTime: formatEstimatedTime(session.challengeIds.length),
        message: `Benchmark session started! You have ${session.challengeIds.length} challenges to complete. Use 'intellibench_get_challenge' to get the first challenge.`,
    });
}

async function handleGetChallenge(
    args: Record<string, unknown>,
    context: ToolContext
): Promise<ToolResult> {
    const input = GetChallengeSchema.parse(args);

    const challenge = await context.benchmarkEngine.getCurrentChallenge(input.sessionId);

    if (!challenge) {
        return createSuccessResult({
            message: 'No more challenges. Session is complete! Use intellibench_get_results to see your final score.',
            completed: true,
        });
    }

    return createSuccessResult({
        challengeId: challenge.id,
        title: challenge.title,
        category: challenge.category,
        difficulty: challenge.difficulty,
        description: challenge.description,
        requirements: challenge.requirements,
        hints: challenge.hints,
        timeLimit: challenge.timeLimit,
        maxScore: challenge.maxScore,
        template: challenge.templates[0],
    });
}

async function handleSubmitSolution(
    args: Record<string, unknown>,
    context: ToolContext
): Promise<ToolResult> {
    const input = SubmitSolutionSchema.parse(args);

    const result = await context.benchmarkEngine.submitSolution(
        input.sessionId,
        input.challengeId,
        input.solution,
        input.language ?? 'typescript'
    );

    return createSuccessResult({
        score: result.score,
        maxScore: result.maxScore,
        percentage: Math.round((result.score / result.maxScore) * 100),
        passed: result.passed,
        breakdown: result.breakdown,
        feedback: result.feedback,
        suggestions: result.suggestions,
        message: result.passed
            ? '✅ Challenge passed! Use intellibench_get_challenge for the next challenge.'
            : '❌ Challenge not passed. Review the feedback and try again, or skip to the next challenge.',
    });
}

async function handleGetResults(
    args: Record<string, unknown>,
    context: ToolContext
): Promise<ToolResult> {
    const input = GetResultsSchema.parse(args);

    const results = await context.benchmarkEngine.getSessionResults(input.sessionId);

    return createSuccessResult({
        overallScore: results.overallScore,
        maxScore: results.maxScore,
        percentage: results.percentage,
        percentile: results.percentile,
        categoryScores: results.categoryScores,
        strengths: results.strengths,
        weaknesses: results.weaknesses,
        recommendations: results.recommendations,
        completedChallenges: results.completedChallenges,
        totalChallenges: results.totalChallenges,
        passRate: results.passRate,
        totalTime: results.totalTime,
    });
}

async function handleGetLeaderboard(
    args: Record<string, unknown>,
    context: ToolContext
): Promise<ToolResult> {
    const input = GetLeaderboardSchema.parse(args);

    const leaderboard = await context.benchmarkEngine.getLeaderboard({
        category: input.category as ChallengeCategory | undefined,
        limit: input.limit,
        timeframe: input.timeframe,
    });

    return createSuccessResult({
        timeframe: leaderboard.timeframe,
        category: leaderboard.category,
        entries: leaderboard.entries,
        totalEntries: leaderboard.totalEntries,
    });
}

async function handleListChallenges(
    args: Record<string, unknown>,
    context: ToolContext
): Promise<ToolResult> {
    const input = ListChallengesSchema.parse(args);

    const challenges = await context.challengeRepository.listChallenges({
        category: input.category as ChallengeCategory | undefined,
        difficulty: mapDifficulty(input.difficulty),
        limit: input.limit,
    });

    return createSuccessResult({
        challenges: challenges.map((c) => ({
            id: c.id,
            title: c.title,
            category: c.category,
            difficulty: c.difficulty,
            maxScore: c.maxScore,
            tags: c.tags,
        })),
        total: challenges.length,
    });
}

async function handleGetSessionStatus(
    args: Record<string, unknown>,
    context: ToolContext
): Promise<ToolResult> {
    const input = SessionStatusSchema.parse(args);

    const session = await context.sessionManager.getSession(input.sessionId);

    if (!session) {
        return createErrorResult(`Session not found: ${input.sessionId}`);
    }

    return createSuccessResult({
        sessionId: session.id,
        name: session.name,
        status: session.status,
        currentChallenge: session.currentChallengeIndex + 1,
        totalChallenges: session.challengeIds.length,
        completedChallenges: session.results.length,
        startedAt: session.startedAt,
    });
}

async function handleSkipChallenge(
    args: Record<string, unknown>,
    context: ToolContext
): Promise<ToolResult> {
    const input = SkipChallengeSchema.parse(args);

    await context.benchmarkEngine.skipChallenge(input.sessionId, input.reason);

    return createSuccessResult({
        message: 'Challenge skipped. Use intellibench_get_challenge for the next challenge.',
        reason: input.reason,
    });
}

// ============================================================================
// Helper Functions
// ============================================================================

function createSuccessResult(data: unknown): ToolResult {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(data, null, 2),
            },
        ],
    };
}

function createErrorResult(message: string): ToolResult {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({ error: message }),
            },
        ],
        isError: true,
    };
}

function mapDifficulty(difficulty?: string): Difficulty | 'all' | undefined {
    if (!difficulty) return undefined;
    if (difficulty === 'all') return 'all';

    const map: Record<string, Difficulty> = {
        easy: 1,
        medium: 2,
        hard: 3,
        expert: 4,
    };

    return map[difficulty];
}

function formatEstimatedTime(challengeCount: number): string {
    const avgMinutes = 5; // Average 5 minutes per challenge
    const totalMinutes = challengeCount * avgMinutes;

    if (totalMinutes < 60) {
        return `~${totalMinutes} minutes`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `~${hours}h ${minutes}m` : `~${hours}h`;
}
