/**
 * @fileoverview Code Execution Engine with Sandboxed Environment
 * @module @mcp/intellibench/core/execution
 * @version 1.0.0
 *
 * Provides secure code execution for benchmark challenges across multiple languages.
 * Implements sandboxing, resource limits, and timeout management.
 */

import { spawn, ChildProcess } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { ProgrammingLanguage, TestCase, TestCaseResult } from '../../shared/types/index.js';
import { TIMEOUTS } from '../../shared/constants/index.js';

// ============================================================================
// Types
// ============================================================================

export interface ExecutionConfig {
    /** Maximum execution time in milliseconds */
    timeout: number;
    /** Maximum memory in bytes */
    memoryLimit: number;
    /** Working directory for execution */
    workDir: string;
    /** Enable sandboxing (docker) if available */
    useSandbox: boolean;
}

export interface ExecutionResult {
    /** Whether execution was successful */
    success: boolean;
    /** Standard output */
    stdout: string;
    /** Standard error */
    stderr: string;
    /** Exit code */
    exitCode: number;
    /** Execution time in milliseconds */
    executionTime: number;
    /** Memory usage in bytes (if available) */
    memoryUsage?: number;
    /** Error message if execution failed */
    error?: string;
    /** Whether execution timed out */
    timedOut: boolean;
}

export interface TestExecutionResult {
    testCase: TestCase;
    result: TestCaseResult;
    executionResult: ExecutionResult;
}

// ============================================================================
// Language Configurations
// ============================================================================

interface LanguageConfig {
    extension: string;
    compileCommand?: (filePath: string, outputPath: string) => string[];
    runCommand: (filePath: string) => string[];
    wrapperTemplate: (code: string, testInput: string) => string;
}

const LANGUAGE_CONFIGS: Record<ProgrammingLanguage, LanguageConfig> = {
    typescript: {
        extension: '.ts',
        runCommand: (filePath) => ['npx', 'tsx', filePath],
        wrapperTemplate: (code, testInput) => `
${code}

// Test execution wrapper
const testInput = ${testInput};
try {
    const result = main(testInput);
    console.log(JSON.stringify({ success: true, result }));
} catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
}
`,
    },
    javascript: {
        extension: '.js',
        runCommand: (filePath) => ['node', filePath],
        wrapperTemplate: (code, testInput) => `
${code}

// Test execution wrapper
const testInput = ${testInput};
try {
    const result = main(testInput);
    console.log(JSON.stringify({ success: true, result }));
} catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
}
`,
    },
    python: {
        extension: '.py',
        runCommand: (filePath) => ['python3', filePath],
        wrapperTemplate: (code, testInput) => `
import json
import sys

${code}

# Test execution wrapper
test_input = ${testInput}
try:
    result = main(test_input)
    print(json.dumps({"success": True, "result": result}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`,
    },
    java: {
        extension: '.java',
        compileCommand: (filePath, outputPath) => ['javac', '-d', outputPath, filePath],
        runCommand: (filePath) => ['java', '-cp', filePath, 'Solution'],
        wrapperTemplate: (code, testInput) => `
import com.google.gson.Gson;
import java.util.*;

${code}

public class Solution {
    public static void main(String[] args) {
        Gson gson = new Gson();
        try {
            Object testInput = gson.fromJson("${testInput.replace(/"/g, '\\"')}", Object.class);
            Object result = Main.main(testInput);
            System.out.println(gson.toJson(Map.of("success", true, "result", result)));
        } catch (Exception e) {
            System.out.println(gson.toJson(Map.of("success", false, "error", e.getMessage())));
        }
    }
}
`,
    },
    go: {
        extension: '.go',
        runCommand: (filePath) => ['go', 'run', filePath],
        wrapperTemplate: (code, testInput) => `
package main

import (
    "encoding/json"
    "fmt"
)

${code}

func main() {
    testInput := ${testInput}
    defer func() {
        if r := recover(); r != nil {
            result, _ := json.Marshal(map[string]interface{}{"success": false, "error": fmt.Sprint(r)})
            fmt.Println(string(result))
        }
    }()

    result := Main(testInput)
    output, _ := json.Marshal(map[string]interface{}{"success": true, "result": result})
    fmt.Println(string(output))
}
`,
    },
    rust: {
        extension: '.rs',
        compileCommand: (filePath, outputPath) => ['rustc', '-o', outputPath, filePath],
        runCommand: (filePath) => [filePath],
        wrapperTemplate: (code, testInput) => `
use serde_json::{json, Value};

${code}

fn main() {
    let test_input: Value = serde_json::from_str(r#"${testInput}"#).unwrap();
    match std::panic::catch_unwind(|| main_solution(test_input)) {
        Ok(result) => println!("{}", json!({"success": true, "result": result})),
        Err(e) => println!("{}", json!({"success": false, "error": format!("{:?}", e)})),
    }
}
`,
    },
    csharp: {
        extension: '.cs',
        compileCommand: (filePath, outputPath) => ['dotnet', 'build', '-o', outputPath],
        runCommand: (filePath) => ['dotnet', 'run', '--project', filePath],
        wrapperTemplate: (code, testInput) => `
using System;
using System.Text.Json;

${code}

public class Program {
    public static void Main() {
        try {
            var testInput = JsonSerializer.Deserialize<object>("${testInput.replace(/"/g, '\\"')}");
            var result = Solution.Main(testInput);
            Console.WriteLine(JsonSerializer.Serialize(new { success = true, result }));
        } catch (Exception e) {
            Console.WriteLine(JsonSerializer.Serialize(new { success = false, error = e.Message }));
        }
    }
}
`,
    },
    cpp: {
        extension: '.cpp',
        compileCommand: (filePath, outputPath) => ['g++', '-std=c++17', '-o', outputPath, filePath],
        runCommand: (filePath) => [filePath],
        wrapperTemplate: (code, testInput) => `
#include <iostream>
#include <nlohmann/json.hpp>
using json = nlohmann::json;

${code}

int main() {
    try {
        json testInput = json::parse(R"(${testInput})");
        auto result = main_solution(testInput);
        std::cout << json{{"success", true}, {"result", result}} << std::endl;
    } catch (const std::exception& e) {
        std::cout << json{{"success", false}, {"error", e.what()}} << std::endl;
    }
    return 0;
}
`,
    },
};

// ============================================================================
// Code Execution Engine
// ============================================================================

export class CodeExecutionEngine {
    private readonly config: ExecutionConfig;
    private readonly tempDir: string;

    constructor(config: Partial<ExecutionConfig> = {}) {
        this.config = {
            timeout: config.timeout ?? TIMEOUTS.CODE_EXECUTION,
            memoryLimit: config.memoryLimit ?? 256 * 1024 * 1024, // 256MB
            workDir: config.workDir ?? join(process.cwd(), '.intellibench', 'execution'),
            useSandbox: config.useSandbox ?? false,
        };
        this.tempDir = join(this.config.workDir, 'temp');
    }

    /**
     * Initialize the execution engine
     */
    async initialize(): Promise<void> {
        if (!existsSync(this.tempDir)) {
            await mkdir(this.tempDir, { recursive: true });
        }
    }

    /**
     * Execute code and run test cases
     */
    async executeWithTests(
        code: string,
        language: ProgrammingLanguage,
        testCases: readonly TestCase[]
    ): Promise<TestExecutionResult[]> {
        const results: TestExecutionResult[] = [];

        for (const testCase of testCases) {
            const result = await this.executeTestCase(code, language, testCase);
            results.push(result);
        }

        return results;
    }

    /**
     * Execute a single test case
     */
    async executeTestCase(
        code: string,
        language: ProgrammingLanguage,
        testCase: TestCase
    ): Promise<TestExecutionResult> {
        const langConfig = LANGUAGE_CONFIGS[language];
        if (!langConfig) {
            return this.createFailedResult(testCase, `Unsupported language: ${language}`);
        }

        const executionId = randomUUID();
        const filePath = join(this.tempDir, `${executionId}${langConfig.extension}`);

        try {
            // Prepare code with test wrapper
            const wrappedCode = langConfig.wrapperTemplate(
                code,
                JSON.stringify(testCase.input)
            );

            // Write code to file
            await writeFile(filePath, wrappedCode, 'utf-8');

            // Compile if needed
            if (langConfig.compileCommand) {
                const outputPath = join(this.tempDir, executionId);
                const compileResult = await this.executeCommand(
                    langConfig.compileCommand(filePath, outputPath),
                    this.config.timeout
                );

                if (!compileResult.success) {
                    return this.createFailedResult(testCase, `Compilation failed: ${compileResult.stderr}`);
                }
            }

            // Execute
            const executionResult = await this.executeCommand(
                langConfig.runCommand(filePath),
                testCase.timeout ?? this.config.timeout
            );

            // Parse result
            const testResult = this.parseExecutionResult(
                executionResult,
                testCase
            );

            return {
                testCase,
                result: testResult,
                executionResult,
            };
        } catch (error) {
            return this.createFailedResult(
                testCase,
                error instanceof Error ? error.message : 'Unknown execution error'
            );
        } finally {
            // Cleanup
            await this.cleanup(filePath);
        }
    }

    /**
     * Execute a command with timeout
     */
    private executeCommand(
        command: string[],
        timeout: number
    ): Promise<ExecutionResult> {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const [cmd, ...args] = command;

            if (!cmd) {
                resolve({
                    success: false,
                    stdout: '',
                    stderr: 'No command provided',
                    exitCode: 1,
                    executionTime: 0,
                    timedOut: false,
                    error: 'No command provided',
                });
                return;
            }

            const proc: ChildProcess = spawn(cmd, args, {
                cwd: this.tempDir,
                timeout,
                killSignal: 'SIGKILL',
            });

            let stdout = '';
            let stderr = '';
            let timedOut = false;

            proc.stdout?.on('data', (data: Buffer) => {
                stdout += data.toString();
            });

            proc.stderr?.on('data', (data: Buffer) => {
                stderr += data.toString();
            });

            const timeoutHandle = setTimeout(() => {
                timedOut = true;
                proc.kill('SIGKILL');
            }, timeout);

            proc.on('close', (exitCode) => {
                clearTimeout(timeoutHandle);
                const executionTime = Date.now() - startTime;

                resolve({
                    success: exitCode === 0 && !timedOut,
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    exitCode: exitCode ?? 1,
                    executionTime,
                    timedOut,
                    error: timedOut ? 'Execution timed out' : undefined,
                });
            });

            proc.on('error', (error) => {
                clearTimeout(timeoutHandle);
                const executionTime = Date.now() - startTime;

                resolve({
                    success: false,
                    stdout: stdout.trim(),
                    stderr: error.message,
                    exitCode: 1,
                    executionTime,
                    timedOut: false,
                    error: error.message,
                });
            });
        });
    }

    /**
     * Parse execution result and compare with expected output
     */
    private parseExecutionResult(
        executionResult: ExecutionResult,
        testCase: TestCase
    ): TestCaseResult {
        if (!executionResult.success) {
            return {
                testCaseId: testCase.id,
                passed: false,
                error: executionResult.error ?? executionResult.stderr,
                executionTime: executionResult.executionTime,
            };
        }

        try {
            const output = JSON.parse(executionResult.stdout);

            if (!output.success) {
                return {
                    testCaseId: testCase.id,
                    passed: false,
                    error: output.error,
                    executionTime: executionResult.executionTime,
                };
            }

            const passed = this.compareOutput(output.result, testCase.expectedOutput);

            return {
                testCaseId: testCase.id,
                passed,
                actualOutput: output.result,
                expectedOutput: testCase.expectedOutput,
                executionTime: executionResult.executionTime,
            };
        } catch {
            return {
                testCaseId: testCase.id,
                passed: false,
                error: 'Failed to parse execution output',
                actualOutput: executionResult.stdout,
                expectedOutput: testCase.expectedOutput,
                executionTime: executionResult.executionTime,
            };
        }
    }

    /**
     * Compare actual output with expected output
     */
    private compareOutput(actual: unknown, expected: unknown): boolean {
        // Handle special case where expected is boolean true (any valid output)
        if (expected === true && actual !== undefined && actual !== null) {
            return true;
        }

        // Deep equality comparison
        return JSON.stringify(actual) === JSON.stringify(expected);
    }

    /**
     * Create a failed test result
     */
    private createFailedResult(testCase: TestCase, error: string): TestExecutionResult {
        return {
            testCase,
            result: {
                testCaseId: testCase.id,
                passed: false,
                error,
                executionTime: 0,
            },
            executionResult: {
                success: false,
                stdout: '',
                stderr: error,
                exitCode: 1,
                executionTime: 0,
                timedOut: false,
                error,
            },
        };
    }

    /**
     * Cleanup temporary files
     */
    private async cleanup(filePath: string): Promise<void> {
        try {
            if (existsSync(filePath)) {
                await unlink(filePath);
            }
        } catch {
            // Ignore cleanup errors
        }
    }

    /**
     * Execute code in Docker sandbox (enhanced security)
     */
    async executeInSandbox(
        code: string,
        language: ProgrammingLanguage,
        testInput: unknown,
        timeout: number = this.config.timeout
    ): Promise<ExecutionResult> {
        const langConfig = LANGUAGE_CONFIGS[language];
        if (!langConfig) {
            return {
                success: false,
                stdout: '',
                stderr: `Unsupported language: ${language}`,
                exitCode: 1,
                executionTime: 0,
                timedOut: false,
                error: `Unsupported language: ${language}`,
            };
        }

        const executionId = randomUUID();
        const containerName = `intellibench-${executionId}`;
        const dockerImage = this.getDockerImage(language);

        const dockerCommand = [
            'docker', 'run',
            '--rm',
            '--name', containerName,
            '--network', 'none', // No network access
            '--memory', `${this.config.memoryLimit}`,
            '--cpus', '1',
            '--pids-limit', '50',
            '--read-only',
            '--tmpfs', '/tmp:rw,noexec,nosuid,size=64m',
            dockerImage,
            'timeout', `${Math.ceil(timeout / 1000)}s`,
            ...langConfig.runCommand('/code/solution' + langConfig.extension),
        ];

        return this.executeCommand(dockerCommand, timeout + 5000);
    }

    private getDockerImage(language: ProgrammingLanguage): string {
        const images: Record<ProgrammingLanguage, string> = {
            typescript: 'node:20-alpine',
            javascript: 'node:20-alpine',
            python: 'python:3.12-alpine',
            java: 'openjdk:21-slim',
            go: 'golang:1.22-alpine',
            rust: 'rust:1.75-alpine',
            csharp: 'mcr.microsoft.com/dotnet/sdk:8.0-alpine',
            cpp: 'gcc:13',
        };
        return images[language];
    }
}

export default CodeExecutionEngine;
