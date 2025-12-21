/**
 * @fileoverview Challenge Repository - Manages benchmark challenges
 * @module @mcp/intellibench/core/challenges
 * @version 1.0.0
 */

import type { Challenge, ChallengeSummary, ChallengeCategory, Difficulty } from '../../shared/types/index.js';
import { challenges as challengeData } from '../../data/challenges/index.js';

export interface ChallengeFilter {
    category?: ChallengeCategory;
    difficulty?: Difficulty | 'all';
    tags?: string[];
    limit?: number;
}

export class ChallengeRepository {
    private challenges: Map<string, Challenge> = new Map();

    async initialize(): Promise<void> {
        for (const challenge of challengeData) {
            this.challenges.set(challenge.id, challenge);
        }
    }

    getChallengeCount(): number {
        return this.challenges.size;
    }

    async getChallenge(id: string): Promise<Challenge | null> {
        return this.challenges.get(id) ?? null;
    }

    async listChallenges(filter: ChallengeFilter): Promise<ChallengeSummary[]> {
        let result = Array.from(this.challenges.values());

        if (filter.category) {
            result = result.filter((c) => c.category === filter.category);
        }

        if (filter.difficulty && filter.difficulty !== 'all') {
            result = result.filter((c) => c.difficultyTier === filter.difficulty);
        }

        if (filter.tags?.length) {
            result = result.filter((c) => filter.tags!.some((t) => c.tags.includes(t)));
        }

        if (filter.limit) {
            result = result.slice(0, filter.limit);
        }

        return result.map((c) => ({
            id: c.id,
            title: c.title,
            category: c.category,
            difficulty: c.difficulty,
            difficultyTier: c.difficultyTier,
            maxScore: c.maxScore,
            tags: c.tags,
        }));
    }

    async getChallengesByCategory(category: ChallengeCategory): Promise<Challenge[]> {
        return Array.from(this.challenges.values()).filter((c) => c.category === category);
    }

    async getRandomChallenges(count: number, filter?: ChallengeFilter): Promise<Challenge[]> {
        const all = await this.listChallenges(filter ?? {});
        const shuffled = all.sort(() => Math.random() - 0.5);
        const ids = shuffled.slice(0, count).map((c) => c.id);
        return Promise.all(ids.map((id) => this.getChallenge(id))).then((r) => r.filter(Boolean) as Challenge[]);
    }
}
