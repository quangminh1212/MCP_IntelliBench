/**
 * @fileoverview MCP Server API endpoint for Vercel Serverless
 * @description Handles MCP protocol over HTTP (Streamable HTTP transport)
 * @version 1.0.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';

import { BenchmarkEngine } from '../../src/core/benchmark/engine.js';
import { ScoringEngine } from '../../src/core/scoring/engine.js';
import { ChallengeRepository } from '../../src/core/challenges/repository.js';
import { SessionManager } from '../../src/core/sessions/manager.js';
import { MCP_SERVER } from '../../src/shared/constants/index.js';
import type { ChallengeCategory, Difficulty } from '../../src/shared/types/index.js';

// Initialize services (will be cached by Vercel)
const challengeRepository = new ChallengeRepository();
const scoringEngine = new ScoringEngine();
const sessionManager = new SessionManager();
const benchmarkEngine = new BenchmarkEngine(
    challengeRepository,
    scoringEngine,
    sessionManager
);

// Track initialization
let initialized = false;

/**
 * Initialize services
 */
async function initializeServices(): Promise<void> {
    if (!initialized) {
        await challengeRepository.initialize();
        initialized = true;
    }
}

/**
 * Create MCP Server with tools
 */
function createMcpServer(): McpServer {
    const server = new McpServer({
        name: MCP_SERVER.NAME,
        version: MCP_SERVER.VERSION,
    });

    // Tool: Start Session
    server.tool(
        'intellibench_start_session',
        'Start a new AI coding benchmark session',
        {
            sessionName: z.string().optional().describe('Optional session name'),
            difficulty: z.enum(['easy', 'medium', 'hard', 'expert', 'all']).optional(),
            maxChallenges: z.number().min(1).max(50).optional(),
        },
        async (args) => {
            await initializeServices();
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
                        message: 'Session started! Use intellibench_get_challenge to get the first challenge.',
                    }, null, 2),
                }],
            };
        }
    );

    // Tool: Get Challenge
    server.tool(
        'intellibench_get_challenge',
        'Get the current challenge in the benchmark session',
        {
            sessionId: z.string().describe('The session ID'),
        },
        async (args) => {
            await initializeServices();
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

    // Tool: Submit Solution
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
            await initializeServices();
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

    // Tool: Get Results
    server.tool(
        'intellibench_get_results',
        'Get comprehensive results for a session',
        {
            sessionId: z.string().describe('The session ID'),
        },
        async (args) => {
            await initializeServices();
            const results = await benchmarkEngine.getSessionResults(args.sessionId);

            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify(results, null, 2),
                }],
            };
        }
    );

    // Tool: List Challenges
    server.tool(
        'intellibench_list_challenges',
        'List available benchmark challenges',
        {
            category: z.string().optional(),
            limit: z.number().min(1).max(50).optional(),
        },
        async (args) => {
            await initializeServices();
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

    // Tool: Get Leaderboard
    server.tool(
        'intellibench_leaderboard',
        'Get the current benchmark leaderboard',
        {
            limit: z.number().min(1).max(100).optional(),
            timeframe: z.enum(['daily', 'weekly', 'monthly', 'all']).optional(),
        },
        async (args) => {
            await initializeServices();
            const leaderboard = await benchmarkEngine.getLeaderboard({
                limit: args.limit,
                timeframe: args.timeframe,
            });

            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify(leaderboard, null, 2),
                }],
            };
        }
    );

    return server;
}

function mapDifficulty(difficulty?: string): Difficulty | 'all' | undefined {
    if (!difficulty) return undefined;
    if (difficulty === 'all') return 'all';
    const map: Record<string, Difficulty> = { easy: 1, medium: 2, hard: 3, expert: 4 };
    return map[difficulty];
}

// Store active transports for SSE connections
const transports = new Map<string, SSEServerTransport>();

/**
 * Main API handler
 */
export default async function handler(
    req: VercelRequest,
    res: VercelResponse
): Promise<void> {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Health check
    if (req.method === 'GET' && req.url === '/api/mcp') {
        await initializeServices();
        res.status(200).json({
            name: MCP_SERVER.NAME,
            version: MCP_SERVER.VERSION,
            status: 'running',
            challenges: challengeRepository.getChallengeCount(),
            tools: [
                'intellibench_start_session',
                'intellibench_get_challenge',
                'intellibench_submit_solution',
                'intellibench_get_results',
                'intellibench_list_challenges',
                'intellibench_leaderboard',
            ],
        });
        return;
    }

    // SSE endpoint for MCP
    if (req.method === 'GET' && req.url?.startsWith('/api/mcp/sse')) {
        await initializeServices();

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const transport = new SSEServerTransport('/api/mcp/messages', res);
        const sessionId = Math.random().toString(36).substring(7);
        transports.set(sessionId, transport);

        const server = createMcpServer();

        // Clean up on close
        req.on('close', () => {
            transports.delete(sessionId);
        });

        try {
            await server.connect(transport);
        } catch (error) {
            console.error('SSE connection error:', error);
            transports.delete(sessionId);
        }
        return;
    }

    // Message endpoint for SSE transport
    if (req.method === 'POST' && req.url?.startsWith('/api/mcp/messages')) {
        const sessionId = req.query['sessionId'] as string;
        const transport = transports.get(sessionId);

        if (!transport) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        try {
            await transport.handlePostMessage(req, res);
        } catch (error) {
            console.error('Message handling error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        return;
    }

    // 404 for unknown routes
    res.status(404).json({ error: 'Not found' });
}
