/**
 * @fileoverview Comprehensive Benchmark Challenges Collection
 * @module @mcp/intellibench/data/challenges
 * @version 2.0.0
 *
 * This module exports all benchmark challenges organized by category.
 * Total: 50+ challenges across 8 categories aligned with international standards.
 */

import type { Challenge } from '../../shared/types/index.js';
import { ChallengeCategory } from '../../shared/types/index.js';

// Import challenges by category
import { codeGenerationChallenges } from './code-generation.js';
import { algorithmChallenges } from './algorithms.js';
import { bugDetectionChallenges } from './bug-detection.js';
import { securityChallenges } from './security.js';
import { refactoringChallenges } from './refactoring.js';
import { testGenerationChallenges } from './test-generation.js';
import { documentationChallenges } from './documentation.js';
import { architectureChallenges } from './architecture.js';

// ============================================================================
// Combined Challenges Export
// ============================================================================

/**
 * All challenges combined into a single array
 */
export const challenges: Challenge[] = [
    ...codeGenerationChallenges,
    ...algorithmChallenges,
    ...bugDetectionChallenges,
    ...securityChallenges,
    ...refactoringChallenges,
    ...testGenerationChallenges,
    ...documentationChallenges,
    ...architectureChallenges,
];

/**
 * Challenges organized by category
 */
export const challengesByCategory: Record<ChallengeCategory, Challenge[]> = {
    [ChallengeCategory.CODE_GENERATION]: codeGenerationChallenges,
    [ChallengeCategory.ALGORITHM_DESIGN]: algorithmChallenges,
    [ChallengeCategory.BUG_DETECTION]: bugDetectionChallenges,
    [ChallengeCategory.SECURITY]: securityChallenges,
    [ChallengeCategory.REFACTORING]: refactoringChallenges,
    [ChallengeCategory.TEST_GENERATION]: testGenerationChallenges,
    [ChallengeCategory.DOCUMENTATION]: documentationChallenges,
    [ChallengeCategory.ARCHITECTURE]: architectureChallenges,
};

/**
 * Challenge statistics
 */
export const challengeStats = {
    total: challenges.length,
    byCategory: {
        [ChallengeCategory.CODE_GENERATION]: codeGenerationChallenges.length,
        [ChallengeCategory.ALGORITHM_DESIGN]: algorithmChallenges.length,
        [ChallengeCategory.BUG_DETECTION]: bugDetectionChallenges.length,
        [ChallengeCategory.SECURITY]: securityChallenges.length,
        [ChallengeCategory.REFACTORING]: refactoringChallenges.length,
        [ChallengeCategory.TEST_GENERATION]: testGenerationChallenges.length,
        [ChallengeCategory.DOCUMENTATION]: documentationChallenges.length,
        [ChallengeCategory.ARCHITECTURE]: architectureChallenges.length,
    },
    byDifficulty: {
        easy: challenges.filter(c => c.difficultyTier === 1).length,
        medium: challenges.filter(c => c.difficultyTier === 2).length,
        hard: challenges.filter(c => c.difficultyTier === 3).length,
        expert: challenges.filter(c => c.difficultyTier === 4).length,
    },
};

// Re-export individual category arrays
export {
    codeGenerationChallenges,
    algorithmChallenges,
    bugDetectionChallenges,
    securityChallenges,
    refactoringChallenges,
    testGenerationChallenges,
    documentationChallenges,
    architectureChallenges,
};

export default challenges;
