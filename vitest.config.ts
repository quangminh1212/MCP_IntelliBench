import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        exclude: ['node_modules', 'dist'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.d.ts', 'src/data/**'],
        },
        testTimeout: 10000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@server': path.resolve(__dirname, './src/server'),
            '@core': path.resolve(__dirname, './src/core'),
            '@data': path.resolve(__dirname, './src/data'),
            '@shared': path.resolve(__dirname, './src/shared'),
        },
    },
});
