/**
 * @fileoverview SQLite Database Persistence Layer
 * @module @mcp/intellibench/core/persistence
 * @version 1.0.0
 *
 * Provides persistent storage for benchmark sessions, results, and analytics.
 * Uses better-sqlite3 for synchronous, high-performance SQLite operations.
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { getDataDir, logger } from '../../shared/utils/logger.js';
import type {
    Session,
    ChallengeResult,
    SessionResults,
    LeaderboardEntry,
    ChallengeCategory,
    LeaderboardTimeframe,
} from '../../shared/types/index.js';

// ============================================================================
// Database Schema
// ============================================================================

const SCHEMA = `
-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ai_model TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    config TEXT NOT NULL,
    challenge_ids TEXT NOT NULL,
    current_challenge_index INTEGER DEFAULT 0,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    total_time INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Challenge results table
CREATE TABLE IF NOT EXISTS challenge_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    challenge_id TEXT NOT NULL,
    solution TEXT NOT NULL,
    language TEXT NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    breakdown TEXT NOT NULL,
    test_results TEXT NOT NULL,
    feedback TEXT,
    suggestions TEXT,
    passed INTEGER NOT NULL,
    time_taken INTEGER NOT NULL,
    submitted_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Session results/analytics table
CREATE TABLE IF NOT EXISTS session_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    overall_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage REAL NOT NULL,
    percentile REAL,
    category_scores TEXT NOT NULL,
    strengths TEXT,
    weaknesses TEXT,
    recommendations TEXT,
    completed_challenges INTEGER NOT NULL,
    total_challenges INTEGER NOT NULL,
    pass_rate REAL NOT NULL,
    total_time TEXT NOT NULL,
    average_time TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Leaderboard cache table
CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ai_model TEXT NOT NULL,
    category TEXT,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage REAL NOT NULL,
    challenges_completed INTEGER NOT NULL,
    completed_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- AI Model profiles table
CREATE TABLE IF NOT EXISTS ai_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT,
    version TEXT,
    total_sessions INTEGER DEFAULT 0,
    average_score REAL DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    total_challenges_completed INTEGER DEFAULT 0,
    first_seen TEXT DEFAULT (datetime('now')),
    last_seen TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_ai_model ON sessions(ai_model);
CREATE INDEX IF NOT EXISTS idx_challenge_results_session ON challenge_results(session_id);
CREATE INDEX IF NOT EXISTS idx_challenge_results_challenge ON challenge_results(challenge_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON leaderboard(category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_completed_at ON leaderboard(completed_at);
`;

// ============================================================================
// Database Manager
// ============================================================================

export class DatabaseManager {
    private db: Database.Database;
    private readonly dbPath: string;

    constructor(dbPath?: string) {
        // Use APPDATA directory for portable mode instead of process.cwd()
        const dataDir = getDataDir();
        if (!existsSync(dataDir)) {
            mkdirSync(dataDir, { recursive: true });
        }
        this.dbPath = dbPath ?? join(dataDir, 'intellibench.db');

        logger.info(`Database path: ${this.dbPath}`, 'Database');

        try {
            this.db = new Database(this.dbPath);
            this.initialize();
            logger.info('Database initialized successfully', 'Database');
        } catch (err) {
            logger.error('Failed to initialize database', 'Database', err instanceof Error ? err : undefined, { dbPath: this.dbPath });
            throw err;
        }
    }

    /**
     * Initialize database schema
     */
    private initialize(): void {
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
        this.db.exec(SCHEMA);
    }

    /**
     * Close database connection
     */
    close(): void {
        this.db.close();
    }

    // ========================================================================
    // Session Operations
    // ========================================================================

    /**
     * Save a new session
     */
    saveSession(session: Session): void {
        const stmt = this.db.prepare(`
            INSERT INTO sessions (id, name, ai_model, status, config, challenge_ids, current_challenge_index, started_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            session.id,
            session.name,
            session.aiModel ?? null,
            session.status,
            JSON.stringify(session.config),
            JSON.stringify(session.challengeIds),
            session.currentChallengeIndex,
            session.startedAt
        );
    }

    /**
     * Update session status
     */
    updateSession(session: Partial<Session> & { id: string }): void {
        const updates: string[] = [];
        const values: unknown[] = [];

        if (session.status !== undefined) {
            updates.push('status = ?');
            values.push(session.status);
        }
        if (session.currentChallengeIndex !== undefined) {
            updates.push('current_challenge_index = ?');
            values.push(session.currentChallengeIndex);
        }
        if (session.completedAt !== undefined) {
            updates.push('completed_at = ?');
            values.push(session.completedAt);
        }
        if (session.totalTime !== undefined) {
            updates.push('total_time = ?');
            values.push(session.totalTime);
        }

        if (updates.length === 0) return;

        updates.push('updated_at = datetime("now")');
        values.push(session.id);

        const stmt = this.db.prepare(`
            UPDATE sessions SET ${updates.join(', ')} WHERE id = ?
        `);
        stmt.run(...values);
    }

    /**
     * Get session by ID
     */
    getSession(sessionId: string): Session | null {
        const stmt = this.db.prepare('SELECT * FROM sessions WHERE id = ?');
        const row = stmt.get(sessionId) as Record<string, unknown> | undefined;
        if (!row) return null;

        return this.rowToSession(row);
    }

    /**
     * Get all sessions
     */
    getAllSessions(limit = 100, offset = 0): Session[] {
        const stmt = this.db.prepare(`
            SELECT * FROM sessions
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `);
        const rows = stmt.all(limit, offset) as Record<string, unknown>[];
        return rows.map((row) => this.rowToSession(row));
    }

    /**
     * Get sessions by status
     */
    getSessionsByStatus(status: string): Session[] {
        const stmt = this.db.prepare('SELECT * FROM sessions WHERE status = ?');
        const rows = stmt.all(status) as Record<string, unknown>[];
        return rows.map((row) => this.rowToSession(row));
    }

    /**
     * Delete session and related data
     */
    deleteSession(sessionId: string): boolean {
        const stmt = this.db.prepare('DELETE FROM sessions WHERE id = ?');
        const result = stmt.run(sessionId);
        return result.changes > 0;
    }

    private rowToSession(row: Record<string, unknown>): Session {
        return {
            id: row['id'] as string,
            name: row['name'] as string,
            aiModel: row['ai_model'] as string | undefined,
            status: row['status'] as Session['status'],
            config: JSON.parse(row['config'] as string),
            challengeIds: JSON.parse(row['challenge_ids'] as string),
            currentChallengeIndex: row['current_challenge_index'] as number,
            results: [],
            startedAt: row['started_at'] as string,
            completedAt: row['completed_at'] as string | undefined,
            totalTime: row['total_time'] as number | undefined,
        };
    }

    // ========================================================================
    // Challenge Result Operations
    // ========================================================================

    /**
     * Save challenge result
     */
    saveChallengeResult(result: ChallengeResult): void {
        const stmt = this.db.prepare(`
            INSERT INTO challenge_results
            (session_id, challenge_id, solution, language, score, max_score, breakdown, test_results, feedback, suggestions, passed, time_taken, submitted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            result.sessionId,
            result.challengeId,
            result.solution,
            result.language,
            result.score,
            result.maxScore,
            JSON.stringify(result.breakdown),
            JSON.stringify(result.testResults),
            result.feedback,
            JSON.stringify(result.suggestions),
            result.passed ? 1 : 0,
            result.timeTaken,
            result.submittedAt
        );
    }

    /**
     * Get challenge results for a session
     */
    getChallengeResults(sessionId: string): ChallengeResult[] {
        const stmt = this.db.prepare(`
            SELECT * FROM challenge_results WHERE session_id = ? ORDER BY submitted_at
        `);
        const rows = stmt.all(sessionId) as Record<string, unknown>[];
        return rows.map((row) => this.rowToChallengeResult(row));
    }

    /**
     * Get all results for a specific challenge
     */
    getResultsByChallenge(challengeId: string, limit = 50): ChallengeResult[] {
        const stmt = this.db.prepare(`
            SELECT * FROM challenge_results
            WHERE challenge_id = ?
            ORDER BY score DESC
            LIMIT ?
        `);
        const rows = stmt.all(challengeId, limit) as Record<string, unknown>[];
        return rows.map((row) => this.rowToChallengeResult(row));
    }

    private rowToChallengeResult(row: Record<string, unknown>): ChallengeResult {
        return {
            challengeId: row['challenge_id'] as string,
            sessionId: row['session_id'] as string,
            solution: row['solution'] as string,
            language: row['language'] as ChallengeResult['language'],
            score: row['score'] as number,
            maxScore: row['max_score'] as number,
            breakdown: JSON.parse(row['breakdown'] as string),
            testResults: JSON.parse(row['test_results'] as string),
            feedback: row['feedback'] as string,
            suggestions: JSON.parse(row['suggestions'] as string),
            passed: row['passed'] === 1,
            timeTaken: row['time_taken'] as number,
            submittedAt: row['submitted_at'] as string,
        };
    }

    // ========================================================================
    // Session Results/Analytics Operations
    // ========================================================================

    /**
     * Save session results
     */
    saveSessionResults(results: SessionResults): void {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO session_results
            (session_id, overall_score, max_score, percentage, percentile, category_scores, strengths, weaknesses, recommendations, completed_challenges, total_challenges, pass_rate, total_time, average_time, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            results.sessionId,
            results.overallScore,
            results.maxScore,
            results.percentage,
            results.percentile,
            JSON.stringify(results.categoryScores),
            JSON.stringify(results.strengths),
            JSON.stringify(results.weaknesses),
            JSON.stringify(results.recommendations),
            results.completedChallenges,
            results.totalChallenges,
            results.passRate,
            results.totalTime,
            results.averageTime,
            results.completedAt
        );
    }

    /**
     * Get session results
     */
    getSessionResults(sessionId: string): SessionResults | null {
        const stmt = this.db.prepare('SELECT * FROM session_results WHERE session_id = ?');
        const row = stmt.get(sessionId) as Record<string, unknown> | undefined;
        if (!row) return null;

        return {
            sessionId: row['session_id'] as string,
            overallScore: row['overall_score'] as number,
            maxScore: row['max_score'] as number,
            percentage: row['percentage'] as number,
            percentile: row['percentile'] as number,
            categoryScores: JSON.parse(row['category_scores'] as string),
            strengths: JSON.parse(row['strengths'] as string),
            weaknesses: JSON.parse(row['weaknesses'] as string),
            recommendations: JSON.parse(row['recommendations'] as string),
            completedChallenges: row['completed_challenges'] as number,
            totalChallenges: row['total_challenges'] as number,
            passRate: row['pass_rate'] as number,
            totalTime: row['total_time'] as string,
            averageTime: row['average_time'] as string,
            completedAt: row['completed_at'] as string,
        };
    }

    // ========================================================================
    // Leaderboard Operations
    // ========================================================================

    /**
     * Add entry to leaderboard
     */
    addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'rank'>): void {
        const stmt = this.db.prepare(`
            INSERT INTO leaderboard
            (ai_model, score, max_score, percentage, challenges_completed, completed_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            entry.aiModel,
            entry.score,
            entry.maxScore,
            entry.percentage,
            entry.challengesCompleted,
            entry.completedAt
        );
    }

    /**
     * Get leaderboard entries
     */
    getLeaderboard(
        category?: ChallengeCategory,
        timeframe: LeaderboardTimeframe = 'all',
        limit = 100
    ): LeaderboardEntry[] {
        let whereClause = '';
        const params: unknown[] = [];

        if (category) {
            whereClause += 'category = ? AND ';
            params.push(category);
        }

        // Timeframe filter
        const now = new Date();
        switch (timeframe) {
            case 'daily':
                whereClause += 'completed_at >= date("now", "-1 day") AND ';
                break;
            case 'weekly':
                whereClause += 'completed_at >= date("now", "-7 days") AND ';
                break;
            case 'monthly':
                whereClause += 'completed_at >= date("now", "-30 days") AND ';
                break;
        }

        // Remove trailing AND
        if (whereClause) {
            whereClause = 'WHERE ' + whereClause.slice(0, -5);
        }

        params.push(limit);

        const stmt = this.db.prepare(`
            SELECT
                ai_model,
                score,
                max_score,
                percentage,
                challenges_completed,
                completed_at,
                ROW_NUMBER() OVER (ORDER BY percentage DESC, score DESC) as rank
            FROM leaderboard
            ${whereClause}
            ORDER BY percentage DESC, score DESC
            LIMIT ?
        `);

        const rows = stmt.all(...params) as Record<string, unknown>[];
        return rows.map((row) => ({
            rank: row['rank'] as number,
            aiModel: row['ai_model'] as string,
            score: row['score'] as number,
            maxScore: row['max_score'] as number,
            percentage: row['percentage'] as number,
            challengesCompleted: row['challenges_completed'] as number,
            completedAt: row['completed_at'] as string,
        }));
    }

    // ========================================================================
    // AI Model Operations
    // ========================================================================

    /**
     * Update or create AI model profile
     */
    upsertAIModel(modelId: string, name: string, provider?: string): void {
        const stmt = this.db.prepare(`
            INSERT INTO ai_models (id, name, provider, last_seen)
            VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                provider = COALESCE(excluded.provider, ai_models.provider),
                last_seen = datetime('now')
        `);
        stmt.run(modelId, name, provider ?? null);
    }

    /**
     * Update AI model stats after session completion
     */
    updateAIModelStats(modelId: string, score: number, challengesCompleted: number): void {
        const stmt = this.db.prepare(`
            UPDATE ai_models SET
                total_sessions = total_sessions + 1,
                average_score = ((average_score * total_sessions) + ?) / (total_sessions + 1),
                best_score = MAX(best_score, ?),
                total_challenges_completed = total_challenges_completed + ?,
                last_seen = datetime('now')
            WHERE id = ?
        `);
        stmt.run(score, score, challengesCompleted, modelId);
    }

    /**
     * Get AI model stats
     */
    getAIModelStats(modelId: string): Record<string, unknown> | null {
        const stmt = this.db.prepare('SELECT * FROM ai_models WHERE id = ?');
        return stmt.get(modelId) as Record<string, unknown> | null;
    }

    /**
     * Get all AI models ranked by performance
     */
    getAllAIModels(): Record<string, unknown>[] {
        const stmt = this.db.prepare(`
            SELECT * FROM ai_models
            ORDER BY average_score DESC, total_sessions DESC
        `);
        return stmt.all() as Record<string, unknown>[];
    }

    // ========================================================================
    // Statistics Operations
    // ========================================================================

    /**
     * Get overall statistics
     */
    getOverallStats(): Record<string, unknown> {
        const stats = this.db.prepare(`
            SELECT
                (SELECT COUNT(*) FROM sessions) as total_sessions,
                (SELECT COUNT(*) FROM sessions WHERE status = 'completed') as completed_sessions,
                (SELECT COUNT(*) FROM challenge_results) as total_submissions,
                (SELECT AVG(score) FROM challenge_results) as average_score,
                (SELECT COUNT(DISTINCT ai_model) FROM sessions WHERE ai_model IS NOT NULL) as unique_models,
                (SELECT COUNT(DISTINCT challenge_id) FROM challenge_results) as challenges_attempted
        `).get() as Record<string, unknown>;

        return stats;
    }

    /**
     * Get challenge difficulty statistics
     */
    getChallengeStats(challengeId: string): Record<string, unknown> | null {
        const stmt = this.db.prepare(`
            SELECT
                challenge_id,
                COUNT(*) as attempts,
                AVG(score) as average_score,
                MAX(score) as best_score,
                MIN(score) as worst_score,
                SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passes,
                AVG(time_taken) as average_time
            FROM challenge_results
            WHERE challenge_id = ?
            GROUP BY challenge_id
        `);
        return stmt.get(challengeId) as Record<string, unknown> | null;
    }
}

export default DatabaseManager;
