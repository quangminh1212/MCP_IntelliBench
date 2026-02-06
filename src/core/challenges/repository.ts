/**
 * @fileoverview Challenge Repository - Manages benchmark challenges
 * @module @mcp/intellibench/core/challenges
 * @version 1.0.0
 */

import type { Challenge, ChallengeSummary, ChallengeCategory, Difficulty } from '../../shared/types/index.js';
import { challenges as challengeData } from '../../data/challenges/index.js';
import { logger } from '../../shared/utils/logger.js';

export interface ChallengeFilter {
    category?: ChallengeCategory;
    difficulty?: Difficulty | 'all';
    tags?: string[];
    limit?: number;
}

export class ChallengeRepository {
    private challenges: Map<string, Challenge> = new Map();

    async initialize(): Promise<void> {
        logger.info('Initializing challenge repository', 'ChallengeRepository');
        logger.debug('Loading challenges from data module', 'ChallengeRepository', {
            challengeDataCount: challengeData.length,
        });

        for (const challenge of challengeData) {
            this.challenges.set(challenge.id, challenge);
            logger.debug('Challenge loaded', 'ChallengeRepository', {
                id: challenge.id,
                title: challenge.title,
                category: challenge.category,
                difficulty: challenge.difficulty,
            });
        }

        logger.info('Challenge repository initialized', 'ChallengeRepository', {
            totalChallenges: this.challenges.size,
            categories: [...new Set(challengeData.map(c => c.category))],
        });
    }

    getChallengeCount(): number {
        const count = this.challenges.size;
        logger.debug('Getting challenge count', 'ChallengeRepository', { count });
        return count;
    }

    async getChallenge(id: string): Promise<Challenge | null> {
        logger.debug('Getting challenge by ID', 'ChallengeRepository', { challengeId: id });

        const challenge = this.challenges.get(id) ?? null;

        if (challenge) {
            logger.debug('Challenge found', 'ChallengeRepository', {
                challengeId: id,
                title: challenge.title,
                category: challenge.category,
                difficulty: challenge.difficulty,
                maxScore: challenge.maxScore,
            });
        } else {
            logger.warn('Challenge not found', 'ChallengeRepository', {
                challengeId: id,
                availableIds: Array.from(this.challenges.keys()).slice(0, 10),
            });
        }

        return challenge;
    }

    async listChallenges(filter: ChallengeFilter): Promise<ChallengeSummary[]> {
        logger.info('Listing challenges with filter', 'ChallengeRepository', { filter });

        let result = Array.from(this.challenges.values());
        const initialCount = result.length;

        if (filter.category) {
            result = result.filter((c) => c.category === filter.category);
            logger.debug('Filtered by category', 'ChallengeRepository', {
                category: filter.category,
                beforeCount: initialCount,
                afterCount: result.length,
            });
        }

        if (filter.difficulty && filter.difficulty !== 'all') {
            const beforeDifficultyCount = result.length;
            result = result.filter((c) => c.difficultyTier === filter.difficulty);
            logger.debug('Filtered by difficulty', 'ChallengeRepository', {
                difficulty: filter.difficulty,
                beforeCount: beforeDifficultyCount,
                afterCount: result.length,
            });
        }

        if (filter.tags?.length) {
            const beforeTagsCount = result.length;
            result = result.filter((c) => filter.tags!.some((t) => c.tags.includes(t)));
            logger.debug('Filtered by tags', 'ChallengeRepository', {
                tags: filter.tags,
                beforeCount: beforeTagsCount,
                afterCount: result.length,
            });
        }

        if (filter.limit) {
            const beforeLimitCount = result.length;
            result = result.slice(0, filter.limit);
            logger.debug('Applied limit', 'ChallengeRepository', {
                limit: filter.limit,
                beforeCount: beforeLimitCount,
                afterCount: result.length,
            });
        }

        const summaries = result.map((c) => ({
            id: c.id,
            title: c.title,
            category: c.category,
            difficulty: c.difficulty,
            difficultyTier: c.difficultyTier,
            maxScore: c.maxScore,
            tags: c.tags,
        }));

        logger.info('Challenges listed', 'ChallengeRepository', {
            filter,
            totalAvailable: this.challenges.size,
            matchingCount: summaries.length,
            challengeIds: summaries.map(c => c.id),
        });

        return summaries;
    }

    async getChallengesByCategory(category: ChallengeCategory): Promise<Challenge[]> {
        logger.debug('Getting challenges by category', 'ChallengeRepository', { category });

        const challenges = Array.from(this.challenges.values()).filter((c) => c.category === category);

        logger.debug('Challenges retrieved by category', 'ChallengeRepository', {
            category,
            count: challenges.length,
        });

        return challenges;
    }

    async getRandomChallenges(count: number, filter?: ChallengeFilter): Promise<Challenge[]> {
        logger.info('Getting random challenges', 'ChallengeRepository', { count, filter });

        const all = await this.listChallenges(filter ?? {});
        const shuffled = all.sort(() => Math.random() - 0.5);
        const ids = shuffled.slice(0, count).map((c) => c.id);

        logger.debug('Random challenge IDs selected', 'ChallengeRepository', {
            requestedCount: count,
            availableCount: all.length,
            selectedIds: ids,
        });

        const challenges = await Promise.all(ids.map((id) => this.getChallenge(id))).then((r) => r.filter(Boolean) as Challenge[]);

        logger.info('Random challenges retrieved', 'ChallengeRepository', {
            requestedCount: count,
            returnedCount: challenges.length,
        });

        return challenges;
    }
}
