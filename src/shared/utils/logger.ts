/**
 * @fileoverview Logger utility with APPDATA support for portable mode
 * @module @mcp/intellibench/utils/logger
 * @version 1.0.0
 *
 * Provides file-based logging to APPDATA directory for debugging
 * connection issues and tracking server activity in portable mode.
 */

import { existsSync, mkdirSync, appendFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { APP } from '../constants/index.js';

// ============================================================================
// Path Utilities
// ============================================================================

/**
 * Get the APPDATA directory based on platform
 * - Windows: %APPDATA%\MCP_IntelliBench
 * - macOS: ~/Library/Application Support/MCP_IntelliBench
 * - Linux: ~/.config/MCP_IntelliBench
 */
export function getAppDataDir(): string {
    const platform = process.platform;
    let baseDir: string;

    if (platform === 'win32') {
        // Windows: use APPDATA or LOCALAPPDATA
        baseDir = process.env['APPDATA'] || process.env['LOCALAPPDATA'] || join(process.env['USERPROFILE'] || 'C:', 'AppData', 'Roaming');
    } else if (platform === 'darwin') {
        // macOS: use ~/Library/Application Support
        baseDir = join(process.env['HOME'] || '~', 'Library', 'Application Support');
    } else {
        // Linux/Unix: use ~/.config
        baseDir = process.env['XDG_CONFIG_HOME'] || join(process.env['HOME'] || '~', '.config');
    }

    return join(baseDir, 'MCP_IntelliBench');
}

/**
 * Get the logs directory path
 */
export function getLogsDir(): string {
    return join(getAppDataDir(), 'logs');
}

/**
 * Get the data directory path (for database, etc.)
 */
export function getDataDir(): string {
    return join(getAppDataDir(), 'data');
}

/**
 * Ensure all required directories exist
 */
export function ensureDirectories(): { appData: string; logs: string; data: string } {
    const appDataDir = getAppDataDir();
    const logsDir = getLogsDir();
    const dataDir = getDataDir();

    if (!existsSync(appDataDir)) {
        mkdirSync(appDataDir, { recursive: true });
    }
    if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
    }
    if (!existsSync(dataDir)) {
        mkdirSync(dataDir, { recursive: true });
    }

    return { appData: appDataDir, logs: logsDir, data: dataDir };
}

// ============================================================================
// Logger Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: string;
    data?: unknown;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}

// ============================================================================
// Logger Class
// ============================================================================

class Logger {
    private logFilePath: string;
    private currentLogDate: string;
    private initialized: boolean = false;
    private minLevel: LogLevel = 'debug';

    private readonly levelPriority: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
        fatal: 4,
    };

    constructor() {
        this.currentLogDate = this.getDateString();
        this.logFilePath = this.getLogFilePath();
    }

    /**
     * Initialize the logger and create necessary directories
     */
    init(options?: { minLevel?: LogLevel }): void {
        if (this.initialized) return;

        try {
            const dirs = ensureDirectories();
            this.logFilePath = this.getLogFilePath();

            if (options?.minLevel) {
                this.minLevel = options.minLevel;
            }

            // Write startup marker
            this.writeToFile({
                timestamp: new Date().toISOString(),
                level: 'info',
                message: '='.repeat(60),
            });
            this.writeToFile({
                timestamp: new Date().toISOString(),
                level: 'info',
                message: `${APP.NAME} v${APP.VERSION} - Logger Initialized`,
                data: {
                    appDataDir: dirs.appData,
                    logsDir: dirs.logs,
                    dataDir: dirs.data,
                    platform: process.platform,
                    nodeVersion: process.version,
                    pid: process.pid,
                    cwd: process.cwd(),
                    execPath: process.execPath,
                },
            });

            this.initialized = true;
        } catch (err) {
            // Fallback to console if file logging fails
            console.error('[Logger] Failed to initialize file logging:', err);
        }
    }

    private getDateString(): string {
        return new Date().toISOString().split('T')[0]!;
    }

    private getLogFilePath(): string {
        const logsDir = getLogsDir();
        return join(logsDir, `intellibench-${this.currentLogDate}.log`);
    }

    private checkDateRotation(): void {
        const today = this.getDateString();
        if (today !== this.currentLogDate) {
            this.currentLogDate = today;
            this.logFilePath = this.getLogFilePath();
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return this.levelPriority[level] >= this.levelPriority[this.minLevel];
    }

    private formatLogEntry(entry: LogEntry): string {
        const levelStr = entry.level.toUpperCase().padEnd(5);
        const contextStr = entry.context ? `[${entry.context}] ` : '';
        let line = `${entry.timestamp} ${levelStr} ${contextStr}${entry.message}`;

        if (entry.data) {
            try {
                line += `\n  DATA: ${JSON.stringify(entry.data)}`;
            } catch {
                line += `\n  DATA: [Unable to stringify]`;
            }
        }

        if (entry.error) {
            line += `\n  ERROR: ${entry.error.name}: ${entry.error.message}`;
            if (entry.error.stack) {
                line += `\n  STACK: ${entry.error.stack.replace(/\n/g, '\n         ')}`;
            }
        }

        return line;
    }

    private writeToFile(entry: LogEntry): void {
        try {
            this.checkDateRotation();
            const line = this.formatLogEntry(entry) + '\n';
            appendFileSync(this.logFilePath, line, 'utf8');
        } catch {
            // Silent fail - don't crash the app if logging fails
        }
    }

    private log(level: LogLevel, message: string, context?: string, data?: unknown, error?: Error): void {
        if (!this.shouldLog(level)) return;

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            data,
        };

        if (error) {
            entry.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }

        // Always write to file if initialized
        if (this.initialized) {
            this.writeToFile(entry);
        }

        // Also output to console for visibility
        const consoleMsg = this.formatLogEntry(entry);
        switch (level) {
            case 'debug':
                // Don't output debug to console in production
                break;
            case 'info':
                console.log(consoleMsg);
                break;
            case 'warn':
                console.warn(consoleMsg);
                break;
            case 'error':
            case 'fatal':
                console.error(consoleMsg);
                break;
        }
    }

    // Public logging methods
    debug(message: string, context?: string, data?: unknown): void {
        this.log('debug', message, context, data);
    }

    info(message: string, context?: string, data?: unknown): void {
        this.log('info', message, context, data);
    }

    warn(message: string, context?: string, data?: unknown): void {
        this.log('warn', message, context, data);
    }

    error(message: string, context?: string, error?: Error, data?: unknown): void {
        this.log('error', message, context, data, error);
    }

    fatal(message: string, context?: string, error?: Error, data?: unknown): void {
        this.log('fatal', message, context, data, error);
    }

    /**
     * Log server connection events
     */
    connection(event: 'starting' | 'connected' | 'disconnected' | 'error', details?: unknown): void {
        const messages: Record<string, string> = {
            starting: 'Server transport starting...',
            connected: 'Server transport connected successfully',
            disconnected: 'Server transport disconnected',
            error: 'Server transport error occurred',
        };

        if (event === 'error') {
            this.error(messages[event]!, 'Transport', details instanceof Error ? details : undefined, details);
        } else {
            this.info(messages[event]!, 'Transport', details);
        }
    }

    /**
     * Log MCP tool calls
     */
    toolCall(toolName: string, args: unknown, result?: unknown, error?: Error): void {
        if (error) {
            this.error(`Tool call failed: ${toolName}`, 'MCP', error, { args });
        } else {
            this.debug(`Tool call: ${toolName}`, 'MCP', { args, result });
        }
    }

    /**
     * Get current log file path (useful for debugging)
     */
    getLogPath(): string {
        return this.logFilePath;
    }

    /**
     * Get all directory paths
     */
    getPaths(): { appData: string; logs: string; data: string; currentLog: string } {
        return {
            appData: getAppDataDir(),
            logs: getLogsDir(),
            data: getDataDir(),
            currentLog: this.logFilePath,
        };
    }
}

// Export singleton instance
export const logger = new Logger();

// Export helper functions
export { getAppDataDir as getAppData, getLogsDir as getLogs, getDataDir as getData };
