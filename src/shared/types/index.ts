/**
 * @fileoverview Shared TypeScript type definitions for MCP IntelliBench
 * @module @mcp/intellibench/types
 * @version 1.0.0
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Unique identifier type for type safety
 */
export type UUID = string & { readonly __brand: unique symbol };

/**
 * Timestamp in ISO 8601 format
 */
export type ISOTimestamp = string;

/**
 * Supported programming languages for challenges
 */
export type ProgrammingLanguage =
    | 'typescript'
    | 'javascript'
    | 'python'
    | 'java'
    | 'csharp'
    | 'go'
    | 'rust'
    | 'cpp';

/**
 * Difficulty level enumeration
 */
export enum Difficulty {
    EASY = 1,
    MEDIUM = 2,
    HARD = 3,
    EXPERT = 4,
}

/**
 * Challenge category enumeration
 */
export enum ChallengeCategory {
    CODE_GENERATION = 'code_generation',
    BUG_DETECTION = 'bug_detection',
    REFACTORING = 'refactoring',
    ALGORITHM_DESIGN = 'algorithm_design',
    TEST_GENERATION = 'test_generation',
    DOCUMENTATION = 'documentation',
    ARCHITECTURE = 'architecture',
    SECURITY = 'security',
}

/**
 * Session status type
 */
export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned';

// ============================================================================
// Challenge Types
// ============================================================================

/**
 * Test case definition for challenge validation
 */
export interface TestCase {
    /** Unique identifier for the test case */
    readonly id: string;
    /** Human-readable name */
    readonly name: string;
    /** Input data for the test */
    readonly input: unknown;
    /** Expected output */
    readonly expectedOutput: unknown;
    /** Whether this is a hidden test case */
    readonly isHidden: boolean;
    /** Points awarded for passing this test */
    readonly points: number;
    /** Optional timeout in milliseconds */
    readonly timeout?: number;
}

/**
 * Code template for a specific language
 */
export interface CodeTemplate {
    /** Programming language */
    readonly language: ProgrammingLanguage;
    /** Starting code template */
    readonly template: string;
    /** Function signature that must be implemented */
    readonly signature: string;
}

/**
 * Complete challenge definition
 */
export interface Challenge {
    /** Unique challenge identifier */
    readonly id: string;
    /** Challenge title */
    readonly title: string;
    /** Detailed description in Markdown */
    readonly description: string;
    /** Challenge category */
    readonly category: ChallengeCategory;
    /** Difficulty level (1-10) */
    readonly difficulty: number;
    /** Difficulty tier */
    readonly difficultyTier: Difficulty;
    /** Requirements list */
    readonly requirements: readonly string[];
    /** Optional hints */
    readonly hints?: readonly string[];
    /** Code templates for supported languages */
    readonly templates: readonly CodeTemplate[];
    /** Test cases for validation */
    readonly testCases: readonly TestCase[];
    /** Maximum score achievable */
    readonly maxScore: number;
    /** Time limit in seconds */
    readonly timeLimit: number;
    /** Memory limit in MB */
    readonly memoryLimit: number;
    /** Tags for categorization */
    readonly tags: readonly string[];
    /** Challenge creation date */
    readonly createdAt: ISOTimestamp;
    /** Last update date */
    readonly updatedAt: ISOTimestamp;
}

/**
 * Partial challenge for listing purposes
 */
export interface ChallengeSummary {
    readonly id: string;
    readonly title: string;
    readonly category: ChallengeCategory;
    readonly difficulty: number;
    readonly difficultyTier: Difficulty;
    readonly maxScore: number;
    readonly tags: readonly string[];
}

// ============================================================================
// Session Types
// ============================================================================

/**
 * Benchmark session configuration
 */
export interface SessionConfig {
    /** Session name (optional) */
    readonly name?: string;
    /** Categories to include */
    readonly categories?: readonly ChallengeCategory[];
    /** Difficulty filter */
    readonly difficulty?: Difficulty | 'all';
    /** Maximum number of challenges */
    readonly maxChallenges?: number;
    /** Whether to randomize challenge order */
    readonly randomize?: boolean;
    /** Time limit for entire session in seconds */
    readonly sessionTimeLimit?: number;
}

/**
 * Active benchmark session
 */
export interface Session {
    /** Unique session identifier */
    readonly id: string;
    /** Session name */
    readonly name: string;
    /** AI model identifier */
    readonly aiModel?: string;
    /** Current status */
    readonly status: SessionStatus;
    /** Session configuration */
    readonly config: SessionConfig;
    /** Ordered list of challenge IDs */
    readonly challengeIds: readonly string[];
    /** Index of current challenge */
    readonly currentChallengeIndex: number;
    /** Completed challenge results */
    readonly results: readonly ChallengeResult[];
    /** Session start time */
    readonly startedAt: ISOTimestamp;
    /** Session end time */
    readonly completedAt?: ISOTimestamp;
    /** Total time spent in seconds */
    readonly totalTime?: number;
}

// ============================================================================
// Scoring Types
// ============================================================================

/**
 * Detailed score breakdown
 */
export interface ScoreBreakdown {
    /** Correctness score (0-100) */
    readonly correctness: number;
    /** Code efficiency score (0-100) */
    readonly efficiency: number;
    /** Code quality score (0-100) */
    readonly codeQuality: number;
    /** Completeness score (0-100) */
    readonly completeness: number;
    /** Creativity score (0-100) */
    readonly creativity: number;
}

/**
 * Test case execution result
 */
export interface TestCaseResult {
    /** Test case ID */
    readonly testCaseId: string;
    /** Whether the test passed */
    readonly passed: boolean;
    /** Actual output */
    readonly actualOutput?: unknown;
    /** Expected output */
    readonly expectedOutput?: unknown;
    /** Error message if failed */
    readonly error?: string;
    /** Execution time in milliseconds */
    readonly executionTime?: number;
    /** Memory usage in bytes */
    readonly memoryUsage?: number;
}

/**
 * Result for a single challenge
 */
export interface ChallengeResult {
    /** Challenge ID */
    readonly challengeId: string;
    /** Session ID */
    readonly sessionId: string;
    /** Submitted solution code */
    readonly solution: string;
    /** Programming language used */
    readonly language: ProgrammingLanguage;
    /** Total score achieved */
    readonly score: number;
    /** Maximum possible score */
    readonly maxScore: number;
    /** Detailed score breakdown */
    readonly breakdown: ScoreBreakdown;
    /** Individual test case results */
    readonly testResults: readonly TestCaseResult[];
    /** Overall feedback message */
    readonly feedback: string;
    /** Improvement suggestions */
    readonly suggestions: readonly string[];
    /** Whether the challenge was passed */
    readonly passed: boolean;
    /** Time taken in seconds */
    readonly timeTaken: number;
    /** Submission timestamp */
    readonly submittedAt: ISOTimestamp;
}

// ============================================================================
// Analytics Types
// ============================================================================

/**
 * Category-wise score summary
 */
export interface CategoryScore {
    readonly category: ChallengeCategory;
    readonly score: number;
    readonly maxScore: number;
    readonly percentage: number;
    readonly rank: string;
}

/**
 * Overall session results
 */
export interface SessionResults {
    /** Session ID */
    readonly sessionId: string;
    /** Overall score */
    readonly overallScore: number;
    /** Maximum possible score */
    readonly maxScore: number;
    /** Overall percentage */
    readonly percentage: number;
    /** Percentile rank */
    readonly percentile: number;
    /** Category-wise scores */
    readonly categoryScores: readonly CategoryScore[];
    /** Identified strengths */
    readonly strengths: readonly string[];
    /** Identified weaknesses */
    readonly weaknesses: readonly string[];
    /** Improvement recommendations */
    readonly recommendations: readonly string[];
    /** Number of completed challenges */
    readonly completedChallenges: number;
    /** Total number of challenges */
    readonly totalChallenges: number;
    /** Pass rate percentage */
    readonly passRate: number;
    /** Total time taken */
    readonly totalTime: string;
    /** Average time per challenge */
    readonly averageTime: string;
    /** Completion timestamp */
    readonly completedAt: ISOTimestamp;
}

// ============================================================================
// Leaderboard Types
// ============================================================================

/**
 * Timeframe for leaderboard filtering
 */
export type LeaderboardTimeframe = 'daily' | 'weekly' | 'monthly' | 'all';

/**
 * Single leaderboard entry
 */
export interface LeaderboardEntry {
    /** Rank position */
    readonly rank: number;
    /** AI model identifier */
    readonly aiModel: string;
    /** Total score */
    readonly score: number;
    /** Maximum possible score */
    readonly maxScore: number;
    /** Percentage score */
    readonly percentage: number;
    /** Challenges completed */
    readonly challengesCompleted: number;
    /** Completion timestamp */
    readonly completedAt: ISOTimestamp;
}

/**
 * Complete leaderboard data
 */
export interface Leaderboard {
    /** Category filter (if any) */
    readonly category?: ChallengeCategory;
    /** Timeframe filter */
    readonly timeframe: LeaderboardTimeframe;
    /** Leaderboard entries */
    readonly entries: readonly LeaderboardEntry[];
    /** Total number of entries */
    readonly totalEntries: number;
    /** Last updated timestamp */
    readonly updatedAt: ISOTimestamp;
}

// ============================================================================
// API Types
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
    readonly success: boolean;
    readonly data?: T;
    readonly error?: {
        readonly code: string;
        readonly message: string;
        readonly details?: unknown;
    };
    readonly meta?: {
        readonly timestamp: ISOTimestamp;
        readonly requestId: string;
    };
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T> {
    readonly pagination: {
        readonly page: number;
        readonly pageSize: number;
        readonly total: number;
        readonly totalPages: number;
    };
}

// ============================================================================
// MCP Types
// ============================================================================

/**
 * MCP Tool input schema
 */
export interface ToolInput {
    readonly [key: string]: unknown;
}

/**
 * MCP Tool result
 */
export interface ToolResult {
    readonly content: Array<{
        readonly type: 'text' | 'image' | 'resource';
        readonly text?: string;
        readonly data?: string;
        readonly mimeType?: string;
    }>;
    readonly isError?: boolean;
}

/**
 * MCP Resource definition
 */
export interface Resource {
    readonly uri: string;
    readonly name: string;
    readonly description?: string;
    readonly mimeType?: string;
}

/**
 * MCP Prompt definition
 */
export interface Prompt {
    readonly name: string;
    readonly description?: string;
    readonly arguments?: readonly {
        readonly name: string;
        readonly description?: string;
        readonly required?: boolean;
    }[];
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Server configuration
 */
export interface ServerConfig {
    readonly port: number;
    readonly host: string;
    readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
    readonly logFormat: 'json' | 'pretty';
}

/**
 * Benchmark configuration
 */
export interface BenchmarkConfig {
    readonly timeout: number;
    readonly maxRetries: number;
    readonly parallel: boolean;
}

/**
 * Scoring configuration
 */
export interface ScoringConfig {
    readonly strictMode: boolean;
    readonly partialCredit: boolean;
    readonly weights: ScoreBreakdown;
}

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
    readonly port: number;
    readonly host: string;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
    readonly path: string;
}

/**
 * Complete application configuration
 */
export interface AppConfig {
    readonly server: ServerConfig;
    readonly benchmark: BenchmarkConfig;
    readonly scoring: ScoringConfig;
    readonly dashboard: DashboardConfig;
    readonly database: DatabaseConfig;
}
