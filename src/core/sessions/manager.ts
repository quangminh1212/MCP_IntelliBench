/**
 * @fileoverview Session Manager - Manages benchmark sessions
 * @module @mcp/intellibench/core/sessions
 * @version 1.0.0
 */

import type { Session, SessionStatus, ChallengeResult, LeaderboardTimeframe } from '../../shared/types/index.js';
import { getCurrentTimestamp } from '../../shared/utils/index.js';
import { logger } from '../../shared/utils/logger.js';

export class SessionManager {
    private sessions: Map<string, Session> = new Map();

    async saveSession(session: Session): Promise<void> {
        logger.info('Saving session', 'SessionManager', {
            sessionId: session.id,
            sessionName: session.name,
            status: session.status,
            challengeCount: session.challengeIds.length,
        });

        this.sessions.set(session.id, session);

        logger.debug('Session saved', 'SessionManager', {
            sessionId: session.id,
            totalSessionsInMemory: this.sessions.size,
        });
    }

    async getSession(id: string): Promise<Session | null> {
        logger.debug('Getting session', 'SessionManager', { sessionId: id });

        const session = this.sessions.get(id) ?? null;

        if (session) {
            logger.debug('Session found', 'SessionManager', {
                sessionId: id,
                status: session.status,
                currentIndex: session.currentChallengeIndex,
                resultsCount: session.results.length,
            });
        } else {
            logger.warn('Session not found', 'SessionManager', {
                sessionId: id,
                availableSessions: Array.from(this.sessions.keys()),
            });
        }

        return session;
    }

    async updateSessionStatus(id: string, status: SessionStatus): Promise<void> {
        logger.info('Updating session status', 'SessionManager', {
            sessionId: id,
            newStatus: status,
        });

        const session = this.sessions.get(id);
        if (!session) {
            logger.error('Cannot update status - session not found', 'SessionManager', undefined, { sessionId: id });
            throw new Error(`Session not found: ${id}`);
        }

        const previousStatus = session.status;
        const updated: Session = {
            ...session,
            status,
            completedAt: status === 'completed' ? getCurrentTimestamp() : session.completedAt,
        };
        this.sessions.set(id, updated);

        logger.info('Session status updated', 'SessionManager', {
            sessionId: id,
            previousStatus,
            newStatus: status,
            completedAt: updated.completedAt,
        });
    }

    async addResult(sessionId: string, result: ChallengeResult): Promise<void> {
        logger.info('Adding result to session', 'SessionManager', {
            sessionId,
            challengeId: result.challengeId,
            score: result.score,
            maxScore: result.maxScore,
            passed: result.passed,
        });

        const session = this.sessions.get(sessionId);
        if (!session) {
            logger.error('Cannot add result - session not found', 'SessionManager', undefined, { sessionId });
            throw new Error(`Session not found: ${sessionId}`);
        }

        const updated: Session = {
            ...session,
            results: [...session.results, result],
        };
        this.sessions.set(sessionId, updated);

        logger.debug('Result added', 'SessionManager', {
            sessionId,
            challengeId: result.challengeId,
            totalResults: updated.results.length,
            totalChallenges: session.challengeIds.length,
        });
    }

    async advanceChallenge(sessionId: string): Promise<void> {
        logger.debug('Advancing challenge index', 'SessionManager', { sessionId });

        const session = this.sessions.get(sessionId);
        if (!session) {
            logger.error('Cannot advance - session not found', 'SessionManager', undefined, { sessionId });
            throw new Error(`Session not found: ${sessionId}`);
        }

        const previousIndex = session.currentChallengeIndex;
        const updated: Session = {
            ...session,
            currentChallengeIndex: session.currentChallengeIndex + 1,
        };
        this.sessions.set(sessionId, updated);

        logger.info('Challenge advanced', 'SessionManager', {
            sessionId,
            previousIndex,
            newIndex: updated.currentChallengeIndex,
            totalChallenges: session.challengeIds.length,
            isComplete: updated.currentChallengeIndex >= session.challengeIds.length,
        });
    }

    async getAllSessionScores(): Promise<number[]> {
        logger.debug('Getting all session scores', 'SessionManager');

        const scores = Array.from(this.sessions.values())
            .filter((s) => s.status === 'completed')
            .map((s) => {
                const total = s.results.reduce((sum, r) => sum + r.score, 0);
                const max = s.results.reduce((sum, r) => sum + r.maxScore, 0);
                return max > 0 ? (total / max) * 100 : 0;
            });

        logger.debug('Session scores retrieved', 'SessionManager', {
            completedSessionCount: scores.length,
            scores,
        });

        return scores;
    }

    async getCompletedSessions(timeframe: LeaderboardTimeframe): Promise<Session[]> {
        logger.debug('Getting completed sessions', 'SessionManager', { timeframe });

        const now = new Date();
        const cutoff = this.getTimeframeCutoff(timeframe, now);

        const sessions = Array.from(this.sessions.values())
            .filter((s) => s.status === 'completed')
            .filter((s) => !cutoff || new Date(s.completedAt ?? s.startedAt) >= cutoff);

        logger.debug('Completed sessions retrieved', 'SessionManager', {
            timeframe,
            cutoff: cutoff?.toISOString(),
            count: sessions.length,
        });

        return sessions;
    }

    private getTimeframeCutoff(timeframe: LeaderboardTimeframe, now: Date): Date | null {
        switch (timeframe) {
            case 'daily':
                return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case 'weekly':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case 'monthly':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            default:
                return null;
        }
    }
}
