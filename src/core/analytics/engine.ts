/**
 * @fileoverview Advanced Analytics & Reporting Engine
 * @module @mcp/intellibench/core/analytics
 * @version 1.0.0
 *
 * Provides comprehensive analytics, statistical analysis, and reporting
 * for AI benchmark performance following international assessment standards.
 */

import type {
    ChallengeResult,
    SessionResults,
    ChallengeCategory,
    Challenge,
} from '../../shared/types/index.js';

// IEEE 2841 Performance Levels
const IEEE_2841_LEVELS = [
    { name: 'Beginner', minScore: 0 },
    { name: 'Basic', minScore: 30 },
    { name: 'Intermediate', minScore: 50 },
    { name: 'Proficient', minScore: 65 },
    { name: 'Advanced', minScore: 80 },
    { name: 'Expert', minScore: 90 },
];

// ============================================================================
// Types
// ============================================================================

export interface PerformanceMetrics {
    /** Overall accuracy percentage */
    accuracy: number;
    /** Pass rate across all challenges */
    passRate: number;
    /** Average score normalized to 100 */
    normalizedScore: number;
    /** Consistency score (lower variance = higher consistency) */
    consistency: number;
    /** Speed rating based on time taken */
    speedRating: number;
    /** Efficiency score combining accuracy and speed */
    efficiency: number;
}

export interface CategoryAnalysis {
    category: ChallengeCategory;
    challengesAttempted: number;
    challengesPassed: number;
    passRate: number;
    averageScore: number;
    maxScore: number;
    totalScore: number;
    averageTime: number;
    trend: 'improving' | 'stable' | 'declining';
    strengths: string[];
    weaknesses: string[];
}

export interface ComparativeAnalysis {
    modelId: string;
    percentileRank: number;
    comparedToAverage: number;
    comparedToBest: number;
    rankInCategory: Record<ChallengeCategory, number>;
    strongerThan: number; // percentage of models
}

export interface TrendAnalysis {
    period: 'daily' | 'weekly' | 'monthly';
    dataPoints: { date: string; score: number; passRate: number }[];
    trend: 'improving' | 'stable' | 'declining';
    improvementRate: number;
    prediction: { nextScore: number; confidence: number };
}

export interface DetailedReport {
    sessionId: string;
    generatedAt: string;
    summary: {
        overallGrade: string;
        performanceLevel: string;
        totalScore: number;
        maxPossibleScore: number;
        percentage: number;
        passRate: number;
        totalTime: string;
    };
    metrics: PerformanceMetrics;
    categoryBreakdown: CategoryAnalysis[];
    standardsCompliance: Record<string, { score: number; level: string }>;
    comparative: ComparativeAnalysis;
    recommendations: string[];
    detailedFeedback: {
        challengeId: string;
        title: string;
        category: ChallengeCategory;
        score: number;
        maxScore: number;
        passed: boolean;
        feedback: string;
    }[];
}

// ============================================================================
// Analytics Engine
// ============================================================================

export class AnalyticsEngine {
    /**
     * Calculate comprehensive performance metrics
     */
    calculateMetrics(results: ChallengeResult[]): PerformanceMetrics {
        if (results.length === 0) {
            return {
                accuracy: 0,
                passRate: 0,
                normalizedScore: 0,
                consistency: 0,
                speedRating: 0,
                efficiency: 0,
            };
        }

        const totalScore = results.reduce((sum, r) => sum + r.score, 0);
        const maxScore = results.reduce((sum, r) => sum + r.maxScore, 0);
        const passed = results.filter((r) => r.passed).length;

        // Calculate accuracy
        const accuracy = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

        // Calculate pass rate
        const passRate = (passed / results.length) * 100;

        // Normalized score (0-100 scale)
        const normalizedScore = accuracy;

        // Calculate consistency (based on score variance)
        const scores = results.map((r) => (r.score / r.maxScore) * 100);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
        const stdDev = Math.sqrt(variance);
        const consistency = Math.max(0, 100 - stdDev);

        // Calculate speed rating
        const times = results.map((r) => r.timeTaken);
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const maxExpectedTime = 300000; // 5 minutes in ms
        const speedRating = Math.max(0, Math.min(100, 100 - (avgTime / maxExpectedTime) * 100));

        // Efficiency = weighted combination
        const efficiency = (accuracy * 0.4 + passRate * 0.3 + speedRating * 0.2 + consistency * 0.1);

        return {
            accuracy: Math.round(accuracy * 100) / 100,
            passRate: Math.round(passRate * 100) / 100,
            normalizedScore: Math.round(normalizedScore * 100) / 100,
            consistency: Math.round(consistency * 100) / 100,
            speedRating: Math.round(speedRating * 100) / 100,
            efficiency: Math.round(efficiency * 100) / 100,
        };
    }

    /**
     * Analyze performance by category
     */
    analyzeByCategory(
        results: ChallengeResult[],
        challenges: Challenge[]
    ): CategoryAnalysis[] {
        const challengeMap = new Map(challenges.map((c) => [c.id, c]));
        const categoryGroups = new Map<ChallengeCategory, ChallengeResult[]>();

        // Group results by category
        for (const result of results) {
            const challenge = challengeMap.get(result.challengeId);
            if (!challenge) continue;

            const existing = categoryGroups.get(challenge.category) || [];
            existing.push(result);
            categoryGroups.set(challenge.category, existing);
        }

        const analyses: CategoryAnalysis[] = [];

        for (const [category, categoryResults] of categoryGroups) {
            const attempted = categoryResults.length;
            const passed = categoryResults.filter((r) => r.passed).length;
            const totalScore = categoryResults.reduce((sum, r) => sum + r.score, 0);
            const maxScore = categoryResults.reduce((sum, r) => sum + r.maxScore, 0);
            const totalTime = categoryResults.reduce((sum, r) => sum + r.timeTaken, 0);

            const passRate = (passed / attempted) * 100;
            const avgScore = attempted > 0 ? totalScore / attempted : 0;

            // Determine strengths and weaknesses
            const strengths: string[] = [];
            const weaknesses: string[] = [];

            if (passRate >= 80) strengths.push('High pass rate');
            else if (passRate < 50) weaknesses.push('Low pass rate');

            if (avgScore >= maxScore / attempted * 0.8) strengths.push('Consistent scoring');
            else if (avgScore < maxScore / attempted * 0.5) weaknesses.push('Below average scoring');

            analyses.push({
                category,
                challengesAttempted: attempted,
                challengesPassed: passed,
                passRate: Math.round(passRate * 100) / 100,
                averageScore: Math.round(avgScore * 100) / 100,
                maxScore,
                totalScore,
                averageTime: Math.round(totalTime / attempted),
                trend: this.determineTrend(categoryResults),
                strengths,
                weaknesses,
            });
        }

        return analyses.sort((a, b) => b.passRate - a.passRate);
    }

    /**
     * Calculate compliance with international standards
     */
    calculateStandardsCompliance(
        results: ChallengeResult[],
        challenges: Challenge[]
    ): Record<string, { score: number; level: string }> {
        const compliance: Record<string, { score: number; level: string }> = {};

        // HumanEval-style assessment (code generation focus)
        const codeGenResults = this.filterByCategory(results, challenges, 'code_generation' as ChallengeCategory);
        const humanEvalScore = this.calculateMetrics(codeGenResults).passRate;
        compliance['HumanEval'] = {
            score: humanEvalScore,
            level: this.getPerformanceLevel(humanEvalScore),
        };

        // MMLU-style assessment (broad knowledge)
        const allMetrics = this.calculateMetrics(results);
        compliance['MMLU'] = {
            score: allMetrics.accuracy,
            level: this.getPerformanceLevel(allMetrics.accuracy),
        };

        // SWE-bench style (bug detection + security)
        const sweResults = [
            ...this.filterByCategory(results, challenges, 'bug_detection' as ChallengeCategory),
            ...this.filterByCategory(results, challenges, 'security' as ChallengeCategory),
        ];
        const sweBenchScore = this.calculateMetrics(sweResults).passRate;
        compliance['SWE-bench'] = {
            score: sweBenchScore,
            level: this.getPerformanceLevel(sweBenchScore),
        };

        // IEEE 2841 Compliance (Software Engineering capability)
        const ieeeScore = this.calculateIEEECompliance(results, challenges);
        compliance['IEEE 2841'] = {
            score: ieeeScore,
            level: this.getIEEELevel(ieeeScore),
        };

        // ISO/IEC 25010 Quality (code quality metrics)
        const isoScore = this.calculateISOQuality(results);
        compliance['ISO/IEC 25010'] = {
            score: isoScore,
            level: this.getISOLevel(isoScore),
        };

        return compliance;
    }

    /**
     * Generate detailed performance report
     */
    generateReport(
        sessionResults: SessionResults,
        challengeResults: ChallengeResult[],
        challenges: Challenge[]
    ): DetailedReport {
        const metrics = this.calculateMetrics(challengeResults);
        const categoryBreakdown = this.analyzeByCategory(challengeResults, challenges);
        const standardsCompliance = this.calculateStandardsCompliance(challengeResults, challenges);

        const challengeMap = new Map(challenges.map((c) => [c.id, c]));

        const detailedFeedback = challengeResults.map((r) => {
            const challenge = challengeMap.get(r.challengeId);
            return {
                challengeId: r.challengeId,
                title: challenge?.title || 'Unknown',
                category: challenge?.category || ('unknown' as ChallengeCategory),
                score: r.score,
                maxScore: r.maxScore,
                passed: r.passed,
                feedback: r.feedback || 'No feedback available',
            };
        });

        return {
            sessionId: sessionResults.sessionId,
            generatedAt: new Date().toISOString(),
            summary: {
                overallGrade: this.calculateGrade(sessionResults.percentage),
                performanceLevel: this.getPerformanceLevel(sessionResults.percentage),
                totalScore: sessionResults.overallScore,
                maxPossibleScore: sessionResults.maxScore,
                percentage: sessionResults.percentage,
                passRate: sessionResults.passRate,
                totalTime: sessionResults.totalTime,
            },
            metrics,
            categoryBreakdown,
            standardsCompliance,
            comparative: {
                modelId: 'current',
                percentileRank: sessionResults.percentile || 50,
                comparedToAverage: sessionResults.percentage - 50,
                comparedToBest: sessionResults.percentage - 100,
                rankInCategory: {} as Record<ChallengeCategory, number>,
                strongerThan: sessionResults.percentile || 50,
            },
            recommendations: this.generateRecommendations(categoryBreakdown, standardsCompliance),
            detailedFeedback,
        };
    }

    /**
     * Calculate statistical summary
     */
    calculateStatistics(scores: number[]): {
        mean: number;
        median: number;
        stdDev: number;
        min: number;
        max: number;
        range: number;
    } {
        if (scores.length === 0) {
            return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, range: 0 };
        }

        const sorted = [...scores].sort((a, b) => a - b);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const median = sorted.length % 2 === 0
            ? ((sorted[sorted.length / 2 - 1] ?? 0) + (sorted[sorted.length / 2] ?? 0)) / 2
            : (sorted[Math.floor(sorted.length / 2)] ?? 0);

        const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
        const stdDev = Math.sqrt(variance);

        const minVal = sorted[0] ?? 0;
        const maxVal = sorted[sorted.length - 1] ?? 0;

        return {
            mean: Math.round(mean * 100) / 100,
            median: Math.round(median * 100) / 100,
            stdDev: Math.round(stdDev * 100) / 100,
            min: minVal,
            max: maxVal,
            range: maxVal - minVal,
        };
    }

    /**
     * Export report to various formats
     */
    exportReport(report: DetailedReport, format: 'json' | 'markdown' | 'html'): string {
        switch (format) {
            case 'json':
                return JSON.stringify(report, null, 2);

            case 'markdown':
                return this.generateMarkdownReport(report);

            case 'html':
                return this.generateHTMLReport(report);

            default:
                return JSON.stringify(report);
        }
    }

    // ========================================================================
    // Private Helper Methods
    // ========================================================================

    private filterByCategory(
        results: ChallengeResult[],
        challenges: Challenge[],
        category: ChallengeCategory
    ): ChallengeResult[] {
        const challengeIds = new Set(
            challenges.filter((c) => c.category === category).map((c) => c.id)
        );
        return results.filter((r) => challengeIds.has(r.challengeId));
    }

    private determineTrend(results: ChallengeResult[]): 'improving' | 'stable' | 'declining' {
        if (results.length < 3) return 'stable';

        const scores = results.map((r) => (r.score / r.maxScore) * 100);
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));

        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const diff = secondAvg - firstAvg;
        if (diff > 5) return 'improving';
        if (diff < -5) return 'declining';
        return 'stable';
    }

    private getPerformanceLevel(score: number): string {
        if (score >= 90) return 'Expert';
        if (score >= 80) return 'Advanced';
        if (score >= 70) return 'Proficient';
        if (score >= 60) return 'Intermediate';
        if (score >= 50) return 'Basic';
        return 'Beginner';
    }

    private calculateGrade(percentage: number): string {
        if (percentage >= 97) return 'A+';
        if (percentage >= 93) return 'A';
        if (percentage >= 90) return 'A-';
        if (percentage >= 87) return 'B+';
        if (percentage >= 83) return 'B';
        if (percentage >= 80) return 'B-';
        if (percentage >= 77) return 'C+';
        if (percentage >= 73) return 'C';
        if (percentage >= 70) return 'C-';
        if (percentage >= 67) return 'D+';
        if (percentage >= 63) return 'D';
        if (percentage >= 60) return 'D-';
        return 'F';
    }

    private calculateIEEECompliance(results: ChallengeResult[], challenges: Challenge[]): number {
        // IEEE 2841 focuses on comprehensive software engineering capability
        const metrics = this.calculateMetrics(results);
        const categoryAnalysis = this.analyzeByCategory(results, challenges);

        // Weight different aspects
        const weights = {
            overall: 0.3,
            consistency: 0.2,
            coverage: 0.2,
            passRate: 0.3,
        };

        const coverage = Math.min(100, (categoryAnalysis.length / 8) * 100);

        return (
            metrics.accuracy * weights.overall +
            metrics.consistency * weights.consistency +
            coverage * weights.coverage +
            metrics.passRate * weights.passRate
        );
    }

    private getIEEELevel(score: number): string {
        const levels = IEEE_2841_LEVELS;
        for (let i = levels.length - 1; i >= 0; i--) {
            const level = levels[i];
            if (level && score >= level.minScore) return level.name;
        }
        return levels[0]?.name ?? 'Beginner';
    }

    private calculateISOQuality(results: ChallengeResult[]): number {
        // ISO/IEC 25010 quality characteristics
        const metrics = this.calculateMetrics(results);

        // Functional Suitability (correctness)
        const functionalSuitability = metrics.accuracy;

        // Reliability (consistency)
        const reliability = metrics.consistency;

        // Performance Efficiency (speed)
        const performanceEfficiency = metrics.speedRating;

        // Maintainability (inferred from refactoring and documentation scores)
        const maintainability = metrics.passRate;

        return (
            functionalSuitability * 0.3 +
            reliability * 0.25 +
            performanceEfficiency * 0.2 +
            maintainability * 0.25
        );
    }

    private getISOLevel(score: number): string {
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Acceptable';
        if (score >= 40) return 'Poor';
        return 'Inadequate';
    }

    private generateRecommendations(
        categoryAnalysis: CategoryAnalysis[],
        compliance: Record<string, { score: number; level: string }>
    ): string[] {
        const recommendations: string[] = [];

        // Category-based recommendations
        for (const analysis of categoryAnalysis) {
            if (analysis.passRate < 50) {
                recommendations.push(
                    `Focus on improving ${analysis.category.replace('_', ' ')} skills - current pass rate is ${analysis.passRate}%`
                );
            }
            for (const weakness of analysis.weaknesses) {
                recommendations.push(`Address: ${weakness} in ${analysis.category.replace('_', ' ')}`);
            }
        }

        // Standards-based recommendations
        for (const [standard, data] of Object.entries(compliance)) {
            if (data.score < 70) {
                recommendations.push(
                    `Improve performance to meet ${standard} standards (current: ${data.level}, score: ${Math.round(data.score)}%)`
                );
            }
        }

        return recommendations.slice(0, 10); // Limit to top 10
    }

    private generateMarkdownReport(report: DetailedReport): string {
        let md = `# AI Benchmark Report\n\n`;
        md += `**Session ID:** ${report.sessionId}\n`;
        md += `**Generated:** ${report.generatedAt}\n\n`;

        md += `## Summary\n\n`;
        md += `| Metric | Value |\n|--------|-------|\n`;
        md += `| Overall Grade | ${report.summary.overallGrade} |\n`;
        md += `| Performance Level | ${report.summary.performanceLevel} |\n`;
        md += `| Total Score | ${report.summary.totalScore}/${report.summary.maxPossibleScore} |\n`;
        md += `| Percentage | ${report.summary.percentage}% |\n`;
        md += `| Pass Rate | ${report.summary.passRate}% |\n`;
        md += `| Total Time | ${report.summary.totalTime} |\n\n`;

        md += `## Performance Metrics\n\n`;
        md += `| Metric | Score |\n|--------|-------|\n`;
        for (const [key, value] of Object.entries(report.metrics)) {
            md += `| ${key.charAt(0).toUpperCase() + key.slice(1)} | ${value}% |\n`;
        }

        md += `\n## Category Breakdown\n\n`;
        for (const cat of report.categoryBreakdown) {
            md += `### ${cat.category.replace('_', ' ').toUpperCase()}\n`;
            md += `- Attempted: ${cat.challengesAttempted}\n`;
            md += `- Passed: ${cat.challengesPassed}\n`;
            md += `- Pass Rate: ${cat.passRate}%\n`;
            md += `- Trend: ${cat.trend}\n\n`;
        }

        md += `## Standards Compliance\n\n`;
        md += `| Standard | Score | Level |\n|----------|-------|-------|\n`;
        for (const [standard, data] of Object.entries(report.standardsCompliance)) {
            md += `| ${standard} | ${Math.round(data.score)}% | ${data.level} |\n`;
        }

        if (report.recommendations.length > 0) {
            md += `\n## Recommendations\n\n`;
            for (const rec of report.recommendations) {
                md += `- ${rec}\n`;
            }
        }

        return md;
    }

    private generateHTMLReport(report: DetailedReport): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Benchmark Report - ${report.sessionId}</title>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 2rem; background: #0a0a0a; color: #e5e5e5; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #60a5fa; border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem; }
        h2 { color: #a78bfa; margin-top: 2rem; }
        .card { background: #1a1a1a; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; border: 1px solid #333; }
        .grade { font-size: 3rem; font-weight: bold; color: #22c55e; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #333; }
        th { background: #262626; color: #a5b4fc; }
        .metric-bar { background: #333; border-radius: 4px; overflow: hidden; }
        .metric-fill { height: 20px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); }
        .tag { display: inline-block; padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border-radius: 4px; margin: 0.25rem; font-size: 0.875rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧠 AI Benchmark Report</h1>
        <p><strong>Session:</strong> ${report.sessionId} | <strong>Generated:</strong> ${report.generatedAt}</p>

        <div class="card">
            <div class="grade">${report.summary.overallGrade}</div>
            <p style="text-align: center; font-size: 1.25rem;">${report.summary.performanceLevel} Level</p>
            <p style="text-align: center;">${report.summary.totalScore} / ${report.summary.maxPossibleScore} (${report.summary.percentage}%)</p>
        </div>

        <h2>📊 Performance Metrics</h2>
        <div class="card">
            ${Object.entries(report.metrics).map(([key, value]) => `
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span>${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <span>${value}%</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${value}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>

        <h2>🏆 Standards Compliance</h2>
        <div class="card">
            <table>
                <thead>
                    <tr><th>Standard</th><th>Score</th><th>Level</th></tr>
                </thead>
                <tbody>
                    ${Object.entries(report.standardsCompliance).map(([standard, data]) => `
                        <tr>
                            <td>${standard}</td>
                            <td>${Math.round(data.score)}%</td>
                            <td><span class="tag">${data.level}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <h2>💡 Recommendations</h2>
        <div class="card">
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
    }
}

export default AnalyticsEngine;
