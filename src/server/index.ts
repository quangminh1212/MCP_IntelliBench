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
import { logger } from '../shared/utils/logger.js';
import type { ChallengeCategory, Difficulty } from '../shared/types/index.js';

// Load environment variables
config();

// Initialize logger first - writes to APPDATA
logger.init({ minLevel: 'debug' });

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
    logger.info(`Starting ${APP.NAME} v${APP.VERSION}...`, 'Server');
    logger.info(`Log files location: ${logger.getLogPath()}`, 'Server');
    logger.debug('Environment info', 'Server', {
        nodeVersion: process.version,
        platform: process.platform,
        cwd: process.cwd(),
        execPath: process.execPath,
        argv: process.argv,
        env: {
            PATH: process.env['PATH'] ? '[SET]' : '[NOT SET]',
            NODE_ENV: process.env['NODE_ENV'],
        },
    });

    // Initialize challenge repository
    await challengeRepository.initialize();
    logger.info(`Loaded ${challengeRepository.getChallengeCount()} challenges`, 'Server');

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
            logger.info('Tool called: intellibench_start_session', 'MCP', {
                args: {
                    sessionName: args.sessionName,
                    difficulty: args.difficulty,
                    maxChallenges: args.maxChallenges,
                },
            });

            try {
                const session = await benchmarkEngine.startSession({
                    name: args.sessionName,
                    difficulty: mapDifficulty(args.difficulty),
                    maxChallenges: args.maxChallenges,
                });

                logger.info('Session started successfully', 'MCP', {
                    sessionId: session.id,
                    sessionName: session.name,
                    totalChallenges: session.challengeIds.length,
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
            } catch (err) {
                logger.error('Failed to start session', 'MCP', err instanceof Error ? err : undefined, { args });
                throw err;
            }
        }
    );

    server.tool(
        'intellibench_get_challenge',
        'Get the current challenge in the benchmark session',
        {
            sessionId: z.string().describe('The session ID'),
        },
        async (args) => {
            logger.info('Tool called: intellibench_get_challenge', 'MCP', { sessionId: args.sessionId });

            try {
                const challenge = await benchmarkEngine.getCurrentChallenge(args.sessionId);

                if (!challenge) {
                    logger.info('Session completed - no more challenges', 'MCP', { sessionId: args.sessionId });
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

                logger.info('Challenge retrieved', 'MCP', {
                    sessionId: args.sessionId,
                    challengeId: challenge.id,
                    title: challenge.title,
                    category: challenge.category,
                    difficulty: challenge.difficulty,
                });

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
            } catch (err) {
                logger.error('Failed to get challenge', 'MCP', err instanceof Error ? err : undefined, { sessionId: args.sessionId });
                throw err;
            }
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
            logger.info('Tool called: intellibench_submit_solution', 'MCP', {
                sessionId: args.sessionId,
                challengeId: args.challengeId,
                language: args.language ?? 'typescript',
                solutionLength: args.solution.length,
            });

            try {
                const result = await benchmarkEngine.submitSolution(
                    args.sessionId,
                    args.challengeId,
                    args.solution,
                    args.language ?? 'typescript'
                );

                logger.info('Solution submitted and scored', 'MCP', {
                    sessionId: args.sessionId,
                    challengeId: args.challengeId,
                    score: result.score,
                    maxScore: result.maxScore,
                    passed: result.passed,
                    percentage: Math.round((result.score / result.maxScore) * 100),
                });

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
            } catch (err) {
                logger.error('Failed to submit solution', 'MCP', err instanceof Error ? err : undefined, {
                    sessionId: args.sessionId,
                    challengeId: args.challengeId,
                });
                throw err;
            }
        }
    );

    server.tool(
        'intellibench_get_results',
        'Get comprehensive results for a session',
        {
            sessionId: z.string().describe('The session ID'),
        },
        async (args) => {
            logger.info('Tool called: intellibench_get_results', 'MCP', { sessionId: args.sessionId });

            try {
                const results = await benchmarkEngine.getSessionResults(args.sessionId);

                logger.info('Session results retrieved', 'MCP', {
                    sessionId: args.sessionId,
                    overallScore: results.overallScore,
                    maxScore: results.maxScore,
                    percentage: results.percentage,
                    completedChallenges: results.completedChallenges,
                });

                return {
                    content: [{
                        type: 'text' as const,
                        text: JSON.stringify(results, null, 2),
                    }],
                };
            } catch (err) {
                logger.error('Failed to get results', 'MCP', err instanceof Error ? err : undefined, { sessionId: args.sessionId });
                throw err;
            }
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
            logger.info('Tool called: intellibench_list_challenges', 'MCP', {
                category: args.category,
                limit: args.limit,
            });

            try {
                const challenges = await challengeRepository.listChallenges({
                    category: args.category as ChallengeCategory | undefined,
                    limit: args.limit,
                });

                logger.info('Challenges listed', 'MCP', {
                    category: args.category,
                    count: challenges.length,
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
            } catch (err) {
                logger.error('Failed to list challenges', 'MCP', err instanceof Error ? err : undefined, { args });
                throw err;
            }
        }
    );

    // Connect to transport
    logger.connection('starting', { transport: 'stdio' });

    const transport = new StdioServerTransport();

    // Add error handling for transport
    process.stdin.on('error', (err) => {
        logger.error('stdin error', 'Transport', err);
    });

    process.stdout.on('error', (err) => {
        logger.error('stdout error', 'Transport', err);
    });

    process.on('uncaughtException', (err) => {
        logger.fatal('Uncaught exception', 'Process', err);
    });

    process.on('unhandledRejection', (reason) => {
        logger.error('Unhandled rejection', 'Process', reason instanceof Error ? reason : undefined, { reason });
    });

    try {
        await server.connect(transport);
        logger.connection('connected');
        logger.info('MCP IntelliBench server is running', 'Server');
        logger.info(`Logs are saved to: ${logger.getLogPath()}`, 'Server');
    } catch (err) {
        logger.connection('error', err);
        throw err;
    }
}

function mapDifficulty(difficulty?: string): Difficulty | 'all' | undefined {
    if (!difficulty) return undefined;
    if (difficulty === 'all') return 'all';
    const map: Record<string, Difficulty> = { easy: 1, medium: 2, hard: 3, expert: 4 };
    return map[difficulty];
}

// Run
main().catch((error) => {
    logger.fatal('Fatal error during startup', 'Server', error instanceof Error ? error : undefined, { error });
    process.exit(1);
});

export { main };
