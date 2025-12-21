/**
 * @fileoverview Benchmark Engine - Core orchestration for benchmark sessions
 * @module @mcp/intellibench/core/benchmark
 * @version 1.0.0
 */

import type {
    Session,
    SessionConfig,
    Challenge,
    ChallengeResult,
    SessionResults,
    Leaderboard,
    LeaderboardTimeframe,
    ChallengeCategory,
    Difficulty,
    ScoreBreakdown,
    ProgrammingLanguage,
} from '../../shared/types/index.js';
import {
    generateSessionId,
    getCurrentTimestamp,
    calculateDuration,
    formatDuration,
    calculatePercentage,
    calculatePercentile,
    getRankLabel,
    shuffleArray,
    average,
} from '../../shared/utils/index.js';
import { CATEGORY_DISPLAY_NAMES, LIMITS } from '../../shared/constants/index.js';
import type { ChallengeRepository } from '../challenges/repository.js';
import type { ScoringEngine } from '../scoring/engine.js';
import type { SessionManager } from '../sessions/manager.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Options for starting a session
 */
export interface StartSessionOptions {
    name?: string;
    categories?: ChallengeCategory[];
    difficulty?: Difficulty | 'all';
    maxChallenges?: number;
    randomize?: boolean;
}

/**
 * Options for leaderboard query
 */
export interface LeaderboardOptions {
    category?: ChallengeCategory;
    limit?: number;
    timeframe?: LeaderboardTimeframe;
}

// ============================================================================
// Benchmark Engine
// ============================================================================

/**
 * Core engine for orchestrating benchmark sessions
 */
export class BenchmarkEngine {
    private readonly challengeRepository: ChallengeRepository;
    private readonly scoringEngine: ScoringEngine;
    private readonly sessionManager: SessionManager;

    constructor(
        challengeRepository: ChallengeRepository,
        scoringEngine: ScoringEngine,
        sessionManager: SessionManager
    ) {
        this.challengeRepository = challengeRepository;
        this.scoringEngine = scoringEngine;
        this.sessionManager = sessionManager;
    }

    // ==========================================================================
    // Session Management
    // ==========================================================================

    /**
     * Start a new benchmark session
     * @param options - Session configuration options
     * @returns The created session
     */
    async startSession(options: StartSessionOptions = {}): Promise<Session> {
        // Get challenges based on filters
        const challenges = await this.challengeRepository.listChallenges({
            category: options.categories?.[0],
            difficulty: options.difficulty,
            limit: options.maxChallenges ?? LIMITS.DEFAULT_CHALLENGES_PER_SESSION,
        });

        if (challenges.length === 0) {
            throw new Error('No challenges match the specified criteria');
        }

        // Optionally shuffle challenges
        const orderedChallenges =
            options.randomize !== false ? shuffleArray(challenges) : challenges;

        // Apply max limit
        const maxChallenges = Math.min(
            options.maxChallenges ?? LIMITS.DEFAULT_CHALLENGES_PER_SESSION,
            orderedChallenges.length
        );

        const selectedChallenges = orderedChallenges.slice(0, maxChallenges);

        // Create session config
        const config: SessionConfig = {
            name: options.name,
            categories: options.categories,
            difficulty: options.difficulty,
            maxChallenges,
            randomize: options.randomize !== false,
        };

        // Create and save session
        const session: Session = {
            id: generateSessionId(),
            name: options.name ?? `Benchmark Session ${new Date().toLocaleDateString()}`,
            status: 'in_progress',
            config,
            challengeIds: selectedChallenges.map((c) => c.id),
            currentChallengeIndex: 0,
            results: [],
            startedAt: getCurrentTimestamp(),
        };

        await this.sessionManager.saveSession(session);

        return session;
    }

    /**
     * Get the current challenge for a session
     * @param sessionId - Session identifier
     * @returns Current challenge or null if session is complete
     */
    async getCurrentChallenge(sessionId: string): Promise<Challenge | null> {
        const session = await this.sessionManager.getSession(sessionId);

        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        if (session.status === 'completed') {
            return null;
        }

        if (session.currentChallengeIndex >= session.challengeIds.length) {
            // Mark session as completed
            await this.completeSession(sessionId);
            return null;
        }

        const challengeId = session.challengeIds[session.currentChallengeIndex];
        if (!challengeId) {
            return null;
        }

        return this.challengeRepository.getChallenge(challengeId);
    }

    /**
     * Submit a solution for scoring
     * @param sessionId - Session identifier
     * @param challengeId - Challenge identifier
     * @param solution - Solution code
     * @param language - Programming language
     * @returns Challenge result with scores
     */
    async submitSolution(
        sessionId: string,
        challengeId: string,
        solution: string,
        language: string
    ): Promise<ChallengeResult> {
        const session = await this.sessionManager.getSession(sessionId);

        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        if (session.status !== 'in_progress') {
            throw new Error(`Session is not in progress: ${session.status}`);
        }

        // Verify this is the current challenge
        const currentChallengeId = session.challengeIds[session.currentChallengeIndex];
        if (currentChallengeId !== challengeId) {
            throw new Error(`Challenge mismatch. Expected: ${currentChallengeId}, got: ${challengeId}`);
        }

        // Get challenge details
        const challenge = await this.challengeRepository.getChallenge(challengeId);
        if (!challenge) {
            throw new Error(`Challenge not found: ${challengeId}`);
        }

        // Calculate time taken
        const submissionTime = getCurrentTimestamp();
        const timeTaken = this.calculateTimeTaken(session, challenge);

        // Score the solution
        const scoringResult = await this.scoringEngine.scoreSolution({
            challenge,
            solution,
            language: language as ProgrammingLanguage,
            timeTaken,
        });

        // Create challenge result
        const result: ChallengeResult = {
            challengeId,
            sessionId,
            solution,
            language: language as ProgrammingLanguage,
            score: scoringResult.totalScore,
            maxScore: challenge.maxScore,
            breakdown: scoringResult.breakdown,
            testResults: scoringResult.testResults,
            feedback: scoringResult.feedback,
            suggestions: scoringResult.suggestions,
            passed: scoringResult.passed,
            timeTaken,
            submittedAt: submissionTime,
        };

        // Update session
        await this.sessionManager.addResult(sessionId, result);
        await this.sessionManager.advanceChallenge(sessionId);

        // Check if session is complete
        if (session.currentChallengeIndex + 1 >= session.challengeIds.length) {
            await this.completeSession(sessionId);
        }

        return result;
    }

    /**
     * Skip the current challenge
     * @param sessionId - Session identifier
     * @param reason - Optional reason for skipping
     */
    async skipChallenge(sessionId: string, reason?: string): Promise<void> {
        const session = await this.sessionManager.getSession(sessionId);

        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        if (session.status !== 'in_progress') {
            throw new Error(`Session is not in progress: ${session.status}`);
        }

        const challengeId = session.challengeIds[session.currentChallengeIndex];
        if (!challengeId) {
            throw new Error('No current challenge to skip');
        }

        const challenge = await this.challengeRepository.getChallenge(challengeId);
        if (!challenge) {
            throw new Error(`Challenge not found: ${challengeId}`);
        }

        // Create a zero-score result for skipped challenge
        const result: ChallengeResult = {
            challengeId,
            sessionId,
            solution: '',
            language: 'typescript',
            score: 0,
            maxScore: challenge.maxScore,
            breakdown: {
                correctness: 0,
                efficiency: 0,
                codeQuality: 0,
                completeness: 0,
                creativity: 0,
            },
            testResults: [],
            feedback: `Challenge skipped${reason ? `: ${reason}` : ''}`,
            suggestions: ['Consider attempting this challenge type in future sessions'],
            passed: false,
            timeTaken: 0,
            submittedAt: getCurrentTimestamp(),
        };

        await this.sessionManager.addResult(sessionId, result);
        await this.sessionManager.advanceChallenge(sessionId);

        // Check if session is complete
        if (session.currentChallengeIndex + 1 >= session.challengeIds.length) {
            await this.completeSession(sessionId);
        }
    }

    // ==========================================================================
    // Results & Analytics
    // ==========================================================================

    /**
     * Get comprehensive results for a session
     * @param sessionId - Session identifier
     * @returns Complete session results with analytics
     */
    async getSessionResults(sessionId: string): Promise<SessionResults> {
        const session = await this.sessionManager.getSession(sessionId);

        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        // Calculate overall scores
        const totalScore = session.results.reduce((sum, r) => sum + r.score, 0);
        const maxScore = session.results.reduce((sum, r) => sum + r.maxScore, 0);
        const percentage = calculatePercentage(totalScore, maxScore);

        // Calculate category scores
        const categoryScores = this.calculateCategoryScores(session.results);

        // Get percentile (comparing to other sessions)
        const allScores = await this.sessionManager.getAllSessionScores();
        const percentile = calculatePercentile(percentage, allScores);

        // Analyze strengths and weaknesses
        const { strengths, weaknesses } = this.analyzePerformance(categoryScores);

        // Generate recommendations
        const recommendations = this.generateRecommendations(categoryScores, session.results);

        // Calculate timing
        const totalSeconds = session.results.reduce((sum, r) => sum + r.timeTaken, 0);
        const totalTime = formatDuration(totalSeconds);
        const avgSeconds = session.results.length > 0 ? totalSeconds / session.results.length : 0;
        const averageTime = formatDuration(Math.round(avgSeconds));

        // Count passed challenges
        const passedCount = session.results.filter((r) => r.passed).length;
        const passRate = calculatePercentage(passedCount, session.results.length);

        return {
            sessionId,
            overallScore: totalScore,
            maxScore,
            percentage,
            percentile,
            categoryScores,
            strengths,
            weaknesses,
            recommendations,
            completedChallenges: session.results.length,
            totalChallenges: session.challengeIds.length,
            passRate,
            totalTime,
            averageTime,
            completedAt: session.completedAt ?? getCurrentTimestamp(),
        };
    }

    /**
     * Get the leaderboard
     * @param options - Leaderboard query options
     * @returns Leaderboard data
     */
    async getLeaderboard(options: LeaderboardOptions = {}): Promise<Leaderboard> {
        const limit = options.limit ?? LIMITS.LEADERBOARD_DEFAULT_LIMIT;
        const timeframe = options.timeframe ?? 'all';

        // Get completed sessions
        const sessions = await this.sessionManager.getCompletedSessions(timeframe);

        // Calculate scores and sort
        const entries = await Promise.all(
            sessions.map(async (session) => {
                const totalScore = session.results.reduce((sum, r) => sum + r.score, 0);
                const maxScore = session.results.reduce((sum, r) => sum + r.maxScore, 0);

                return {
                    rank: 0, // Will be set after sorting
                    aiModel: session.aiModel ?? 'Unknown',
                    score: totalScore,
                    maxScore,
                    percentage: calculatePercentage(totalScore, maxScore),
                    challengesCompleted: session.results.length,
                    completedAt: session.completedAt ?? session.startedAt,
                };
            })
        );

        // Sort by percentage descending
        entries.sort((a, b) => b.percentage - a.percentage);

        // Assign ranks and limit
        const rankedEntries = entries.slice(0, limit).map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));

        return {
            category: options.category,
            timeframe,
            entries: rankedEntries,
            totalEntries: entries.length,
            updatedAt: getCurrentTimestamp(),
        };
    }

    // ==========================================================================
    // Private Helpers
    // ==========================================================================

    private async completeSession(sessionId: string): Promise<void> {
        await this.sessionManager.updateSessionStatus(sessionId, 'completed');
    }

    private calculateTimeTaken(session: Session, challenge: Challenge): number {
        // Calculate time from last activity
        const lastResult = session.results[session.results.length - 1];
        const startTime = lastResult?.submittedAt ?? session.startedAt;
        const now = getCurrentTimestamp();

        const seconds = calculateDuration(startTime, now);

        // Cap at challenge time limit
        return Math.min(seconds, challenge.timeLimit);
    }

    private calculateCategoryScores(
        results: readonly ChallengeResult[]
    ): SessionResults['categoryScores'] {
        const categoryMap = new Map<
            ChallengeCategory,
            { scores: number[]; maxScores: number[] }
        >();

        // This would typically look up challenge categories
        // For now, using a simplified approach
        for (const result of results) {
            // In a real implementation, we'd look up the challenge category
            const category = 'code_generation' as ChallengeCategory;

            const existing = categoryMap.get(category) ?? { scores: [], maxScores: [] };
            existing.scores.push(result.score);
            existing.maxScores.push(result.maxScore);
            categoryMap.set(category, existing);
        }

        return Array.from(categoryMap.entries()).map(([category, data]) => ({
            category,
            score: data.scores.reduce((a, b) => a + b, 0),
            maxScore: data.maxScores.reduce((a, b) => a + b, 0),
            percentage: calculatePercentage(
                data.scores.reduce((a, b) => a + b, 0),
                data.maxScores.reduce((a, b) => a + b, 0)
            ),
            rank: getRankLabel(
                calculatePercentage(
                    data.scores.reduce((a, b) => a + b, 0),
                    data.maxScores.reduce((a, b) => a + b, 0)
                )
            ),
        }));
    }

    private analyzePerformance(
        categoryScores: readonly { category: ChallengeCategory; percentage: number }[]
    ): { strengths: string[]; weaknesses: string[] } {
        const strengths: string[] = [];
        const weaknesses: string[] = [];

        for (const score of categoryScores) {
            const name = CATEGORY_DISPLAY_NAMES[score.category] ?? score.category;

            if (score.percentage >= 80) {
                strengths.push(`Strong performance in ${name} (${score.percentage}%)`);
            } else if (score.percentage < 60) {
                weaknesses.push(`Needs improvement in ${name} (${score.percentage}%)`);
            }
        }

        if (strengths.length === 0) {
            strengths.push('Consistent performance across categories');
        }

        if (weaknesses.length === 0) {
            weaknesses.push('No significant weaknesses identified');
        }

        return { strengths, weaknesses };
    }

    private generateRecommendations(
        categoryScores: readonly { category: ChallengeCategory; percentage: number }[],
        results: readonly ChallengeResult[]
    ): string[] {
        const recommendations: string[] = [];

        // Find lowest scoring categories
        const sortedCategories = [...categoryScores].sort((a, b) => a.percentage - b.percentage);
        const weakest = sortedCategories[0];

        if (weakest && weakest.percentage < 70) {
            recommendations.push(
                `Focus on ${CATEGORY_DISPLAY_NAMES[weakest.category]} challenges for improvement`
            );
        }

        // Check for common issues in results
        const avgCorrectness = average(results.map((r) => r.breakdown.correctness));
        const avgEfficiency = average(results.map((r) => r.breakdown.efficiency));
        const avgCodeQuality = average(results.map((r) => r.breakdown.codeQuality));

        if (avgCorrectness < 70) {
            recommendations.push('Practice test-driven development to improve correctness');
        }

        if (avgEfficiency < 60) {
            recommendations.push('Study algorithm complexity and optimization techniques');
        }

        if (avgCodeQuality < 70) {
            recommendations.push('Focus on clean code principles and design patterns');
        }

        if (recommendations.length === 0) {
            recommendations.push('Continue practicing to maintain your excellent performance!');
        }

        return recommendations;
    }
}
