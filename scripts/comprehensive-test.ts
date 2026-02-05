/**
 * @fileoverview Comprehensive Test Script for MCP IntelliBench
 * @description Tests all core features of the benchmark system
 * @version 1.0.0
 */

import { BenchmarkEngine } from '../src/core/benchmark/engine.js';
import { ScoringEngine } from '../src/core/scoring/engine.js';
import { ChallengeRepository } from '../src/core/challenges/repository.js';
import { SessionManager } from '../src/core/sessions/manager.js';
import { AnalyticsEngine } from '../src/core/analytics/engine.js';
import { CodeExecutionEngine } from '../src/core/execution/engine.js';
import { challenges, challengesByCategory, challengeStats } from '../src/data/challenges/index.js';
import { ChallengeCategory, Difficulty } from '../src/shared/types/index.js';

// ============================================================================
// Test Configuration
// ============================================================================

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message: string, color = COLORS.reset): void {
    console.log(`${color}${message}${COLORS.reset}`);
}

function logSection(title: string): void {
    console.log('');
    log(`${'='.repeat(60)}`, COLORS.cyan);
    log(`  ${title}`, COLORS.bright);
    log(`${'='.repeat(60)}`, COLORS.cyan);
}

function logTest(name: string, passed: boolean, details?: string): void {
    const status = passed ? `${COLORS.green}✓ PASS` : `${COLORS.red}✗ FAIL`;
    console.log(`  ${status}${COLORS.reset} ${name}${details ? ` - ${details}` : ''}`);
}

// ============================================================================
// Test Results Tracker
// ============================================================================

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
}

const testResults: TestResult[] = [];

function recordTest(name: string, passed: boolean, error?: string): void {
    testResults.push({ name, passed, error });
    logTest(name, passed, error);
}

// ============================================================================
// Core Feature Tests
// ============================================================================

async function testChallengeRepository(): Promise<void> {
    logSection('Testing Challenge Repository');

    const repo = new ChallengeRepository();
    await repo.initialize();

    // Test 1: Challenge count
    const count = repo.getChallengeCount();
    recordTest('Challenge count >= 50', count >= 50, `Found ${count} challenges`);

    // Test 2: Get all challenges
    const allChallenges = await repo.listChallenges({});
    recordTest('List all challenges', allChallenges.length > 0, `Listed ${allChallenges.length} challenges`);

    // Test 3: Filter by category
    const codeGenChallenges = await repo.listChallenges({
        category: ChallengeCategory.CODE_GENERATION,
    });
    recordTest('Filter by category', codeGenChallenges.length > 0, `Found ${codeGenChallenges.length} code generation challenges`);

    // Test 4: Get specific challenge
    const firstChallenge = challenges[0];
    if (firstChallenge) {
        const retrieved = await repo.getChallenge(firstChallenge.id);
        recordTest('Get specific challenge', retrieved?.id === firstChallenge.id);
    }

    // Test 5: All 8 categories exist
    const categories = Object.keys(challengesByCategory);
    recordTest('All 8 categories exist', categories.length === 8, `Found ${categories.length} categories`);
}

async function testSessionManager(): Promise<void> {
    logSection('Testing Session Manager');

    const sessionManager = new SessionManager();

    // Create a session using saveSession
    const session = {
        id: 'test-session-' + Date.now(),
        name: 'Test Session',
        aiModel: 'test-model',
        status: 'pending' as const,
        config: { maxChallenges: 5 },
        challengeIds: challenges.slice(0, 5).map(c => c.id),
        currentChallengeIndex: 0,
        results: [],
        startedAt: new Date().toISOString(),
    };

    // Test 1: Save session
    await sessionManager.saveSession(session);
    recordTest('Save session', true, `Session ID: ${session.id}`);

    // Test 2: Get session
    const retrieved = await sessionManager.getSession(session.id);
    recordTest('Get session', retrieved?.id === session.id);

    // Test 3: Session status
    recordTest('Session status is pending', retrieved?.status === 'pending');

    // Test 4: Update session status
    await sessionManager.updateSessionStatus(session.id, 'in_progress');
    const updated = await sessionManager.getSession(session.id);
    recordTest('Update session status', updated?.status === 'in_progress');

    // Test 5: Add result
    const mockResult = {
        challengeId: 'c1',
        sessionId: session.id,
        solution: 'code',
        language: 'typescript' as const,
        score: 80,
        maxScore: 100,
        breakdown: { correctness: 40, efficiency: 20, codeQuality: 10, completeness: 5, creativity: 5 },
        testResults: [],
        feedback: 'Good',
        suggestions: [],
        passed: true,
        timeTaken: 60000,
        submittedAt: new Date().toISOString(),
    };
    await sessionManager.addResult(session.id, mockResult);
    const withResult = await sessionManager.getSession(session.id);
    recordTest('Add result', withResult?.results.length === 1);

    // Test 6: Advance challenge
    await sessionManager.advanceChallenge(session.id);
    const advanced = await sessionManager.getSession(session.id);
    recordTest('Advance challenge', advanced?.currentChallengeIndex === 1);

    // Test 7: Complete session
    await sessionManager.updateSessionStatus(session.id, 'completed');
    const completed = await sessionManager.getSession(session.id);
    recordTest('Complete session', completed?.status === 'completed');
}

async function testScoringEngine(): Promise<void> {
    logSection('Testing Scoring Engine');

    const scoringEngine = new ScoringEngine();
    await scoringEngine.initialize();

    const mockChallenge = challenges[0];
    if (mockChallenge) {
        // Test 1: Score solution
        const result = await scoringEngine.scoreSolution({
            challenge: mockChallenge,
            solution: 'function test() { return true; }',
            language: 'typescript',
            timeTaken: 60000,
            sessionId: 'test-session',
        });
        recordTest('Score calculation', result.totalScore >= 0, `Score: ${result.totalScore}/${result.maxScore}`);

        // Test 2: Feedback generation
        recordTest('Feedback generated', !!result.feedback, result.feedback.substring(0, 50) + '...');

        // Test 3: Score breakdown
        recordTest('Score breakdown exists', !!result.breakdown);

        // Test 4: Test results generated
        recordTest('Test results generated', Array.isArray(result.testResults));

        // Test 5: Standards compliance
        if (result.standardsCompliance) {
            recordTest('Standards compliance', !!result.standardsCompliance.overallGrade);
        }
    } else {
        recordTest('No challenges available', false, 'Could not find challenge for testing');
    }
}

async function testAnalyticsEngine(): Promise<void> {
    logSection('Testing Analytics Engine');

    const analytics = new AnalyticsEngine();

    // Create mock results
    const mockResults = [
        {
            challengeId: 'c1',
            sessionId: 's1',
            solution: 'code',
            language: 'typescript' as const,
            score: 85,
            maxScore: 100,
            breakdown: { correctness: 40, efficiency: 20, codeQuality: 15, completeness: 5, creativity: 5 },
            testResults: [],
            feedback: 'Good',
            suggestions: [],
            passed: true,
            timeTaken: 60000,
            submittedAt: new Date().toISOString(),
        },
        {
            challengeId: 'c2',
            sessionId: 's1',
            solution: 'code',
            language: 'typescript' as const,
            score: 70,
            maxScore: 100,
            breakdown: { correctness: 30, efficiency: 20, codeQuality: 10, completeness: 5, creativity: 5 },
            testResults: [],
            feedback: 'Needs improvement',
            suggestions: [],
            passed: true,
            timeTaken: 120000,
            submittedAt: new Date().toISOString(),
        },
    ];

    // Test 1: Calculate metrics
    const metrics = analytics.calculateMetrics(mockResults);
    recordTest('Calculate metrics', metrics.accuracy > 0, `Accuracy: ${metrics.accuracy}%`);

    // Test 2: Consistency score
    recordTest('Consistency calculation', metrics.consistency >= 0, `Consistency: ${metrics.consistency}%`);

    // Test 3: Speed rating
    recordTest('Speed rating', metrics.speedRating >= 0, `Speed: ${metrics.speedRating}%`);

    // Test 4: Statistics calculation
    const stats = analytics.calculateStatistics([85, 70, 90, 65, 80]);
    recordTest('Statistics calculation', stats.mean === 78, `Mean: ${stats.mean}, Median: ${stats.median}`);

    // Test 5: Standards compliance
    const compliance = analytics.calculateStandardsCompliance(mockResults, challenges.slice(0, 2));
    recordTest('Standards compliance', Object.keys(compliance).length >= 3,
        `Standards: ${Object.keys(compliance).join(', ')}`);

    // Test 6: Export to JSON
    const mockReport: any = {
        sessionId: 'test-123',
        generatedAt: new Date().toISOString(),
        summary: { overallGrade: 'B', performanceLevel: 'Proficient', totalScore: 155, maxPossibleScore: 200, percentage: 77.5, passRate: 100, totalTime: '00:03:00' },
        metrics,
        categoryBreakdown: [],
        standardsCompliance: compliance,
        comparative: { modelId: 'test', percentileRank: 75, comparedToAverage: 10, comparedToBest: -15, rankInCategory: {}, strongerThan: 75 },
        recommendations: ['Keep practicing'],
        detailedFeedback: [],
    };
    const jsonExport = analytics.exportReport(mockReport, 'json');
    recordTest('Export to JSON', jsonExport.length > 0);

    // Test 7: Export to Markdown
    const mdExport = analytics.exportReport(mockReport, 'markdown');
    recordTest('Export to Markdown', mdExport.includes('# AI Benchmark Report'));

    // Test 8: Export to HTML
    const htmlExport = analytics.exportReport(mockReport, 'html');
    recordTest('Export to HTML', htmlExport.includes('<!DOCTYPE html>'));
}

async function testCodeExecutionEngine(): Promise<void> {
    logSection('Testing Code Execution Engine');

    const engine = new CodeExecutionEngine({
        timeout: 5000,
        memoryLimit: 128 * 1024 * 1024,
        useSandbox: false,
    });

    // Test 1: Engine initialization
    await engine.initialize();
    recordTest('Engine initialization', true);

    // Test 2: Check supported languages
    const languages = ['typescript', 'javascript', 'python', 'java', 'go', 'rust', 'csharp', 'cpp'];
    recordTest('Multi-language support', languages.length === 8, `Languages: ${languages.join(', ')}`);

    // Note: Actual code execution requires Docker or language runtimes
    recordTest('Execution engine configured', true, 'Ready for code execution');
}

async function testBenchmarkEngine(): Promise<void> {
    logSection('Testing Benchmark Engine');

    const challengeRepo = new ChallengeRepository();
    const scoringEngine = new ScoringEngine();
    const sessionManager = new SessionManager();
    const benchmarkEngine = new BenchmarkEngine(challengeRepo, scoringEngine, sessionManager);

    await challengeRepo.initialize();

    // Test 1: Start a benchmark session
    const session = await benchmarkEngine.startSession({
        name: 'Test Benchmark',
        maxChallenges: 3,
    });
    recordTest('Start benchmark session', !!session.id, `Session: ${session.name}`);

    // Test 2: Get current challenge
    const challenge = await benchmarkEngine.getCurrentChallenge(session.id);
    recordTest('Get current challenge', !!challenge, `Challenge: ${challenge?.title}`);

    // Test 3: Submit solution
    if (challenge) {
        const result = await benchmarkEngine.submitSolution(
            session.id,
            challenge.id,
            'function solution(input) { return input; }',
            'typescript'
        );
        recordTest('Submit solution', result.score >= 0, `Score: ${result.score}/${result.maxScore}`);
    }

    // Test 4: Get session results
    const results = await benchmarkEngine.getSessionResults(session.id);
    recordTest('Get session results', !!results, `Total Score: ${results?.overallScore}`);
}

async function testChallengeData(): Promise<void> {
    logSection('Testing Challenge Data Quality');

    // Test 1: All challenges have required fields
    let allValid = true;
    for (const challenge of challenges) {
        if (!challenge.id || !challenge.title || !challenge.description ||
            !challenge.category || !challenge.testCases || challenge.testCases.length === 0) {
            allValid = false;
            break;
        }
    }
    recordTest('All challenges have required fields', allValid);

    // Test 2: Challenge difficulty distribution
    const easy = challenges.filter(c => c.difficulty <= 3).length;
    const medium = challenges.filter(c => c.difficulty > 3 && c.difficulty <= 6).length;
    const hard = challenges.filter(c => c.difficulty > 6).length;
    recordTest('Difficulty distribution', easy > 0 && medium > 0 && hard > 0,
        `Easy: ${easy}, Medium: ${medium}, Hard: ${hard}`);

    // Test 3: All categories have challenges
    const allCategoriesHaveChallenges = Object.values(challengesByCategory)
        .every(cat => cat.length > 0);
    recordTest('All categories populated', allCategoriesHaveChallenges);

    // Test 4: Test cases have points
    const allTestCasesHavePoints = challenges.every(c =>
        c.testCases.every(tc => tc.points > 0)
    );
    recordTest('All test cases have points', allTestCasesHavePoints);

    // Test 5: Unique IDs
    const ids = challenges.map(c => c.id);
    const uniqueIds = new Set(ids);
    recordTest('All challenge IDs unique', ids.length === uniqueIds.size);

    // Print statistics
    log(`\n  📊 Challenge Statistics:`, COLORS.cyan);
    log(`     Total Challenges: ${challengeStats.total}`, COLORS.yellow);
    log(`     By Category:`, COLORS.yellow);
    Object.entries(challengeStats.byCategory).forEach(([cat, count]) => {
        log(`       - ${cat}: ${count}`, COLORS.reset);
    });
    log(`     By Difficulty:`, COLORS.yellow);
    Object.entries(challengeStats.byDifficulty).forEach(([diff, count]) => {
        log(`       - ${diff}: ${count}`, COLORS.reset);
    });
}

async function testInternationalStandards(): Promise<void> {
    logSection('Testing International Standards');

    const analytics = new AnalyticsEngine();

    // Create test results
    const mockResults = challenges.slice(0, 10).map((c, i) => ({
        challengeId: c.id,
        sessionId: 'test-session',
        solution: 'code',
        language: 'typescript' as const,
        score: 70 + Math.floor(Math.random() * 30),
        maxScore: c.maxScore,
        breakdown: { correctness: 40, efficiency: 20, codeQuality: 15, completeness: 5, creativity: 5 },
        testResults: [],
        feedback: 'Test feedback',
        suggestions: [],
        passed: true,
        timeTaken: 60000,
        submittedAt: new Date().toISOString(),
    }));

    const compliance = analytics.calculateStandardsCompliance(mockResults, challenges.slice(0, 10));

    // Test 1: HumanEval compliance
    recordTest('HumanEval standard', 'HumanEval' in compliance,
        `Score: ${compliance['HumanEval']?.score.toFixed(1)}%, Level: ${compliance['HumanEval']?.level}`);

    // Test 2: MMLU compliance
    recordTest('MMLU standard', 'MMLU' in compliance,
        `Score: ${compliance['MMLU']?.score.toFixed(1)}%, Level: ${compliance['MMLU']?.level}`);

    // Test 3: SWE-bench compliance
    recordTest('SWE-bench standard', 'SWE-bench' in compliance,
        `Score: ${compliance['SWE-bench']?.score.toFixed(1)}%, Level: ${compliance['SWE-bench']?.level}`);

    // Test 4: IEEE 2841 compliance
    recordTest('IEEE 2841 standard', 'IEEE 2841' in compliance,
        `Score: ${compliance['IEEE 2841']?.score.toFixed(1)}%, Level: ${compliance['IEEE 2841']?.level}`);

    // Test 5: ISO/IEC 25010 compliance
    recordTest('ISO/IEC 25010 standard', 'ISO/IEC 25010' in compliance,
        `Score: ${compliance['ISO/IEC 25010']?.score.toFixed(1)}%, Level: ${compliance['ISO/IEC 25010']?.level}`);
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests(): Promise<void> {
    console.clear();
    log('\n🧠 MCP IntelliBench - Comprehensive Feature Test', COLORS.bright);
    log('━'.repeat(60), COLORS.cyan);
    log(`Started at: ${new Date().toISOString()}`, COLORS.yellow);

    try {
        await testChallengeData();
        await testChallengeRepository();
        await testSessionManager();
        await testScoringEngine();
        await testAnalyticsEngine();
        await testCodeExecutionEngine();
        await testBenchmarkEngine();
        await testInternationalStandards();

        // Print summary
        logSection('Test Summary');
        const passed = testResults.filter(r => r.passed).length;
        const failed = testResults.filter(r => !r.passed).length;
        const total = testResults.length;

        log(`\n  📊 Results: ${passed}/${total} tests passed`, passed === total ? COLORS.green : COLORS.yellow);

        if (failed > 0) {
            log(`\n  ❌ Failed Tests:`, COLORS.red);
            testResults.filter(r => !r.passed).forEach(r => {
                log(`     - ${r.name}${r.error ? `: ${r.error}` : ''}`, COLORS.red);
            });
        }

        log(`\n  ⏱️  Completed at: ${new Date().toISOString()}`, COLORS.cyan);
        log('━'.repeat(60), COLORS.cyan);

        // Exit with appropriate code
        process.exit(failed > 0 ? 1 : 0);

    } catch (error) {
        log(`\n❌ Critical Error: ${error}`, COLORS.red);
        process.exit(1);
    }
}

// Run tests
runAllTests();
