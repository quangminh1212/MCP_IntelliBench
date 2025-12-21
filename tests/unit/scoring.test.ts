/**
 * @fileoverview Unit tests for ScoringEngine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScoringEngine } from '../../src/core/scoring/engine.js';
import type { Challenge, ProgrammingLanguage } from '../../src/shared/types/index.js';
import { ChallengeCategory, Difficulty } from '../../src/shared/types/index.js';

describe('ScoringEngine', () => {
    let engine: ScoringEngine;
    let mockChallenge: Challenge;

    beforeEach(() => {
        engine = new ScoringEngine();
        mockChallenge = {
            id: 'test_001',
            title: 'Test Challenge',
            description: 'Test description',
            category: ChallengeCategory.CODE_GENERATION,
            difficulty: 5,
            difficultyTier: Difficulty.MEDIUM,
            requirements: ['Requirement 1'],
            templates: [{
                language: 'typescript',
                template: 'function test() {}',
                signature: 'function test()',
            }],
            testCases: [
                { id: 'tc1', name: 'Test 1', input: null, expectedOutput: true, isHidden: false, points: 50 },
                { id: 'tc2', name: 'Test 2', input: null, expectedOutput: true, isHidden: false, points: 50 },
            ],
            maxScore: 100,
            timeLimit: 300,
            memoryLimit: 256,
            tags: ['test'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        };
    });

    describe('scoreSolution', () => {
        it('should return a valid scoring result', async () => {
            const result = await engine.scoreSolution({
                challenge: mockChallenge,
                solution: `function test() {
          const result = calculate();
          if (result) {
            return result;
          }
          return null;
        }`,
                language: 'typescript' as ProgrammingLanguage,
                timeTaken: 60,
            });

            expect(result).toBeDefined();
            expect(result.totalScore).toBeGreaterThanOrEqual(0);
            expect(result.totalScore).toBeLessThanOrEqual(result.maxScore);
            expect(result.breakdown).toBeDefined();
            expect(result.feedback).toBeDefined();
            expect(result.suggestions).toBeInstanceOf(Array);
        });

        it('should give higher scores for better solutions', async () => {
            const goodSolution = `
        function solve(input: string[]): number[] {
          // Parse input and validate
          if (!input || input.length === 0) {
            return [];
          }
          
          // Use efficient Map for O(n) lookup
          const frequencyMap = new Map<string, number>();
          
          for (const item of input) {
            frequencyMap.set(item, (frequencyMap.get(item) ?? 0) + 1);
          }
          
          // Return sorted results
          return Array.from(frequencyMap.values()).filter(v => v > 1);
        }
      `;

            const badSolution = 'x';

            const goodResult = await engine.scoreSolution({
                challenge: mockChallenge,
                solution: goodSolution,
                language: 'typescript' as ProgrammingLanguage,
                timeTaken: 60,
            });

            const badResult = await engine.scoreSolution({
                challenge: mockChallenge,
                solution: badSolution,
                language: 'typescript' as ProgrammingLanguage,
                timeTaken: 60,
            });

            expect(goodResult.totalScore).toBeGreaterThan(badResult.totalScore);
        });

        it('should include breakdown scores between 0 and 100', async () => {
            const result = await engine.scoreSolution({
                challenge: mockChallenge,
                solution: 'function test() { return true; }',
                language: 'typescript' as ProgrammingLanguage,
                timeTaken: 60,
            });

            expect(result.breakdown.correctness).toBeGreaterThanOrEqual(0);
            expect(result.breakdown.correctness).toBeLessThanOrEqual(100);
            expect(result.breakdown.efficiency).toBeGreaterThanOrEqual(0);
            expect(result.breakdown.efficiency).toBeLessThanOrEqual(100);
            expect(result.breakdown.codeQuality).toBeGreaterThanOrEqual(0);
            expect(result.breakdown.codeQuality).toBeLessThanOrEqual(100);
        });
    });
});
