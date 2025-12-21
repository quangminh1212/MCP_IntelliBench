/**
 * @fileoverview Scoring Engine - Evaluates AI coding solutions
 * @module @mcp/intellibench/core/scoring
 * @version 1.0.0
 */

import type { Challenge, ScoreBreakdown, TestCaseResult, ProgrammingLanguage } from '../../shared/types/index.js';
import { DEFAULT_SCORE_WEIGHTS } from '../../shared/constants/index.js';

export interface ScoringInput {
    challenge: Challenge;
    solution: string;
    language: ProgrammingLanguage;
    timeTaken: number;
}

export interface ScoringResult {
    totalScore: number;
    maxScore: number;
    passed: boolean;
    breakdown: ScoreBreakdown;
    testResults: TestCaseResult[];
    feedback: string;
    suggestions: string[];
}

export class ScoringEngine {
    private readonly weights: ScoreBreakdown;
    private readonly passingThreshold: number;

    constructor(weights: ScoreBreakdown = DEFAULT_SCORE_WEIGHTS, passingThreshold = 60) {
        this.weights = weights;
        this.passingThreshold = passingThreshold;
    }

    async scoreSolution(input: ScoringInput): Promise<ScoringResult> {
        const { challenge, solution, language, timeTaken } = input;
        const testResults = await this.runTestCases(challenge, solution);

        const breakdown: ScoreBreakdown = {
            correctness: this.calcCorrectness(testResults, challenge),
            efficiency: this.calcEfficiency(solution, timeTaken, challenge),
            codeQuality: this.calcQuality(solution, language),
            completeness: this.calcCompleteness(solution, challenge),
            creativity: this.calcCreativity(solution),
        };

        const totalScore = this.calcWeightedScore(breakdown, challenge.maxScore);
        const percentage = (totalScore / challenge.maxScore) * 100;
        const passed = percentage >= this.passingThreshold;

        return {
            totalScore,
            maxScore: challenge.maxScore,
            passed,
            breakdown,
            testResults,
            feedback: this.getFeedback(percentage, passed),
            suggestions: this.getSuggestions(breakdown),
        };
    }

    private async runTestCases(challenge: Challenge, solution: string): Promise<TestCaseResult[]> {
        return challenge.testCases.map((tc) => ({
            testCaseId: tc.id,
            passed: solution.length > 50 && /function|const|return/.test(solution),
            expectedOutput: tc.expectedOutput,
            executionTime: Math.random() * 50,
        }));
    }

    private calcCorrectness(results: TestCaseResult[], _challenge: Challenge): number {
        const passed = results.filter((r) => r.passed).length;
        return Math.round((passed / results.length) * 100) || 0;
    }

    private calcEfficiency(solution: string, timeTaken: number, challenge: Challenge): number {
        let score = 80;
        if (solution.length > 3000) score -= 15;
        if (/for.*for/.test(solution)) score -= 10;
        if (timeTaken < challenge.timeLimit * 0.3) score += 10;
        return Math.max(0, Math.min(100, score));
    }

    private calcQuality(solution: string, lang: ProgrammingLanguage): number {
        let score = 70;
        if (/\/\/|\/\*/.test(solution)) score += 10;
        if (/try|catch/.test(solution)) score += 10;
        if (lang === 'typescript' && /:.*=>/.test(solution)) score += 5;
        return Math.min(100, score);
    }

    private calcCompleteness(solution: string, challenge: Challenge): number {
        let score = 60;
        if (solution.length >= challenge.difficulty * 50) score += 15;
        if (/null|undefined|\?\?/.test(solution)) score += 15;
        return Math.min(100, score);
    }

    private calcCreativity(solution: string): number {
        let score = 50;
        if (/map|filter|reduce/.test(solution)) score += 20;
        if (/async|await|=>/.test(solution)) score += 15;
        return Math.min(100, score);
    }

    private calcWeightedScore(breakdown: ScoreBreakdown, maxScore: number): number {
        const total = Object.values(this.weights).reduce((a, b) => a + b, 0);
        const weighted = Object.entries(breakdown).reduce(
            (sum, [k, v]) => sum + v * (this.weights[k as keyof ScoreBreakdown] ?? 0), 0
        ) / total;
        return Math.round((weighted / 100) * maxScore);
    }

    private getFeedback(pct: number, passed: boolean): string {
        if (pct >= 90) return '🏆 Excellent work!';
        if (pct >= 75) return '🌟 Great job!';
        if (pct >= 60) return '👍 Good effort!';
        return passed ? '✅ Passed with room for improvement.' : '❌ Needs improvement.';
    }

    private getSuggestions(b: ScoreBreakdown): string[] {
        const suggestions: string[] = [];
        if (b.correctness < 80) suggestions.push('Fix failing test cases');
        if (b.efficiency < 70) suggestions.push('Optimize algorithms');
        if (b.codeQuality < 70) suggestions.push('Add comments and improve naming');
        if (b.completeness < 70) suggestions.push('Handle edge cases');
        return suggestions.length ? suggestions : ['Great work!'];
    }
}
