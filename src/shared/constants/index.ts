/**
 * @fileoverview Shared constants for MCP IntelliBench
 * @module @mcp/intellibench/constants
 * @version 1.0.0
 */

import type { ScoreBreakdown, ChallengeCategory, Difficulty } from '../types/index.js';

// ============================================================================
// Application Constants
// ============================================================================

/**
 * Application metadata
 */
export const APP = {
    NAME: 'MCP IntelliBench',
    VERSION: '1.0.0',
    DESCRIPTION: 'A comprehensive MCP Server for evaluating AI Coding Intelligence',
} as const;

/**
 * MCP Server information
 */
export const MCP_SERVER = {
    NAME: 'intellibench',
    VERSION: '1.0.0',
    PROTOCOL_VERSION: '2024-11-05',
} as const;

// ============================================================================
// Scoring Constants
// ============================================================================

/**
 * Default scoring weights
 */
export const DEFAULT_SCORE_WEIGHTS: Readonly<ScoreBreakdown> = {
    correctness: 40,
    efficiency: 20,
    codeQuality: 20,
    completeness: 10,
    creativity: 10,
} as const;

/**
 * Score thresholds for rankings
 */
export const SCORE_THRESHOLDS = {
    EXCELLENT: 90,
    GOOD: 75,
    AVERAGE: 60,
    POOR: 40,
} as const;

/**
 * Rank labels
 */
export const RANK_LABELS = {
    EXCELLENT: 'Excellent',
    GOOD: 'Good',
    AVERAGE: 'Average',
    NEEDS_IMPROVEMENT: 'Needs Improvement',
    POOR: 'Poor',
} as const;

// ============================================================================
// Challenge Constants
// ============================================================================

/**
 * Category display names
 */
export const CATEGORY_DISPLAY_NAMES: Readonly<Record<ChallengeCategory, string>> = {
    code_generation: 'Code Generation',
    bug_detection: 'Bug Detection & Fixing',
    refactoring: 'Code Refactoring',
    algorithm_design: 'Algorithm Design',
    test_generation: 'Test Generation',
    documentation: 'Documentation',
    architecture: 'Architecture Design',
    security: 'Security Analysis',
} as const;

/**
 * Category descriptions
 */
export const CATEGORY_DESCRIPTIONS: Readonly<Record<ChallengeCategory, string>> = {
    code_generation: 'Generate correct and efficient code from specifications',
    bug_detection: 'Identify and fix bugs in existing code',
    refactoring: 'Improve code quality and maintainability',
    algorithm_design: 'Design efficient algorithms for complex problems',
    test_generation: 'Create comprehensive test cases',
    documentation: 'Write clear and helpful documentation',
    architecture: 'Design scalable system architectures',
    security: 'Identify and fix security vulnerabilities',
} as const;

/**
 * Category icons (emoji)
 */
export const CATEGORY_ICONS: Readonly<Record<ChallengeCategory, string>> = {
    code_generation: '🔧',
    bug_detection: '🐛',
    refactoring: '🔄',
    algorithm_design: '📚',
    test_generation: '🧪',
    documentation: '📖',
    architecture: '🏗️',
    security: '🔒',
} as const;

/**
 * Difficulty display names
 */
export const DIFFICULTY_DISPLAY_NAMES: Readonly<Record<Difficulty, string>> = {
    1: 'Easy',
    2: 'Medium',
    3: 'Hard',
    4: 'Expert',
} as const;

/**
 * Difficulty colors
 */
export const DIFFICULTY_COLORS: Readonly<Record<Difficulty, string>> = {
    1: '#22c55e', // Green
    2: '#eab308', // Yellow
    3: '#ef4444', // Red
    4: '#8b5cf6', // Purple
} as const;

/**
 * Difficulty icons (emoji)
 */
export const DIFFICULTY_ICONS: Readonly<Record<Difficulty, string>> = {
    1: '🟢',
    2: '🟡',
    3: '🔴',
    4: '⚫',
} as const;

// ============================================================================
// Time Constants
// ============================================================================

/**
 * Default timeouts in milliseconds
 */
export const TIMEOUTS = {
    DEFAULT_CHALLENGE: 30000,
    MIN_CHALLENGE: 5000,
    MAX_CHALLENGE: 300000,
    SESSION: 3600000,
    CODE_EXECUTION: 10000,
} as const;

/**
 * Default limits
 */
export const LIMITS = {
    MAX_SOLUTION_LENGTH: 50000,
    MAX_CHALLENGES_PER_SESSION: 50,
    DEFAULT_CHALLENGES_PER_SESSION: 10,
    LEADERBOARD_DEFAULT_LIMIT: 10,
    LEADERBOARD_MAX_LIMIT: 100,
    MAX_RETRIES: 3,
} as const;

// ============================================================================
// API Constants
// ============================================================================

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
    SESSIONS: '/api/sessions',
    CHALLENGES: '/api/challenges',
    RESULTS: '/api/results',
    LEADERBOARD: '/api/leaderboard',
    HEALTH: '/api/health',
} as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
    INVALID_REQUEST: 'INVALID_REQUEST',
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
    CHALLENGE_NOT_FOUND: 'CHALLENGE_NOT_FOUND',
    SESSION_COMPLETED: 'SESSION_COMPLETED',
    TIMEOUT: 'TIMEOUT',
    EXECUTION_ERROR: 'EXECUTION_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ============================================================================
// MCP Constants
// ============================================================================

/**
 * MCP Tool names
 */
export const MCP_TOOLS = {
    START_SESSION: 'intellibench_start_session',
    GET_CHALLENGE: 'intellibench_get_challenge',
    SUBMIT_SOLUTION: 'intellibench_submit_solution',
    GET_RESULTS: 'intellibench_get_results',
    GET_LEADERBOARD: 'intellibench_leaderboard',
    LIST_CHALLENGES: 'intellibench_list_challenges',
    GET_SESSION_STATUS: 'intellibench_session_status',
    SKIP_CHALLENGE: 'intellibench_skip_challenge',
} as const;

/**
 * MCP Resource URIs
 */
export const MCP_RESOURCES = {
    CHALLENGES: 'intellibench://challenges',
    SESSIONS: 'intellibench://sessions',
    RESULTS: 'intellibench://results',
    LEADERBOARD: 'intellibench://leaderboard',
} as const;

/**
 * MCP Prompt names
 */
export const MCP_PROMPTS = {
    INTRODUCTION: 'benchmark_introduction',
    CHALLENGE_TIPS: 'challenge_tips',
    SCORE_INTERPRETATION: 'score_interpretation',
} as const;

// ============================================================================
// Configuration Defaults
// ============================================================================

/**
 * Default server configuration
 */
export const DEFAULT_SERVER_CONFIG = {
    PORT: 3000,
    HOST: 'localhost',
    LOG_LEVEL: 'info',
    LOG_FORMAT: 'json',
} as const;

/**
 * Default dashboard configuration
 */
export const DEFAULT_DASHBOARD_CONFIG = {
    PORT: 8080,
    HOST: 'localhost',
} as const;

/**
 * Default database configuration
 */
export const DEFAULT_DATABASE_CONFIG = {
    PATH: './data/intellibench.db',
} as const;

// ============================================================================
// Validation Constants
// ============================================================================

/**
 * Regular expressions for validation
 */
export const PATTERNS = {
    SESSION_ID: /^[a-zA-Z0-9_-]{21}$/,
    CHALLENGE_ID: /^[a-z]+_\d{3}$/,
    LANGUAGE_CODE: /^[a-z]{2,10}$/,
} as const;

/**
 * Supported programming languages
 */
export const SUPPORTED_LANGUAGES = [
    'typescript',
    'javascript',
    'python',
    'java',
    'csharp',
    'go',
    'rust',
    'cpp',
] as const;

/**
 * Language display names
 */
export const LANGUAGE_DISPLAY_NAMES: Readonly<Record<string, string>> = {
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    python: 'Python',
    java: 'Java',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    cpp: 'C++',
} as const;

/**
 * Language file extensions
 */
export const LANGUAGE_EXTENSIONS: Readonly<Record<string, string>> = {
    typescript: '.ts',
    javascript: '.js',
    python: '.py',
    java: '.java',
    csharp: '.cs',
    go: '.go',
    rust: '.rs',
    cpp: '.cpp',
} as const;
