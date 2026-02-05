#!/usr/bin/env node
/**
 * @fileoverview Quick Benchmark CLI - Run benchmarks directly from command line
 * @description Simple CLI to run AI coding benchmarks without MCP
 * @version 1.0.0
 */

import { BenchmarkEngine } from '../src/core/benchmark/engine.js';
import { ScoringEngine } from '../src/core/scoring/engine.js';
import { ChallengeRepository } from '../src/core/challenges/repository.js';
import { SessionManager } from '../src/core/sessions/manager.js';
import { AnalyticsEngine } from '../src/core/analytics/engine.js';
import { challengesByCategory, challengeStats } from '../src/data/challenges/index.js';
import { ChallengeCategory } from '../src/shared/types/index.js';

// ============================================================================
// CLI Configuration
// ============================================================================

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};

function log(message: string, color = COLORS.reset): void {
    console.log(`${color}${message}${COLORS.reset}`);
}

function printBanner(): void {
    console.log('');
    log('╔══════════════════════════════════════════════════════════════╗', COLORS.cyan);
    log('║                                                              ║', COLORS.cyan);
    log('║   🧠 MCP IntelliBench - AI Coding Intelligence Benchmark    ║', COLORS.cyan);
    log('║                                                              ║', COLORS.cyan);
    log('╚══════════════════════════════════════════════════════════════╝', COLORS.cyan);
    console.log('');
}

function printStats(): void {
    log('📊 Available Challenges:', COLORS.bright);
    log(`   Total: ${challengeStats.total} challenges across ${Object.keys(challengesByCategory).length} categories\n`, COLORS.yellow);

    Object.entries(challengesByCategory).forEach(([category, challenges]) => {
        const emoji = getCategoryEmoji(category as ChallengeCategory);
        log(`   ${emoji} ${formatCategory(category)}: ${challenges.length} challenges`, COLORS.reset);
    });

    console.log('');
    log('🎯 Difficulty Distribution:', COLORS.bright);
    log(`   Easy: ${challengeStats.byDifficulty.easy} | Medium: ${challengeStats.byDifficulty.medium} | Hard: ${challengeStats.byDifficulty.hard} | Expert: ${challengeStats.byDifficulty.expert}`, COLORS.yellow);
    console.log('');
}

function getCategoryEmoji(category: ChallengeCategory): string {
    const emojis: Record<string, string> = {
        code_generation: '💻',
        algorithm_design: '🔢',
        bug_detection: '🐛',
        security: '🔒',
        refactoring: '♻️',
        test_generation: '🧪',
        documentation: '📝',
        architecture: '🏗️',
    };
    return emojis[category] || '📦';
}

function formatCategory(category: string): string {
    return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ============================================================================
// Quick Benchmark Runner
// ============================================================================

async function runQuickBenchmark(
    category?: ChallengeCategory,
    maxChallenges = 5
): Promise<void> {
    const challengeRepo = new ChallengeRepository();
    const scoringEngine = new ScoringEngine();
    const sessionManager = new SessionManager();
    const analytics = new AnalyticsEngine();
    const benchmarkEngine = new BenchmarkEngine(challengeRepo, scoringEngine, sessionManager);

    await challengeRepo.initialize();
    await scoringEngine.initialize();

    log('🚀 Starting Quick Benchmark...\n', COLORS.green);

    // Start session
    const session = await benchmarkEngine.startSession({
        name: `Quick Benchmark - ${new Date().toISOString()}`,
        categories: category ? [category] : undefined,
        maxChallenges,
    });

    log(`📋 Session: ${session.name}`, COLORS.cyan);
    log(`   ID: ${session.id}`, COLORS.dim);
    log(`   Challenges: ${session.challengeIds.length}\n`, COLORS.dim);

    // Get challenges and display them
    for (let i = 0; i < session.challengeIds.length; i++) {
        const challenge = await benchmarkEngine.getCurrentChallenge(session.id);
        if (!challenge) break;

        log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, COLORS.cyan);
        log(`Challenge ${i + 1}/${session.challengeIds.length}: ${challenge.title}`, COLORS.bright);
        log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, COLORS.cyan);
        log(`Category: ${formatCategory(challenge.category)}`, COLORS.yellow);
        log(`Difficulty: ${challenge.difficulty}/10 | Max Score: ${challenge.maxScore}`, COLORS.yellow);
        log(`Time Limit: ${challenge.timeLimit}s\n`, COLORS.dim);

        log('Description:', COLORS.bright);
        log(challenge.description.substring(0, 200) + '...', COLORS.reset);

        log('\nRequirements:', COLORS.bright);
        challenge.requirements.forEach((req, idx) => {
            log(`  ${idx + 1}. ${req}`, COLORS.reset);
        });

        // Simulate a basic solution for demo
        log('\n📤 Submitting demo solution...', COLORS.magenta);

        const result = await benchmarkEngine.submitSolution(
            session.id,
            challenge.id,
            `// Demo solution for ${challenge.title}\nfunction solve(input) {\n  return input;\n}`,
            'typescript'
        );

        log(`\n📊 Result:`, COLORS.bright);
        log(`   Score: ${result.score}/${result.maxScore} (${Math.round((result.score / result.maxScore) * 100)}%)`,
            result.passed ? COLORS.green : COLORS.red);
        log(`   Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`,
            result.passed ? COLORS.green : COLORS.red);
        log(`   Feedback: ${result.feedback}`, COLORS.dim);
    }

    // Get final results
    const results = await benchmarkEngine.getSessionResults(session.id);

    log('\n╔══════════════════════════════════════════════════════════════╗', COLORS.cyan);
    log('║                     BENCHMARK RESULTS                        ║', COLORS.cyan);
    log('╚══════════════════════════════════════════════════════════════╝', COLORS.cyan);

    if (results) {
        log(`\n  📈 Overall Score: ${results.overallScore}/${results.maxScore}`, COLORS.bright);
        log(`  📊 Percentage: ${results.percentage.toFixed(1)}%`, COLORS.yellow);
        log(`  🏆 Percentile: ${results.percentile.toFixed(0)}th`, COLORS.yellow);
        log(`  ✅ Pass Rate: ${results.passRate.toFixed(1)}%`, COLORS.green);
        log(`  ⏱️  Total Time: ${results.totalTime}`, COLORS.dim);

        if (results.strengths.length > 0) {
            log('\n  💪 Strengths:', COLORS.bright);
            results.strengths.forEach(s => log(`     • ${s}`, COLORS.green));
        }

        if (results.weaknesses.length > 0) {
            log('\n  📈 Areas for Improvement:', COLORS.bright);
            results.weaknesses.forEach(w => log(`     • ${w}`, COLORS.yellow));
        }

        if (results.recommendations.length > 0) {
            log('\n  💡 Recommendations:', COLORS.bright);
            results.recommendations.forEach(r => log(`     • ${r}`, COLORS.cyan));
        }
    }

    log('\n✨ Benchmark complete!\n', COLORS.green);
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main(): Promise<void> {
    printBanner();
    printStats();

    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'run':
        case 'benchmark':
            const category = args[1] as ChallengeCategory | undefined;
            const max = parseInt(args[2]) || 3;
            await runQuickBenchmark(category, max);
            break;

        case 'list':
            log('📋 Available Categories for Benchmarking:\n', COLORS.bright);
            Object.entries(ChallengeCategory).forEach(([key, value]) => {
                const challenges = challengesByCategory[value as ChallengeCategory] || [];
                log(`   ${getCategoryEmoji(value as ChallengeCategory)} ${key}: ${value} (${challenges.length} challenges)`, COLORS.reset);
            });
            console.log('');
            break;

        case 'help':
        default:
            log('📚 Usage:', COLORS.bright);
            log('   npx tsx scripts/quick-benchmark.ts run [category] [max_challenges]', COLORS.cyan);
            log('   npx tsx scripts/quick-benchmark.ts list', COLORS.cyan);
            log('   npx tsx scripts/quick-benchmark.ts help', COLORS.cyan);
            console.log('');
            log('📝 Examples:', COLORS.bright);
            log('   npx tsx scripts/quick-benchmark.ts run                    # Run 3 random challenges', COLORS.dim);
            log('   npx tsx scripts/quick-benchmark.ts run algorithm_design 5 # Run 5 algorithm challenges', COLORS.dim);
            log('   npx tsx scripts/quick-benchmark.ts run security 3         # Run 3 security challenges', COLORS.dim);
            console.log('');
            break;
    }
}

main().catch(error => {
    log(`\n❌ Error: ${error.message}`, COLORS.red);
    process.exit(1);
});
