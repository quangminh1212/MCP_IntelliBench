/**
 * @fileoverview Unit Tests for Code Execution Engine
 * @module @mcp/intellibench/tests/unit/execution
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CodeExecutionEngine, ExecutionResult } from '../../src/core/execution/engine.js';
import type { TestCase } from '../../src/shared/types/index.js';

// Mock child_process
vi.mock('child_process', () => ({
    spawn: vi.fn(),
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
    writeFile: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
}));

// Mock fs
vi.mock('fs', () => ({
    existsSync: vi.fn().mockReturnValue(true),
}));

describe('CodeExecutionEngine', () => {
    let engine: CodeExecutionEngine;

    beforeEach(() => {
        engine = new CodeExecutionEngine({
            timeout: 5000,
            memoryLimit: 128 * 1024 * 1024,
            useSandbox: false,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create engine with default config', () => {
            const defaultEngine = new CodeExecutionEngine();
            expect(defaultEngine).toBeDefined();
        });

        it('should create engine with custom config', () => {
            const customEngine = new CodeExecutionEngine({
                timeout: 10000,
                memoryLimit: 512 * 1024 * 1024,
                useSandbox: true,
            });
            expect(customEngine).toBeDefined();
        });
    });

    describe('initialize', () => {
        it('should initialize without errors', async () => {
            await expect(engine.initialize()).resolves.not.toThrow();
        });
    });

    describe('compareOutput', () => {
        it('should compare primitive values correctly', () => {
            // Access private method through type casting for testing
            const engineAny = engine as unknown as {
                compareOutput: (actual: unknown, expected: unknown) => boolean;
            };

            expect(engineAny.compareOutput(42, 42)).toBe(true);
            expect(engineAny.compareOutput('hello', 'hello')).toBe(true);
            expect(engineAny.compareOutput(true, true)).toBe(true);
            expect(engineAny.compareOutput(42, '42')).toBe(false);
        });

        it('should compare arrays correctly', () => {
            const engineAny = engine as unknown as {
                compareOutput: (actual: unknown, expected: unknown) => boolean;
            };

            expect(engineAny.compareOutput([1, 2, 3], [1, 2, 3])).toBe(true);
            expect(engineAny.compareOutput([1, 2, 3], [1, 2, 4])).toBe(false);
            expect(engineAny.compareOutput([1, 2], [1, 2, 3])).toBe(false);
        });

        it('should compare objects correctly', () => {
            const engineAny = engine as unknown as {
                compareOutput: (actual: unknown, expected: unknown) => boolean;
            };

            expect(engineAny.compareOutput({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
            expect(engineAny.compareOutput({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
        });

        it('should handle special expected value true', () => {
            const engineAny = engine as unknown as {
                compareOutput: (actual: unknown, expected: unknown) => boolean;
            };

            expect(engineAny.compareOutput('any value', true)).toBe(true);
            expect(engineAny.compareOutput(123, true)).toBe(true);
            expect(engineAny.compareOutput(null, true)).toBe(false);
            expect(engineAny.compareOutput(undefined, true)).toBe(false);
        });
    });

    describe('createFailedResult', () => {
        it('should create a proper failed result', () => {
            const testCase: TestCase = {
                id: 'tc1',
                name: 'Test Case 1',
                input: { value: 10 },
                expectedOutput: 20,
                isHidden: false,
                points: 25,
            };

            const engineAny = engine as unknown as {
                createFailedResult: (testCase: TestCase, error: string) => {
                    testCase: TestCase;
                    result: { passed: boolean; error: string };
                    executionResult: ExecutionResult;
                };
            };

            const result = engineAny.createFailedResult(testCase, 'Test error');

            expect(result.testCase).toBe(testCase);
            expect(result.result.passed).toBe(false);
            expect(result.result.error).toBe('Test error');
            expect(result.executionResult.success).toBe(false);
            expect(result.executionResult.timedOut).toBe(false);
        });
    });

    describe('getDockerImage', () => {
        it('should return correct Docker images for each language', () => {
            const engineAny = engine as unknown as {
                getDockerImage: (language: string) => string;
            };

            expect(engineAny.getDockerImage('typescript')).toBe('node:20-alpine');
            expect(engineAny.getDockerImage('javascript')).toBe('node:20-alpine');
            expect(engineAny.getDockerImage('python')).toBe('python:3.12-alpine');
            expect(engineAny.getDockerImage('java')).toBe('openjdk:21-slim');
            expect(engineAny.getDockerImage('go')).toBe('golang:1.22-alpine');
            expect(engineAny.getDockerImage('rust')).toBe('rust:1.75-alpine');
            expect(engineAny.getDockerImage('csharp')).toBe('mcr.microsoft.com/dotnet/sdk:8.0-alpine');
            expect(engineAny.getDockerImage('cpp')).toBe('gcc:13');
        });
    });
});

describe('ExecutionResult types', () => {
    it('should have correct structure for successful result', () => {
        const result: ExecutionResult = {
            success: true,
            stdout: 'Hello World',
            stderr: '',
            exitCode: 0,
            executionTime: 150,
            timedOut: false,
        };

        expect(result.success).toBe(true);
        expect(result.exitCode).toBe(0);
        expect(result.timedOut).toBe(false);
    });

    it('should have correct structure for failed result', () => {
        const result: ExecutionResult = {
            success: false,
            stdout: '',
            stderr: 'Error occurred',
            exitCode: 1,
            executionTime: 50,
            timedOut: false,
            error: 'Compilation failed',
        };

        expect(result.success).toBe(false);
        expect(result.exitCode).toBe(1);
        expect(result.error).toBe('Compilation failed');
    });

    it('should have correct structure for timeout result', () => {
        const result: ExecutionResult = {
            success: false,
            stdout: '',
            stderr: '',
            exitCode: 1,
            executionTime: 5000,
            timedOut: true,
            error: 'Execution timed out',
        };

        expect(result.success).toBe(false);
        expect(result.timedOut).toBe(true);
        expect(result.error).toBe('Execution timed out');
    });
});
