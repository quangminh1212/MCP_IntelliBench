/**
 * @fileoverview Shared utility functions for MCP IntelliBench
 * @module @mcp/intellibench/utils
 * @version 1.0.0
 */

import { nanoid } from 'nanoid';
import type {
    ScoreBreakdown,
    ChallengeCategory,
    Difficulty,
    ISOTimestamp,
} from '../types/index.js';
import {
    DEFAULT_SCORE_WEIGHTS,
    SCORE_THRESHOLDS,
    RANK_LABELS,
    DIFFICULTY_DISPLAY_NAMES,
    CATEGORY_DISPLAY_NAMES,
} from '../constants/index.js';

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a unique session ID
 * @returns A unique 21-character nanoid
 */
export function generateSessionId(): string {
    return nanoid(21);
}

/**
 * Generate a unique request ID
 * @returns A unique 16-character nanoid prefixed with 'req_'
 */
export function generateRequestId(): string {
    return `req_${nanoid(12)}`;
}

// ============================================================================
// Timestamp Utilities
// ============================================================================

/**
 * Get current timestamp in ISO 8601 format
 * @returns ISO timestamp string
 */
export function getCurrentTimestamp(): ISOTimestamp {
    return new Date().toISOString();
}

/**
 * Parse ISO timestamp to Date object
 * @param timestamp - ISO timestamp string
 * @returns Date object
 */
export function parseTimestamp(timestamp: ISOTimestamp): Date {
    return new Date(timestamp);
}

/**
 * Calculate duration between two timestamps
 * @param start - Start timestamp
 * @param end - End timestamp
 * @returns Duration in seconds
 */
export function calculateDuration(start: ISOTimestamp, end: ISOTimestamp): number {
    const startDate = parseTimestamp(start);
    const endDate = parseTimestamp(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / 1000);
}

/**
 * Format duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "2m 30s", "1h 15m")
 */
export function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${seconds}s`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
}

// ============================================================================
// Scoring Utilities
// ============================================================================

/**
 * Calculate weighted total score from breakdown
 * @param breakdown - Score breakdown object
 * @param weights - Optional custom weights (defaults to standard weights)
 * @returns Weighted total score (0-100)
 */
export function calculateWeightedScore(
    breakdown: ScoreBreakdown,
    weights: ScoreBreakdown = DEFAULT_SCORE_WEIGHTS
): number {
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

    const weightedSum =
        breakdown.correctness * weights.correctness +
        breakdown.efficiency * weights.efficiency +
        breakdown.codeQuality * weights.codeQuality +
        breakdown.completeness * weights.completeness +
        breakdown.creativity * weights.creativity;

    return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Calculate percentage from score
 * @param score - Actual score
 * @param maxScore - Maximum possible score
 * @returns Percentage (0-100)
 */
export function calculatePercentage(score: number, maxScore: number): number {
    if (maxScore === 0) return 0;
    return Math.round((score / maxScore) * 10000) / 100;
}

/**
 * Get rank label based on score percentage
 * @param percentage - Score percentage
 * @returns Rank label string
 */
export function getRankLabel(percentage: number): string {
    if (percentage >= SCORE_THRESHOLDS.EXCELLENT) {
        return RANK_LABELS.EXCELLENT;
    }
    if (percentage >= SCORE_THRESHOLDS.GOOD) {
        return RANK_LABELS.GOOD;
    }
    if (percentage >= SCORE_THRESHOLDS.AVERAGE) {
        return RANK_LABELS.AVERAGE;
    }
    if (percentage >= SCORE_THRESHOLDS.POOR) {
        return RANK_LABELS.NEEDS_IMPROVEMENT;
    }
    return RANK_LABELS.POOR;
}

/**
 * Calculate percentile rank
 * @param score - User's score
 * @param allScores - Array of all scores
 * @returns Percentile rank (0-100)
 */
export function calculatePercentile(score: number, allScores: readonly number[]): number {
    if (allScores.length === 0) return 100;

    const sortedScores = [...allScores].sort((a, b) => a - b);
    const belowCount = sortedScores.filter((s) => s < score).length;

    return Math.round((belowCount / sortedScores.length) * 100);
}

// ============================================================================
// Display Utilities
// ============================================================================

/**
 * Get difficulty display name
 * @param difficulty - Difficulty enum value
 * @returns Human-readable difficulty name
 */
export function getDifficultyDisplayName(difficulty: Difficulty): string {
    return DIFFICULTY_DISPLAY_NAMES[difficulty] ?? 'Unknown';
}

/**
 * Get category display name
 * @param category - Category enum value
 * @returns Human-readable category name
 */
export function getCategoryDisplayName(category: ChallengeCategory): string {
    return CATEGORY_DISPLAY_NAMES[category] ?? 'Unknown';
}

/**
 * Format number with thousands separator
 * @param value - Number to format
 * @returns Formatted string with commas
 */
export function formatNumber(value: number): string {
    return value.toLocaleString('en-US');
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Check if value is a valid session ID
 * @param value - Value to check
 * @returns True if valid session ID
 */
export function isValidSessionId(value: unknown): value is string {
    return typeof value === 'string' && /^[a-zA-Z0-9_-]{21}$/.test(value);
}

/**
 * Check if value is a valid challenge ID
 * @param value - Value to check
 * @returns True if valid challenge ID
 */
export function isValidChallengeId(value: unknown): value is string {
    return typeof value === 'string' && /^[a-z]+_\d{3}$/.test(value);
}

/**
 * Check if value is a valid programming language
 * @param value - Value to check
 * @returns True if valid programming language
 */
export function isValidLanguage(value: unknown): boolean {
    const validLanguages = [
        'typescript',
        'javascript',
        'python',
        'java',
        'csharp',
        'go',
        'rust',
        'cpp',
    ];
    return typeof value === 'string' && validLanguages.includes(value);
}

/**
 * Check if value is a valid category
 * @param value - Value to check
 * @returns True if valid category
 */
export function isValidCategory(value: unknown): value is ChallengeCategory {
    const validCategories = [
        'code_generation',
        'bug_detection',
        'refactoring',
        'algorithm_design',
        'test_generation',
        'documentation',
        'architecture',
        'security',
    ];
    return typeof value === 'string' && validCategories.includes(value);
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j]!, result[i]!];
    }
    return result;
}

/**
 * Group array by key
 * @param array - Array to group
 * @param keyFn - Function to extract key from item
 * @returns Object with keys and arrays of items
 */
export function groupBy<T, K extends string>(
    array: readonly T[],
    keyFn: (item: T) => K
): Record<K, T[]> {
    return array.reduce(
        (result, item) => {
            const key = keyFn(item);
            if (!result[key]) {
                result[key] = [];
            }
            result[key].push(item);
            return result;
        },
        {} as Record<K, T[]>
    );
}

/**
 * Calculate average of numbers
 * @param values - Array of numbers
 * @returns Average value
 */
export function average(values: readonly number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100;
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Create a standardized error object
 * @param code - Error code
 * @param message - Error message
 * @param details - Optional error details
 * @returns Standardized error object
 */
export function createError(
    code: string,
    message: string,
    details?: unknown
): { code: string; message: string; details?: unknown } {
    return { code, message, ...(details !== undefined && { details }) };
}

/**
 * Check if value is an Error object
 * @param value - Value to check
 * @returns True if Error object
 */
export function isError(value: unknown): value is Error {
    return value instanceof Error;
}

/**
 * Safely stringify any value for logging
 * @param value - Value to stringify
 * @returns JSON string representation
 */
export function safeStringify(value: unknown): string {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

// ============================================================================
// Async Utilities
// ============================================================================

/**
 * Sleep for specified duration
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after duration
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry async operation with exponential backoff
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Result of successful operation
 */
export async function retry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                await sleep(delay);
            }
        }
    }

    throw lastError;
}

/**
 * Execute function with timeout
 * @param fn - Async function to execute
 * @param timeoutMs - Timeout in milliseconds
 * @returns Result of function or throws on timeout
 */
export function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
        ),
    ]);
}
