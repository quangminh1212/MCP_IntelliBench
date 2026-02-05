/**
 * @fileoverview International AI Assessment Standards
 * @module @mcp/intellibench/standards
 * @version 1.0.0
 *
 * This module implements evaluation frameworks aligned with international standards:
 * - IEEE P2894: Guide for AI Bias Considerations
 * - ISO/IEC 25010: Software Quality Model
 * - ISO/IEC 25023: Measurement of Software Quality
 * - HumanEval Benchmark (OpenAI)
 * - MBPP (Mostly Basic Programming Problems)
 * - APPS (Automated Programming Progress Standard)
 * - CodeXGLUE Benchmark (Microsoft)
 * - SWE-bench (Software Engineering Benchmark)
 */

// ============================================================================
// International Standards Definitions
// ============================================================================

/**
 * ISO/IEC 25010 Software Quality Characteristics
 * @see https://iso25000.com/index.php/en/iso-25000-standards/iso-25010
 */
export enum ISO25010Characteristic {
    FUNCTIONAL_SUITABILITY = 'functional_suitability',
    PERFORMANCE_EFFICIENCY = 'performance_efficiency',
    COMPATIBILITY = 'compatibility',
    USABILITY = 'usability',
    RELIABILITY = 'reliability',
    SECURITY = 'security',
    MAINTAINABILITY = 'maintainability',
    PORTABILITY = 'portability',
}

/**
 * ISO/IEC 25010 Sub-characteristics
 */
export const ISO25010SubCharacteristics: Record<ISO25010Characteristic, string[]> = {
    [ISO25010Characteristic.FUNCTIONAL_SUITABILITY]: [
        'functional_completeness',
        'functional_correctness',
        'functional_appropriateness',
    ],
    [ISO25010Characteristic.PERFORMANCE_EFFICIENCY]: [
        'time_behaviour',
        'resource_utilization',
        'capacity',
    ],
    [ISO25010Characteristic.COMPATIBILITY]: [
        'co_existence',
        'interoperability',
    ],
    [ISO25010Characteristic.USABILITY]: [
        'appropriateness_recognizability',
        'learnability',
        'operability',
        'user_error_protection',
        'user_interface_aesthetics',
        'accessibility',
    ],
    [ISO25010Characteristic.RELIABILITY]: [
        'maturity',
        'availability',
        'fault_tolerance',
        'recoverability',
    ],
    [ISO25010Characteristic.SECURITY]: [
        'confidentiality',
        'integrity',
        'non_repudiation',
        'accountability',
        'authenticity',
    ],
    [ISO25010Characteristic.MAINTAINABILITY]: [
        'modularity',
        'reusability',
        'analysability',
        'modifiability',
        'testability',
    ],
    [ISO25010Characteristic.PORTABILITY]: [
        'adaptability',
        'installability',
        'replaceability',
    ],
};

/**
 * HumanEval-style evaluation metrics
 * @see https://github.com/openai/human-eval
 */
export interface HumanEvalMetrics {
    /** Pass@k: probability of passing with k samples */
    passAtK: Record<number, number>;
    /** Total problems attempted */
    totalProblems: number;
    /** Problems solved correctly */
    solvedProblems: number;
    /** Average attempts per problem */
    avgAttempts: number;
    /** First-attempt success rate */
    firstAttemptRate: number;
}

/**
 * MBPP (Mostly Basic Programming Problems) metrics
 * @see https://github.com/google-research/google-research/tree/master/mbpp
 */
export interface MBPPMetrics {
    /** Accuracy on sanitized subset */
    sanitizedAccuracy: number;
    /** Accuracy on full dataset */
    fullAccuracy: number;
    /** Code execution success rate */
    executionRate: number;
    /** Average test case pass rate */
    testPassRate: number;
}

/**
 * APPS Benchmark levels
 * @see https://github.com/hendrycks/apps
 */
export enum APPSDifficulty {
    INTRODUCTORY = 'introductory',
    INTERVIEW = 'interview',
    COMPETITION = 'competition',
}

/**
 * APPS Benchmark metrics
 */
export interface APPSMetrics {
    /** Score by difficulty level */
    scoreByLevel: Record<APPSDifficulty, number>;
    /** Strict accuracy (all tests pass) */
    strictAccuracy: number;
    /** Relaxed accuracy (majority tests pass) */
    relaxedAccuracy: number;
    /** Average test cases passed */
    avgTestsPassed: number;
}

/**
 * CodeXGLUE Benchmark tasks
 * @see https://github.com/microsoft/CodeXGLUE
 */
export enum CodeXGLUETask {
    CODE_CLONE_DETECTION = 'clone_detection',
    DEFECT_DETECTION = 'defect_detection',
    CODE_REPAIR = 'code_repair',
    CODE_TRANSLATION = 'code_translation',
    CODE_SUMMARIZATION = 'code_summarization',
    CODE_GENERATION = 'code_generation',
    CODE_COMPLETION = 'code_completion',
    TEXT_TO_CODE = 'text_to_code',
    CODE_TO_TEXT = 'code_to_text',
    DOCUMENTATION_TRANSLATION = 'doc_translation',
}

/**
 * SWE-bench evaluation metrics
 * @see https://www.swebench.com/
 */
export interface SWEBenchMetrics {
    /** Percentage of issues resolved */
    resolvedRate: number;
    /** Average patch quality score */
    patchQuality: number;
    /** Test suite pass rate */
    testSuitePass: number;
    /** Code diff accuracy */
    diffAccuracy: number;
}

// ============================================================================
// Cognitive Ability Assessment (Based on Psychological Standards)
// ============================================================================

/**
 * Cognitive dimensions assessed (aligned with CHC theory)
 * Cattell-Horn-Carroll theory of cognitive abilities
 */
export enum CognitiveAbility {
    /** Fluid reasoning - novel problem solving */
    FLUID_REASONING = 'fluid_reasoning',
    /** Crystallized knowledge - acquired knowledge */
    CRYSTALLIZED_KNOWLEDGE = 'crystallized_knowledge',
    /** Visual-spatial processing */
    VISUAL_SPATIAL = 'visual_spatial',
    /** Processing speed */
    PROCESSING_SPEED = 'processing_speed',
    /** Working memory */
    WORKING_MEMORY = 'working_memory',
    /** Long-term retrieval */
    LONG_TERM_RETRIEVAL = 'long_term_retrieval',
    /** Quantitative reasoning */
    QUANTITATIVE_REASONING = 'quantitative_reasoning',
    /** Reading/Writing ability */
    READING_WRITING = 'reading_writing',
}

/**
 * Mapping of challenge categories to cognitive abilities
 */
export const CategoryToCognitiveMapping: Record<string, CognitiveAbility[]> = {
    code_generation: [
        CognitiveAbility.CRYSTALLIZED_KNOWLEDGE,
        CognitiveAbility.WORKING_MEMORY,
        CognitiveAbility.READING_WRITING,
    ],
    bug_detection: [
        CognitiveAbility.FLUID_REASONING,
        CognitiveAbility.VISUAL_SPATIAL,
        CognitiveAbility.WORKING_MEMORY,
    ],
    refactoring: [
        CognitiveAbility.CRYSTALLIZED_KNOWLEDGE,
        CognitiveAbility.VISUAL_SPATIAL,
        CognitiveAbility.LONG_TERM_RETRIEVAL,
    ],
    algorithm_design: [
        CognitiveAbility.FLUID_REASONING,
        CognitiveAbility.QUANTITATIVE_REASONING,
        CognitiveAbility.WORKING_MEMORY,
    ],
    test_generation: [
        CognitiveAbility.FLUID_REASONING,
        CognitiveAbility.CRYSTALLIZED_KNOWLEDGE,
        CognitiveAbility.QUANTITATIVE_REASONING,
    ],
    documentation: [
        CognitiveAbility.READING_WRITING,
        CognitiveAbility.CRYSTALLIZED_KNOWLEDGE,
        CognitiveAbility.LONG_TERM_RETRIEVAL,
    ],
    architecture: [
        CognitiveAbility.VISUAL_SPATIAL,
        CognitiveAbility.FLUID_REASONING,
        CognitiveAbility.LONG_TERM_RETRIEVAL,
    ],
    security: [
        CognitiveAbility.FLUID_REASONING,
        CognitiveAbility.CRYSTALLIZED_KNOWLEDGE,
        CognitiveAbility.WORKING_MEMORY,
    ],
};

// ============================================================================
// Comprehensive Assessment Framework
// ============================================================================

/**
 * Complete AI coding intelligence assessment result
 */
export interface ComprehensiveAssessment {
    /** Session identifier */
    sessionId: string;
    /** AI model being assessed */
    aiModel: string;
    /** Assessment timestamp */
    timestamp: string;

    // Standard benchmark scores
    /** HumanEval-style metrics */
    humanEval: HumanEvalMetrics;
    /** MBPP metrics */
    mbpp: MBPPMetrics;
    /** APPS metrics */
    apps: APPSMetrics;
    /** SWE-bench metrics */
    sweBench: SWEBenchMetrics;

    // ISO/IEC 25010 quality scores
    /** Software quality characteristics scores (0-100) */
    iso25010Scores: Record<ISO25010Characteristic, number>;

    // Cognitive assessment
    /** Cognitive ability scores (0-100) */
    cognitiveScores: Record<CognitiveAbility, number>;

    // Overall metrics
    /** Composite Intelligence Quotient (normalized to 100 mean, 15 SD) */
    compositeIQ: number;
    /** Percentile rank among all assessed models */
    percentileRank: number;
    /** Overall classification */
    classification: IntelligenceClassification;

    // Detailed breakdown
    /** Strengths identified */
    strengths: string[];
    /** Areas for improvement */
    weaknesses: string[];
    /** Specific recommendations */
    recommendations: string[];
}

/**
 * Intelligence classification levels
 */
export enum IntelligenceClassification {
    EXCEPTIONAL = 'exceptional',      // IQ >= 130, top 2%
    SUPERIOR = 'superior',            // IQ 120-129, top 10%
    HIGH_AVERAGE = 'high_average',    // IQ 110-119, top 25%
    AVERAGE = 'average',              // IQ 90-109, middle 50%
    LOW_AVERAGE = 'low_average',      // IQ 80-89, bottom 25%
    BELOW_AVERAGE = 'below_average',  // IQ 70-79, bottom 10%
    SIGNIFICANTLY_BELOW = 'significantly_below', // IQ < 70, bottom 2%
}

/**
 * Get classification from IQ score
 */
export function getClassification(iq: number): IntelligenceClassification {
    if (iq >= 130) return IntelligenceClassification.EXCEPTIONAL;
    if (iq >= 120) return IntelligenceClassification.SUPERIOR;
    if (iq >= 110) return IntelligenceClassification.HIGH_AVERAGE;
    if (iq >= 90) return IntelligenceClassification.AVERAGE;
    if (iq >= 80) return IntelligenceClassification.LOW_AVERAGE;
    if (iq >= 70) return IntelligenceClassification.BELOW_AVERAGE;
    return IntelligenceClassification.SIGNIFICANTLY_BELOW;
}

/**
 * Classification display names
 */
export const ClassificationLabels: Record<IntelligenceClassification, string> = {
    [IntelligenceClassification.EXCEPTIONAL]: 'Exceptional (Top 2%)',
    [IntelligenceClassification.SUPERIOR]: 'Superior (Top 10%)',
    [IntelligenceClassification.HIGH_AVERAGE]: 'High Average (Top 25%)',
    [IntelligenceClassification.AVERAGE]: 'Average (Middle 50%)',
    [IntelligenceClassification.LOW_AVERAGE]: 'Low Average (Bottom 25%)',
    [IntelligenceClassification.BELOW_AVERAGE]: 'Below Average (Bottom 10%)',
    [IntelligenceClassification.SIGNIFICANTLY_BELOW]: 'Significantly Below (Bottom 2%)',
};

// ============================================================================
// Benchmark Weights and Normalization
// ============================================================================

/**
 * Weights for composite score calculation
 */
export const BENCHMARK_WEIGHTS = {
    humanEval: 0.25,      // 25% - Core coding ability
    mbpp: 0.15,           // 15% - Basic programming
    apps: 0.20,           // 20% - Complex problem solving
    sweBench: 0.15,       // 15% - Real-world engineering
    iso25010: 0.15,       // 15% - Code quality
    cognitive: 0.10,      // 10% - Cognitive abilities
} as const;

/**
 * Normalization parameters for IQ calculation
 * Based on standard IQ scale (mean=100, SD=15)
 */
export const IQ_NORMALIZATION = {
    mean: 100,
    standardDeviation: 15,
    minScore: 40,   // Theoretical minimum
    maxScore: 160,  // Theoretical maximum
} as const;

/**
 * Convert raw score (0-100) to IQ scale
 */
export function rawScoreToIQ(rawScore: number): number {
    // Assuming raw score 50 = IQ 100 (average)
    // Each 10 points = 1 standard deviation (15 IQ points)
    const zScore = (rawScore - 50) / 10;
    const iq = IQ_NORMALIZATION.mean + (zScore * IQ_NORMALIZATION.standardDeviation);
    return Math.max(IQ_NORMALIZATION.minScore, Math.min(IQ_NORMALIZATION.maxScore, Math.round(iq)));
}

/**
 * Calculate percentile from IQ score
 */
export function iqToPercentile(iq: number): number {
    const zScore = (iq - IQ_NORMALIZATION.mean) / IQ_NORMALIZATION.standardDeviation;
    // Standard normal CDF approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
    const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return Math.round((zScore > 0 ? 1 - p : p) * 100 * 10) / 10;
}

// ============================================================================
// Industry Standard Metrics
// ============================================================================

/**
 * Code complexity metrics (aligned with industry standards)
 */
export interface CodeComplexityMetrics {
    /** Cyclomatic Complexity (McCabe) */
    cyclomaticComplexity: number;
    /** Halstead Metrics */
    halstead: {
        vocabulary: number;
        length: number;
        volume: number;
        difficulty: number;
        effort: number;
    };
    /** Lines of Code metrics */
    loc: {
        total: number;
        source: number;
        comments: number;
        blank: number;
    };
    /** Maintainability Index (0-100) */
    maintainabilityIndex: number;
    /** Cognitive Complexity (SonarQube) */
    cognitiveComplexity: number;
}

/**
 * Code coverage metrics
 */
export interface CoverageMetrics {
    /** Line coverage percentage */
    lineCoverage: number;
    /** Branch coverage percentage */
    branchCoverage: number;
    /** Function coverage percentage */
    functionCoverage: number;
    /** Statement coverage percentage */
    statementCoverage: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    /** Execution time in milliseconds */
    executionTime: number;
    /** Memory usage in bytes */
    memoryUsage: number;
    /** CPU usage percentage */
    cpuUsage: number;
    /** Time complexity class */
    timeComplexity: string;
    /** Space complexity class */
    spaceComplexity: string;
}

// ============================================================================
// Export all standards
// ============================================================================

export const STANDARDS_VERSION = '1.0.0';
export const STANDARDS_LAST_UPDATED = '2024-01-01';

export const SUPPORTED_STANDARDS = [
    'ISO/IEC 25010:2011',
    'ISO/IEC 25023:2016',
    'IEEE P2894',
    'HumanEval',
    'MBPP',
    'APPS',
    'CodeXGLUE',
    'SWE-bench',
] as const;
