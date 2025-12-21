/**
 * @fileoverview Session Manager - Manages benchmark sessions
 * @module @mcp/intellibench/core/sessions
 * @version 1.0.0
 */

import type { Session, SessionStatus, ChallengeResult, LeaderboardTimeframe } from '../../shared/types/index.js';
import { getCurrentTimestamp } from '../../shared/utils/index.js';

export class SessionManager {
    private sessions: Map<string, Session> = new Map();

    async saveSession(session: Session): Promise<void> {
        this.sessions.set(session.id, session);
    }

    async getSession(id: string): Promise<Session | null> {
        return this.sessions.get(id) ?? null;
    }

    async updateSessionStatus(id: string, status: SessionStatus): Promise<void> {
        const session = this.sessions.get(id);
        if (!session) throw new Error(`Session not found: ${id}`);

        const updated: Session = {
            ...session,
            status,
            completedAt: status === 'completed' ? getCurrentTimestamp() : session.completedAt,
        };
        this.sessions.set(id, updated);
    }

    async addResult(sessionId: string, result: ChallengeResult): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error(`Session not found: ${sessionId}`);

        const updated: Session = {
            ...session,
            results: [...session.results, result],
        };
        this.sessions.set(sessionId, updated);
    }

    async advanceChallenge(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error(`Session not found: ${sessionId}`);

        const updated: Session = {
            ...session,
            currentChallengeIndex: session.currentChallengeIndex + 1,
        };
        this.sessions.set(sessionId, updated);
    }

    async getAllSessionScores(): Promise<number[]> {
        return Array.from(this.sessions.values())
            .filter((s) => s.status === 'completed')
            .map((s) => {
                const total = s.results.reduce((sum, r) => sum + r.score, 0);
                const max = s.results.reduce((sum, r) => sum + r.maxScore, 0);
                return max > 0 ? (total / max) * 100 : 0;
            });
    }

    async getCompletedSessions(timeframe: LeaderboardTimeframe): Promise<Session[]> {
        const now = new Date();
        const cutoff = this.getTimeframeCutoff(timeframe, now);

        return Array.from(this.sessions.values())
            .filter((s) => s.status === 'completed')
            .filter((s) => !cutoff || new Date(s.completedAt ?? s.startedAt) >= cutoff);
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
