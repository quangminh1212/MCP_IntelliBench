/**
 * @fileoverview AI Benchmark Test - Test with actual AI solutions
 * @description Submit real solutions to benchmark and see actual scores
 * @version 1.0.0
 */

import { BenchmarkEngine } from '../src/core/benchmark/engine.js';
import { ScoringEngine } from '../src/core/scoring/engine.js';
import { ChallengeRepository } from '../src/core/challenges/repository.js';
import { SessionManager } from '../src/core/sessions/manager.js';
import { challenges } from '../src/data/challenges/index.js';

// ============================================================================
// Real AI Solutions for Challenges
// ============================================================================

const AI_SOLUTIONS: Record<string, string> = {
    // Stack Implementation
    'codegen_001': `
class Stack<T> {
    private items: T[] = [];

    push(item: T): void {
        this.items.push(item);
    }

    pop(): T | undefined {
        return this.items.pop();
    }

    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }

    clear(): void {
        this.items = [];
    }
}
`,

    // Debounce Function
    'codegen_002': `
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (this: any, ...args: Parameters<T>) {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func.apply(this, args);
            timeoutId = null;
        }, wait);
    };
}
`,

    // Promise.all Implementation  
    'codegen_003': `
function promiseAll<T>(promises: (T | Promise<T>)[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
        if (promises.length === 0) {
            resolve([]);
            return;
        }

        const results: T[] = new Array(promises.length);
        let completed = 0;

        promises.forEach((promise, index) => {
            Promise.resolve(promise)
                .then((result) => {
                    results[index] = result;
                    completed++;
                    
                    if (completed === promises.length) {
                        resolve(results);
                    }
                })
                .catch(reject);
        });
    });
}
`,

    // Deep Clone
    'codegen_004': `
function deepClone<T>(obj: T, seen = new WeakMap()): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as any;
    }

    if (seen.has(obj as any)) {
        return seen.get(obj as any);
    }

    if (Array.isArray(obj)) {
        const arrCopy: any[] = [];
        seen.set(obj as any, arrCopy);
        obj.forEach((item, index) => {
            arrCopy[index] = deepClone(item, seen);
        });
        return arrCopy as any;
    }

    const objCopy = {} as T;
    seen.set(obj as any, objCopy);
    Object.keys(obj).forEach((key) => {
        (objCopy as any)[key] = deepClone((obj as any)[key], seen);
    });
    return objCopy;
}
`,

    // Binary Search
    'algo_001': `
function binarySearch(arr: number[], target: number): number {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}
`,

    // Quick Sort
    'algo_002': `
function quickSort(arr: number[]): number[] {
    if (arr.length <= 1) {
        return arr;
    }

    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);

    return [...quickSort(left), ...middle, ...quickSort(right)];
}
`,

    // Merge Sort
    'algo_003': `
function mergeSort(arr: number[]): number[] {
    if (arr.length <= 1) {
        return arr;
    }

    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));

    return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
    const result: number[] = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }

    return result.concat(left.slice(i)).concat(right.slice(j));
}
`,
};

// ============================================================================
// Console Colors
// ============================================================================

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};

function log(message: string, color = COLORS.reset): void {
    console.log(`${color}${message}${COLORS.reset}`);
}

// ============================================================================
// Main Benchmark Test
// ============================================================================

async function runAIBenchmark(): Promise<void> {
    log('\n🤖 MCP IntelliBench - AI Solution Benchmark', COLORS.bright);
    log('━'.repeat(60), COLORS.cyan);
    log(`Testing with real AI-generated solutions...\n`, COLORS.yellow);

    const challengeRepo = new ChallengeRepository();
    const scoringEngine = new ScoringEngine();
    const sessionManager = new SessionManager();
    const benchmarkEngine = new BenchmarkEngine(challengeRepo, scoringEngine, sessionManager);

    await challengeRepo.initialize();
    await scoringEngine.initialize();

    // Get challenges that we have solutions for
    const solvableChallenges = challenges.filter(c => AI_SOLUTIONS[c.id]);
    log(`📋 Found ${solvableChallenges.length} challenges with AI solutions\n`, COLORS.cyan);

    // Start session with specific challenges
    const session = await benchmarkEngine.startSession({
        name: 'AI Solution Benchmark',
        maxChallenges: solvableChallenges.length,
    });

    let totalScore = 0;
    let maxTotalScore = 0;
    let passed = 0;

    for (let i = 0; i < Math.min(solvableChallenges.length, 5); i++) {
        const challenge = solvableChallenges[i];
        if (!challenge) continue;

        const solution = AI_SOLUTIONS[challenge.id];
        if (!solution) continue;

        log(`\n${'─'.repeat(60)}`, COLORS.cyan);
        log(`Challenge ${i + 1}: ${challenge.title}`, COLORS.bright);
        log(`Category: ${challenge.category} | Difficulty: ${challenge.difficulty}/10`, COLORS.yellow);

        // Show solution preview
        log(`\n📝 Solution:`, COLORS.magenta);
        const solutionLines = solution.trim().split('\n').slice(0, 8);
        solutionLines.forEach(line => log(`   ${line}`, COLORS.reset));
        if (solution.split('\n').length > 8) {
            log(`   ... (${solution.split('\n').length - 8} more lines)`, COLORS.reset);
        }

        // Submit solution
        const result = await scoringEngine.scoreSolution({
            challenge,
            solution,
            language: 'typescript',
            timeTaken: 60000,
            sessionId: session.id,
        });

        totalScore += result.totalScore;
        maxTotalScore += result.maxScore;
        if (result.passed) passed++;

        // Show results
        const percentage = Math.round((result.totalScore / result.maxScore) * 100);
        const scoreColor = result.passed ? COLORS.green : (percentage >= 50 ? COLORS.yellow : COLORS.red);

        log(`\n📊 Result:`, COLORS.bright);
        log(`   Score: ${result.totalScore}/${result.maxScore} (${percentage}%)`, scoreColor);
        log(`   Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`, scoreColor);

        log(`   Breakdown:`, COLORS.cyan);
        log(`     • Correctness: ${result.breakdown.correctness}/40`, COLORS.reset);
        log(`     • Efficiency:  ${result.breakdown.efficiency}/25`, COLORS.reset);
        log(`     • Code Quality: ${result.breakdown.codeQuality}/20`, COLORS.reset);
        log(`     • Completeness: ${result.breakdown.completeness}/10`, COLORS.reset);
        log(`     • Creativity:  ${result.breakdown.creativity}/5`, COLORS.reset);

        if (result.standardsCompliance) {
            log(`   Standards: ${result.standardsCompliance.overallGrade}`, COLORS.cyan);
        }
    }

    // Final Summary
    log(`\n${'═'.repeat(60)}`, COLORS.cyan);
    log(`                    FINAL RESULTS`, COLORS.bright);
    log(`${'═'.repeat(60)}`, COLORS.cyan);

    const overallPercentage = Math.round((totalScore / maxTotalScore) * 100);
    const gradeColor = overallPercentage >= 80 ? COLORS.green :
        overallPercentage >= 60 ? COLORS.yellow : COLORS.red;

    log(`\n  📈 Overall Score: ${totalScore}/${maxTotalScore} (${overallPercentage}%)`, gradeColor);
    log(`  ✅ Challenges Passed: ${passed}/${Math.min(solvableChallenges.length, 5)}`, COLORS.green);
    log(`  🏆 Grade: ${getGrade(overallPercentage)}`, gradeColor);

    log(`\n✨ AI Benchmark Complete!\n`, COLORS.green);
}

function getGrade(percentage: number): string {
    if (percentage >= 90) return 'A+ (Excellent)';
    if (percentage >= 80) return 'A (Great)';
    if (percentage >= 70) return 'B (Good)';
    if (percentage >= 60) return 'C (Satisfactory)';
    if (percentage >= 50) return 'D (Needs Improvement)';
    return 'F (Failing)';
}

// Run
runAIBenchmark().catch(error => {
    log(`\n❌ Error: ${error.message}`, COLORS.red);
    console.error(error);
    process.exit(1);
});
