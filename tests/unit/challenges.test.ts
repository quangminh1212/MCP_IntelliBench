/**
 * @fileoverview Unit Tests for Challenges Collection
 * @module @mcp/intellibench/tests/unit/challenges
 */

import { describe, it, expect } from 'vitest';
import {
    challenges,
    challengesByCategory,
    challengeStats,
    codeGenerationChallenges,
    algorithmChallenges,
    bugDetectionChallenges,
    securityChallenges,
    refactoringChallenges,
    testGenerationChallenges,
    documentationChallenges,
    architectureChallenges,
} from '../../src/data/challenges/index.js';
import { ChallengeCategory } from '../../src/shared/types/index.js';

describe('Challenges Collection', () => {
    describe('Total Challenges', () => {
        it('should have at least 50 challenges total', () => {
            expect(challenges.length).toBeGreaterThanOrEqual(50);
        });

        it('should have correct total in stats', () => {
            expect(challengeStats.total).toBe(challenges.length);
        });
    });

    describe('Categories', () => {
        it('should have 8 categories', () => {
            const categories = Object.keys(challengesByCategory);
            expect(categories.length).toBe(8);
        });

        it('should include all required categories', () => {
            const requiredCategories = [
                ChallengeCategory.CODE_GENERATION,
                ChallengeCategory.ALGORITHM_DESIGN,
                ChallengeCategory.BUG_DETECTION,
                ChallengeCategory.SECURITY,
                ChallengeCategory.REFACTORING,
                ChallengeCategory.TEST_GENERATION,
                ChallengeCategory.DOCUMENTATION,
                ChallengeCategory.ARCHITECTURE,
            ];

            for (const category of requiredCategories) {
                expect(challengesByCategory).toHaveProperty(category);
            }
        });

        it('should have challenges in each category', () => {
            for (const [category, categoryChallenges] of Object.entries(challengesByCategory)) {
                expect(categoryChallenges.length).toBeGreaterThan(0);
            }
        });
    });

    describe('Challenge Structure', () => {
        it('should have unique IDs for all challenges', () => {
            const ids = challenges.map((c) => c.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have valid difficulty ratings (1-10)', () => {
            for (const challenge of challenges) {
                expect(challenge.difficulty).toBeGreaterThanOrEqual(1);
                expect(challenge.difficulty).toBeLessThanOrEqual(10);
            }
        });

        it('should have non-empty titles', () => {
            for (const challenge of challenges) {
                expect(challenge.title.length).toBeGreaterThan(0);
            }
        });

        it('should have non-empty descriptions', () => {
            for (const challenge of challenges) {
                expect(challenge.description.length).toBeGreaterThan(0);
            }
        });

        it('should have at least one template', () => {
            for (const challenge of challenges) {
                expect(challenge.templates.length).toBeGreaterThanOrEqual(1);
            }
        });

        it('should have at least one test case', () => {
            for (const challenge of challenges) {
                expect(challenge.testCases.length).toBeGreaterThanOrEqual(1);
            }
        });

        it('should have positive maxScore', () => {
            for (const challenge of challenges) {
                expect(challenge.maxScore).toBeGreaterThan(0);
            }
        });

        it('should have valid timeLimit', () => {
            for (const challenge of challenges) {
                expect(challenge.timeLimit).toBeGreaterThan(0);
            }
        });
    });

    describe('Code Generation Challenges', () => {
        it('should have at least 5 challenges', () => {
            expect(codeGenerationChallenges.length).toBeGreaterThanOrEqual(5);
        });

        it('should all be in CODE_GENERATION category', () => {
            for (const challenge of codeGenerationChallenges) {
                expect(challenge.category).toBe(ChallengeCategory.CODE_GENERATION);
            }
        });
    });

    describe('Algorithm Challenges', () => {
        it('should have at least 5 challenges', () => {
            expect(algorithmChallenges.length).toBeGreaterThanOrEqual(5);
        });

        it('should all be in ALGORITHM_DESIGN category', () => {
            for (const challenge of algorithmChallenges) {
                expect(challenge.category).toBe(ChallengeCategory.ALGORITHM_DESIGN);
            }
        });
    });

    describe('Bug Detection Challenges', () => {
        it('should have at least 5 challenges', () => {
            expect(bugDetectionChallenges.length).toBeGreaterThanOrEqual(5);
        });

        it('should all be in BUG_DETECTION category', () => {
            for (const challenge of bugDetectionChallenges) {
                expect(challenge.category).toBe(ChallengeCategory.BUG_DETECTION);
            }
        });
    });

    describe('Security Challenges', () => {
        it('should have at least 5 challenges', () => {
            expect(securityChallenges.length).toBeGreaterThanOrEqual(5);
        });

        it('should all be in SECURITY category', () => {
            for (const challenge of securityChallenges) {
                expect(challenge.category).toBe(ChallengeCategory.SECURITY);
            }
        });
    });

    describe('Refactoring Challenges', () => {
        it('should have at least 5 challenges', () => {
            expect(refactoringChallenges.length).toBeGreaterThanOrEqual(5);
        });

        it('should all be in REFACTORING category', () => {
            for (const challenge of refactoringChallenges) {
                expect(challenge.category).toBe(ChallengeCategory.REFACTORING);
            }
        });
    });

    describe('Test Generation Challenges', () => {
        it('should have at least 5 challenges', () => {
            expect(testGenerationChallenges.length).toBeGreaterThanOrEqual(5);
        });

        it('should all be in TEST_GENERATION category', () => {
            for (const challenge of testGenerationChallenges) {
                expect(challenge.category).toBe(ChallengeCategory.TEST_GENERATION);
            }
        });
    });

    describe('Documentation Challenges', () => {
        it('should have at least 5 challenges', () => {
            expect(documentationChallenges.length).toBeGreaterThanOrEqual(5);
        });

        it('should all be in DOCUMENTATION category', () => {
            for (const challenge of documentationChallenges) {
                expect(challenge.category).toBe(ChallengeCategory.DOCUMENTATION);
            }
        });
    });

    describe('Architecture Challenges', () => {
        it('should have at least 5 challenges', () => {
            expect(architectureChallenges.length).toBeGreaterThanOrEqual(5);
        });

        it('should all be in ARCHITECTURE category', () => {
            for (const challenge of architectureChallenges) {
                expect(challenge.category).toBe(ChallengeCategory.ARCHITECTURE);
            }
        });
    });

    describe('Test Cases', () => {
        it('should have unique test case IDs within each challenge', () => {
            for (const challenge of challenges) {
                const testIds = challenge.testCases.map((tc) => tc.id);
                const uniqueIds = new Set(testIds);
                expect(uniqueIds.size).toBe(testIds.length);
            }
        });

        it('should have positive points for each test case', () => {
            for (const challenge of challenges) {
                for (const testCase of challenge.testCases) {
                    expect(testCase.points).toBeGreaterThan(0);
                }
            }
        });

        it('should have sum of test case points equal or close to maxScore', () => {
            for (const challenge of challenges) {
                const totalPoints = challenge.testCases.reduce((sum, tc) => sum + tc.points, 0);
                // Allow some tolerance for bonus points
                expect(totalPoints).toBeGreaterThanOrEqual(challenge.maxScore * 0.8);
                expect(totalPoints).toBeLessThanOrEqual(challenge.maxScore * 1.2);
            }
        });
    });

    describe('Difficulty Distribution', () => {
        it('should have challenges across different difficulty levels', () => {
            const easy = challenges.filter((c) => c.difficulty <= 3);
            const medium = challenges.filter((c) => c.difficulty > 3 && c.difficulty <= 6);
            const hard = challenges.filter((c) => c.difficulty > 6);

            expect(easy.length).toBeGreaterThan(0);
            expect(medium.length).toBeGreaterThan(0);
            expect(hard.length).toBeGreaterThan(0);
        });
    });
});
