/**
 * @fileoverview Unit tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import {
    generateSessionId,
    getCurrentTimestamp,
    formatDuration,
    calculatePercentage,
    getRankLabel,
    shuffleArray,
    isValidSessionId,
} from '../../src/shared/utils/index.js';

describe('Utils', () => {
    describe('generateSessionId', () => {
        it('should generate a 21-character ID', () => {
            const id = generateSessionId();
            expect(id).toHaveLength(21);
        });

        it('should generate unique IDs', () => {
            const ids = new Set(Array.from({ length: 100 }, () => generateSessionId()));
            expect(ids.size).toBe(100);
        });
    });

    describe('getCurrentTimestamp', () => {
        it('should return a valid ISO timestamp', () => {
            const timestamp = getCurrentTimestamp();
            expect(new Date(timestamp).toISOString()).toBe(timestamp);
        });
    });

    describe('formatDuration', () => {
        it('should format seconds correctly', () => {
            expect(formatDuration(30)).toBe('30s');
            expect(formatDuration(90)).toBe('1m 30s');
            expect(formatDuration(3600)).toBe('1h 0m');
            expect(formatDuration(3660)).toBe('1h 1m');
        });
    });

    describe('calculatePercentage', () => {
        it('should calculate percentage correctly', () => {
            expect(calculatePercentage(50, 100)).toBe(50);
            expect(calculatePercentage(75, 100)).toBe(75);
            expect(calculatePercentage(0, 100)).toBe(0);
        });

        it('should handle zero max score', () => {
            expect(calculatePercentage(50, 0)).toBe(0);
        });
    });

    describe('getRankLabel', () => {
        it('should return correct rank labels', () => {
            expect(getRankLabel(95)).toBe('Excellent');
            expect(getRankLabel(80)).toBe('Good');
            expect(getRankLabel(65)).toBe('Average');
            expect(getRankLabel(45)).toBe('Needs Improvement');
            expect(getRankLabel(20)).toBe('Poor');
        });
    });

    describe('shuffleArray', () => {
        it('should return array of same length', () => {
            const arr = [1, 2, 3, 4, 5];
            const shuffled = shuffleArray(arr);
            expect(shuffled).toHaveLength(arr.length);
        });

        it('should contain all original elements', () => {
            const arr = [1, 2, 3, 4, 5];
            const shuffled = shuffleArray(arr);
            expect(shuffled.sort()).toEqual(arr.sort());
        });
    });

    describe('isValidSessionId', () => {
        it('should validate correct session IDs', () => {
            expect(isValidSessionId('V1StGXR8_Z5jdHi6B-myT')).toBe(true);
        });

        it('should reject invalid session IDs', () => {
            expect(isValidSessionId('too-short')).toBe(false);
            expect(isValidSessionId('')).toBe(false);
            expect(isValidSessionId(123)).toBe(false);
        });
    });
});
