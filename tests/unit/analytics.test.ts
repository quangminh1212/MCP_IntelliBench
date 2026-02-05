/**
 * @fileoverview Unit Tests for Analytics Engine
 * @module @mcp/intellibench/tests/unit/analytics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsEngine } from '../../src/core/analytics/engine.js';
import type { ChallengeResult, Challenge, SessionResults } from '../../src/shared/types/index.js';
import { ChallengeCategory, Difficulty } from '../../src/shared/types/index.js';

describe('AnalyticsEngine', () => {
    let engine: AnalyticsEngine;

    beforeEach(() => {
        engine = new AnalyticsEngine();
    });

    describe('calculateMetrics', () => {
        it('should return zero metrics for empty results', () => {
            const metrics = engine.calculateMetrics([]);

            expect(metrics.accuracy).toBe(0);
            expect(metrics.passRate).toBe(0);
            expect(metrics.normalizedScore).toBe(0);
            expect(metrics.consistency).toBe(0);
            expect(metrics.speedRating).toBe(0);
            expect(metrics.efficiency).toBe(0);
        });

        it('should calculate correct accuracy', () => {
            const results: ChallengeResult[] = [
                createMockResult({ score: 80, maxScore: 100, passed: true }),
                createMockResult({ score: 60, maxScore: 100, passed: true }),
            ];

            const metrics = engine.calculateMetrics(results);

            expect(metrics.accuracy).toBe(70);
        });

        it('should calculate correct pass rate', () => {
            const results: ChallengeResult[] = [
                createMockResult({ passed: true }),
                createMockResult({ passed: true }),
                createMockResult({ passed: false }),
                createMockResult({ passed: false }),
            ];

            const metrics = engine.calculateMetrics(results);

            expect(metrics.passRate).toBe(50);
        });

        it('should calculate high consistency for similar scores', () => {
            const results: ChallengeResult[] = [
                createMockResult({ score: 80, maxScore: 100 }),
                createMockResult({ score: 82, maxScore: 100 }),
                createMockResult({ score: 78, maxScore: 100 }),
            ];

            const metrics = engine.calculateMetrics(results);

            expect(metrics.consistency).toBeGreaterThan(90);
        });

        it('should calculate lower consistency for varied scores', () => {
            const results: ChallengeResult[] = [
                createMockResult({ score: 100, maxScore: 100 }),
                createMockResult({ score: 50, maxScore: 100 }),
                createMockResult({ score: 20, maxScore: 100 }),
            ];

            const metrics = engine.calculateMetrics(results);

            expect(metrics.consistency).toBeLessThan(70);
        });
    });

    describe('analyzeByCategory', () => {
        it('should group results by category correctly', () => {
            const challenges: Challenge[] = [
                createMockChallenge({ id: 'c1', category: ChallengeCategory.CODE_GENERATION }),
                createMockChallenge({ id: 'c2', category: ChallengeCategory.CODE_GENERATION }),
                createMockChallenge({ id: 'c3', category: ChallengeCategory.BUG_DETECTION }),
            ];

            const results: ChallengeResult[] = [
                createMockResult({ challengeId: 'c1', score: 80, maxScore: 100, passed: true }),
                createMockResult({ challengeId: 'c2', score: 70, maxScore: 100, passed: true }),
                createMockResult({ challengeId: 'c3', score: 50, maxScore: 100, passed: false }),
            ];

            const analysis = engine.analyzeByCategory(results, challenges);

            expect(analysis.length).toBe(2);

            const codeGenAnalysis = analysis.find((a) => a.category === ChallengeCategory.CODE_GENERATION);
            expect(codeGenAnalysis?.challengesAttempted).toBe(2);
            expect(codeGenAnalysis?.challengesPassed).toBe(2);

            const bugDetectAnalysis = analysis.find((a) => a.category === ChallengeCategory.BUG_DETECTION);
            expect(bugDetectAnalysis?.challengesAttempted).toBe(1);
            expect(bugDetectAnalysis?.challengesPassed).toBe(0);
        });

        it('should sort categories by pass rate', () => {
            const challenges: Challenge[] = [
                createMockChallenge({ id: 'c1', category: ChallengeCategory.CODE_GENERATION }),
                createMockChallenge({ id: 'c2', category: ChallengeCategory.BUG_DETECTION }),
            ];

            const results: ChallengeResult[] = [
                createMockResult({ challengeId: 'c1', passed: false }),
                createMockResult({ challengeId: 'c2', passed: true }),
            ];

            const analysis = engine.analyzeByCategory(results, challenges);

            expect(analysis[0].category).toBe(ChallengeCategory.BUG_DETECTION);
            expect(analysis[1].category).toBe(ChallengeCategory.CODE_GENERATION);
        });
    });

    describe('calculateStatistics', () => {
        it('should calculate correct statistics', () => {
            const scores = [10, 20, 30, 40, 50];
            const stats = engine.calculateStatistics(scores);

            expect(stats.mean).toBe(30);
            expect(stats.median).toBe(30);
            expect(stats.min).toBe(10);
            expect(stats.max).toBe(50);
            expect(stats.range).toBe(40);
        });

        it('should handle empty array', () => {
            const stats = engine.calculateStatistics([]);

            expect(stats.mean).toBe(0);
            expect(stats.median).toBe(0);
            expect(stats.min).toBe(0);
            expect(stats.max).toBe(0);
        });

        it('should calculate correct median for even-length array', () => {
            const scores = [10, 20, 30, 40];
            const stats = engine.calculateStatistics(scores);

            expect(stats.median).toBe(25);
        });
    });

    describe('exportReport', () => {
        it('should export as JSON', () => {
            const report = createMockReport();
            const exported = engine.exportReport(report, 'json');

            expect(() => JSON.parse(exported)).not.toThrow();
            const parsed = JSON.parse(exported);
            expect(parsed.sessionId).toBe(report.sessionId);
        });

        it('should export as Markdown', () => {
            const report = createMockReport();
            const exported = engine.exportReport(report, 'markdown');

            expect(exported).toContain('# AI Benchmark Report');
            expect(exported).toContain('## Summary');
            expect(exported).toContain(report.sessionId);
        });

        it('should export as HTML', () => {
            const report = createMockReport();
            const exported = engine.exportReport(report, 'html');

            expect(exported).toContain('<!DOCTYPE html>');
            expect(exported).toContain('AI Benchmark Report');
            expect(exported).toContain(report.sessionId);
        });
    });

    describe('calculateStandardsCompliance', () => {
        it('should calculate compliance for all standards', () => {
            const challenges: Challenge[] = [
                createMockChallenge({ id: 'c1', category: ChallengeCategory.CODE_GENERATION }),
                createMockChallenge({ id: 'c2', category: ChallengeCategory.BUG_DETECTION }),
                createMockChallenge({ id: 'c3', category: ChallengeCategory.SECURITY }),
            ];

            const results: ChallengeResult[] = [
                createMockResult({ challengeId: 'c1', score: 80, maxScore: 100, passed: true }),
                createMockResult({ challengeId: 'c2', score: 70, maxScore: 100, passed: true }),
                createMockResult({ challengeId: 'c3', score: 60, maxScore: 100, passed: false }),
            ];

            const compliance = engine.calculateStandardsCompliance(results, challenges);

            expect(compliance).toHaveProperty('HumanEval');
            expect(compliance).toHaveProperty('MMLU');
            expect(compliance).toHaveProperty('SWE-bench');
            expect(compliance).toHaveProperty('IEEE 2841');
            expect(compliance).toHaveProperty('ISO/IEC 25010');
        });
    });
});

// ============================================================================
// Helper Functions
// ============================================================================

function createMockResult(overrides: Partial<ChallengeResult> = {}): ChallengeResult {
    return {
        challengeId: 'test-challenge',
        sessionId: 'test-session',
        solution: 'function test() {}',
        language: 'typescript',
        score: 100,
        maxScore: 100,
        breakdown: {
            correctness: 50,
            efficiency: 25,
            codeQuality: 10,
            completeness: 10,
            creativity: 5,
        },
        testResults: [],
        feedback: 'Good job!',
        suggestions: [],
        passed: true,
        timeTaken: 60000,
        submittedAt: new Date().toISOString(),
        ...overrides,
    };
}

function createMockChallenge(overrides: Partial<Challenge> = {}): Challenge {
    return {
        id: 'test-challenge',
        title: 'Test Challenge',
        description: 'A test challenge',
        category: ChallengeCategory.CODE_GENERATION,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: ['Implement the function'],
        templates: [{ language: 'typescript', template: '', signature: '' }],
        testCases: [],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    };
}

function createMockReport() {
    return {
        sessionId: 'test-session-123',
        generatedAt: new Date().toISOString(),
        summary: {
            overallGrade: 'A',
            performanceLevel: 'Advanced',
            totalScore: 850,
            maxPossibleScore: 1000,
            percentage: 85,
            passRate: 80,
            totalTime: '00:45:00',
        },
        metrics: {
            accuracy: 85,
            passRate: 80,
            normalizedScore: 85,
            consistency: 92,
            speedRating: 75,
            efficiency: 84,
        },
        categoryBreakdown: [],
        standardsCompliance: {
            HumanEval: { score: 85, level: 'Advanced' },
            MMLU: { score: 82, level: 'Proficient' },
        },
        comparative: {
            modelId: 'current',
            percentileRank: 75,
            comparedToAverage: 15,
            comparedToBest: -10,
            rankInCategory: {
                code_generation: 1,
                bug_detection: 1,
                refactoring: 1,
                algorithm_design: 1,
                test_generation: 1,
                documentation: 1,
                architecture: 1,
                security: 1,
            },
            strongerThan: 75,
        },
        recommendations: ['Keep practicing algorithm challenges'],
        detailedFeedback: [],
    };
}
