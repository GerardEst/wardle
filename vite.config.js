/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./test-setup.ts'],
        globals: true, // Allows using describe, it, expect without imports
        coverage: {
            reporter: ['text', 'html'],
            exclude: [
                'scripts/**',
                'dist/**',
                'vite.config.js',
                'test-setup.js',
                'main.ts',
            ],
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                bot: resolve(__dirname, 'es/bot/index.html'),
                'es-bot': resolve(__dirname, 'es/bot/index.html'),
                'en-bot': resolve(__dirname, 'en/bot/index.html'),
            },
        },
    },
})
