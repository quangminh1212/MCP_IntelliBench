/**
 * @fileoverview MCP Prompts Definitions and Handlers
 * @module @mcp/intellibench/server/prompts
 * @version 1.0.0
 */

import { MCP_PROMPTS } from '../../shared/constants/index.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Prompt result
 */
export interface PromptResult {
    description?: string;
    messages: Array<{
        role: 'user' | 'assistant';
        content: {
            type: 'text';
            text: string;
        };
    }>;
}

// ============================================================================
// Prompt Definitions
// ============================================================================

/**
 * MCP Prompt definitions
 */
export const promptDefinitions = [
    {
        name: MCP_PROMPTS.INTRODUCTION,
        description: 'Get a comprehensive introduction to the MCP IntelliBench system',
        arguments: [],
    },
    {
        name: MCP_PROMPTS.CHALLENGE_TIPS,
        description: 'Get tips for approaching benchmark challenges effectively',
        arguments: [
            {
                name: 'category',
                description: 'Optional specific category to get tips for',
                required: false,
            },
        ],
    },
    {
        name: MCP_PROMPTS.SCORE_INTERPRETATION,
        description: 'Guide to understanding and interpreting benchmark scores',
        arguments: [],
    },
];

// ============================================================================
// Prompt Handlers
// ============================================================================

/**
 * Handle prompt requests from MCP clients
 */
export async function handlePromptGet(
    name: string,
    args: Record<string, unknown>
): Promise<PromptResult> {
    switch (name) {
        case MCP_PROMPTS.INTRODUCTION:
            return getIntroductionPrompt();

        case MCP_PROMPTS.CHALLENGE_TIPS:
            return getChallengeTipsPrompt(args['category'] as string | undefined);

        case MCP_PROMPTS.SCORE_INTERPRETATION:
            return getScoreInterpretationPrompt();

        default:
            throw new Error(`Unknown prompt: ${name}`);
    }
}

// ============================================================================
// Prompt Generators
// ============================================================================

function getIntroductionPrompt(): PromptResult {
    return {
        description: 'Introduction to MCP IntelliBench',
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `# 🧠 Welcome to MCP IntelliBench

## What is MCP IntelliBench?

MCP IntelliBench is a comprehensive AI coding intelligence evaluation framework built on the Model Context Protocol (MCP). It provides standardized, reproducible benchmarks to assess various aspects of AI coding capabilities.

## How It Works

1. **Start a Session**: Use \`intellibench_start_session\` to begin a benchmark session
2. **Get Challenges**: Use \`intellibench_get_challenge\` to receive coding challenges
3. **Submit Solutions**: Use \`intellibench_submit_solution\` to submit your answers
4. **View Results**: Use \`intellibench_get_results\` to see your comprehensive scores

## Evaluation Categories

- 🔧 **Code Generation** - Creating correct, efficient code from specifications
- 🐛 **Bug Detection** - Identifying and fixing issues in code
- 🔄 **Refactoring** - Improving code quality and structure
- 📚 **Algorithm Design** - Solving complex algorithmic problems
- 🧪 **Test Generation** - Creating comprehensive test suites
- 📖 **Documentation** - Writing clear, helpful docs
- 🏗️ **Architecture** - Designing system structures
- 🔒 **Security** - Finding and fixing vulnerabilities

## Scoring Dimensions

Each solution is evaluated across multiple dimensions:
- **Correctness** (40%) - Does the code work correctly?
- **Efficiency** (20%) - How optimal is the solution?
- **Code Quality** (20%) - Is the code clean and maintainable?
- **Completeness** (10%) - Are edge cases handled?
- **Creativity** (10%) - Any innovative approaches?

## Getting Started

To start your benchmark session, call:
\`\`\`
intellibench_start_session
\`\`\`

You can customize with parameters:
- \`categories\`: Specific categories to test
- \`difficulty\`: easy, medium, hard, expert, or all
- \`maxChallenges\`: Number of challenges (1-50)

Good luck! 🎯`,
                },
            },
        ],
    };
}

function getChallengeTipsPrompt(category?: string): PromptResult {
    const generalTips = `
## 📝 General Tips for Benchmark Challenges

### Before You Start
1. **Read Carefully**: Understand all requirements before coding
2. **Identify Edge Cases**: Think about boundary conditions
3. **Plan Your Approach**: Outline your solution mentally first

### During the Challenge
1. **Start Simple**: Get a working solution first, then optimize
2. **Comment Your Code**: Explain non-obvious logic
3. **Handle Errors**: Include proper error handling
4. **Test Mentally**: Walk through your code with sample inputs

### Best Practices
1. **Use Meaningful Names**: Variables and functions should be self-documenting
2. **Keep Functions Small**: Single responsibility principle
3. **Avoid Magic Numbers**: Use constants for clarity
4. **Follow Language Conventions**: Use idiomatic patterns
`;

    const categoryTips: Record<string, string> = {
        code_generation: `
## 🔧 Code Generation Tips

1. **Understand the Specification**: Re-read requirements before coding
2. **Type Safety**: Use proper types (if applicable)
3. **Modularity**: Break complex logic into helper functions
4. **Edge Cases**: Empty inputs, null values, large inputs
5. **Performance**: Consider time and space complexity
`,
        bug_detection: `
## 🐛 Bug Detection Tips

1. **Read Line by Line**: Don't skim - bugs hide in details
2. **Look for Common Issues**:
   - Off-by-one errors
   - Null/undefined handling
   - Type coercion issues
   - Race conditions
3. **Trace Execution**: Walk through with sample inputs
4. **Check Boundary Values**: Test with edge cases
5. **Explain the Fix**: Describe why the bug occurred
`,
        refactoring: `
## 🔄 Refactoring Tips

1. **Identify Code Smells**:
   - Long methods
   - Duplicate code
   - Large classes
   - Complex conditionals
2. **Apply SOLID Principles**
3. **Extract Methods**: Create reusable helper functions
4. **Simplify Conditionals**: Use early returns, switch to polymorphism
5. **Preserve Behavior**: Ensure functionality remains identical
`,
        algorithm_design: `
## 📚 Algorithm Design Tips

1. **Understand the Problem**: Restate it in your own words
2. **Work Through Examples**: Use small inputs first
3. **Consider Multiple Approaches**:
   - Brute force
   - Divide and conquer
   - Dynamic programming
   - Greedy algorithms
4. **Analyze Complexity**: Aim for optimal time/space
5. **Test with Edge Cases**: Empty input, single element, large input
`,
        security: `
## 🔒 Security Analysis Tips

1. **Check for Common Vulnerabilities**:
   - SQL injection
   - XSS (Cross-site scripting)
   - CSRF (Cross-site request forgery)
   - Authentication bypass
2. **Validate All Inputs**: Never trust user input
3. **Use Parameterized Queries**: Prevent injection attacks
4. **Encode Output**: Prevent XSS
5. **Follow Least Privilege**: Minimize permissions
`,
    };

    let content = generalTips;

    if (category && categoryTips[category]) {
        content += '\n---\n' + categoryTips[category];
    } else if (!category) {
        // Include all category tips
        for (const tips of Object.values(categoryTips)) {
            content += '\n---\n' + tips;
        }
    }

    return {
        description: 'Tips for approaching benchmark challenges',
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: content,
                },
            },
        ],
    };
}

function getScoreInterpretationPrompt(): PromptResult {
    return {
        description: 'Guide to interpreting benchmark scores',
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `
## 📊 Understanding Your Benchmark Scores

### Score Breakdown

Your score is calculated across five dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| **Correctness** | 40% | Does the code produce the expected output? |
| **Efficiency** | 20% | Time and space complexity of the solution |
| **Code Quality** | 20% | Readability, maintainability, best practices |
| **Completeness** | 10% | Edge case handling, error handling |
| **Creativity** | 10% | Novel or elegant approaches |

### Score Tiers

| Percentage | Tier | Meaning |
|------------|------|---------|
| 90-100% | 🏆 Excellent | Expert-level performance |
| 75-89% | 🥈 Good | Strong, competent solutions |
| 60-74% | 🥉 Average | Acceptable but room for improvement |
| 40-59% | ⚠️ Needs Improvement | Significant gaps to address |
| 0-39% | ❌ Poor | Fundamental issues present |

### Percentile Rank

Your percentile shows how you compare to other AI models:
- **90th percentile**: Better than 90% of participants
- **50th percentile**: Median performance
- **10th percentile**: In the bottom 10%

### Category Breakdown

Review your scores by category to identify:
- **Strengths**: Categories where you excel (80%+)
- **Weaknesses**: Areas needing improvement (<60%)

### Recommendations

Based on your results, you'll receive:
1. Specific areas to focus on
2. Suggested practice challenges
3. Resources for improvement

### Tips for Improvement

1. **Analyze Failed Tests**: Understand why tests failed
2. **Review Feedback**: Each submission includes detailed feedback
3. **Practice Weak Areas**: Focus on low-scoring categories
4. **Study Solutions**: Learn from reference solutions
5. **Iterate**: Take the benchmark again to track progress
`,
                },
            },
        ],
    };
}
