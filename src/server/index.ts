/**
 * @fileoverview MCP IntelliBench Server Entry Point (Simplified)
 * @module @mcp/intellibench/server
 * @version 1.0.0
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { config } from 'dotenv';

import { BenchmarkEngine } from '../core/benchmark/engine.js';
import { ScoringEngine } from '../core/scoring/engine.js';
import { ChallengeRepository } from '../core/challenges/repository.js';
import { SessionManager } from '../core/sessions/manager.js';
import { MCP_SERVER, APP } from '../shared/constants/index.js';
import type { ChallengeCategory, Difficulty } from '../shared/types/index.js';

// Load environment variables
config();

// Initialize core services
const challengeRepository = new ChallengeRepository();
const scoringEngine = new ScoringEngine();
const sessionManager = new SessionManager();
const benchmarkEngine = new BenchmarkEngine(
    challengeRepository,
    scoringEngine,
    sessionManager
);

/**
 * Create and configure the MCP server
 */
async function main(): Promise<void> {
    console.log(`Starting ${APP.NAME} v${APP.VERSION}...`);

    // Initialize challenge repository
    await challengeRepository.initialize();
    console.log(`Loaded ${challengeRepository.getChallengeCount()} challenges`);

    // Create MCP server
    const server = new McpServer({
        name: MCP_SERVER.NAME,
        version: MCP_SERVER.VERSION,
    });

    // Register tools
    server.tool(
        'intellibench_start_session',
        'Start a new AI coding benchmark session',
        {
            sessionName: z.string().optional().describe('Optional session name'),
            difficulty: z.enum(['easy', 'medium', 'hard', 'expert', 'all']).optional(),
            maxChallenges: z.number().min(1).max(50).optional(),
        },
        async (args) => {
            const session = await benchmarkEngine.startSession({
                name: args.sessionName,
                difficulty: mapDifficulty(args.difficulty),
                maxChallenges: args.maxChallenges,
            });

            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify({
                        sessionId: session.id,
                        sessionName: session.name,
                        totalChallenges: session.challengeIds.length,
                        message: `Session started! Use intellibench_get_challenge to get the first challenge.`,
                    }, null, 2),
                }],
            };
        }
    );

    server.tool(
        'intellibench_get_challenge',
        'Get the current challenge in the benchmark session',
        {
            sessionId: z.string().describe('The session ID'),
        },
        async (args) => {
            const challenge = await benchmarkEngine.getCurrentChallenge(args.sessionId);

            if (!challenge) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: JSON.stringify({
                            completed: true,
                            message: 'Session complete! Use intellibench_get_results to see your score.',
                        }, null, 2),
                    }],
                };
            }

            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify({
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
                    }, null, 2),
                }],
            };
        }
    );

    server.tool(
        'intellibench_submit_solution',
        'Submit a solution for scoring',
        {
            sessionId: z.string().describe('The session ID'),
            challengeId: z.string().describe('The challenge ID'),
            solution: z.string().describe('Your solution code'),
            language: z.enum(['typescript', 'javascript', 'python']).optional(),
        },
        async (args) => {
            const result = await benchmarkEngine.submitSolution(
                args.sessionId,
                args.challengeId,
                args.solution,
                args.language ?? 'typescript'
            );

            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify({
                        score: result.score,
                        maxScore: result.maxScore,
                        percentage: Math.round((result.score / result.maxScore) * 100),
                        passed: result.passed,
                        breakdown: result.breakdown,
                        feedback: result.feedback,
                        suggestions: result.suggestions,
                    }, null, 2),
                }],
            };
        }
    );

    server.tool(
        'intellibench_get_results',
        'Get comprehensive results for a session',
        {
            sessionId: z.string().describe('The session ID'),
        },
        async (args) => {
            const results = await benchmarkEngine.getSessionResults(args.sessionId);

            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify(results, null, 2),
                }],
            };
        }
    );

    server.tool(
        'intellibench_list_challenges',
        'List available benchmark challenges',
        {
            category: z.string().optional(),
            limit: z.number().min(1).max(50).optional(),
        },
        async (args) => {
            const challenges = await challengeRepository.listChallenges({
                category: args.category as ChallengeCategory | undefined,
                limit: args.limit,
            });

            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify({
                        challenges: challenges.map(c => ({
                            id: c.id,
                            title: c.title,
                            category: c.category,
                            difficulty: c.difficulty,
                            maxScore: c.maxScore,
                        })),
                        total: challenges.length,
                    }, null, 2),
                }],
            };
        }
    );

    // Connect to transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log('MCP IntelliBench server is running');
}

function mapDifficulty(difficulty?: string): Difficulty | 'all' | undefined {
    if (!difficulty) return undefined;
    if (difficulty === 'all') return 'all';
    const map: Record<string, Difficulty> = { easy: 1, medium: 2, hard: 3, expert: 4 };
    return map[difficulty];
}

// Run
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

export { main };
