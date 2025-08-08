import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
    shareResult,
    copyToClipboard,
    isMobileDevice,
} from '../src/share-utils'
import * as domUtils from '../src/dom-utils'
import fs from 'fs'
import path from 'path'
import { loadStoredGame } from '../src/storage-module'

// Mock the dom-utils module
vi.mock('../src/dom-utils', () => ({
    showFeedback: vi.fn(),
}))

// Mock the words module for getTodayWordIndex
vi.mock('../src/words-module.ts', () => ({
    getTodayWordIndex: vi.fn(() => 42),
}))

// Load the actual HTML structure
const html = fs.readFileSync(path.resolve('./index.html'), 'utf8')

describe('share-utils', () => {
    // Mock navigator and clipboard APIs
    const mockNavigator = {} as any
    const mockClipboard = {
        writeText: vi.fn(() => Promise.resolve()),
    }

    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = html

        // Reset mocks
        vi.clearAllMocks()

        // Mock navigator globally
        Object.defineProperty(global, 'navigator', {
            value: mockNavigator,
            writable: true,
        })

        // Mock window
        Object.defineProperty(global, 'window', {
            value: {
                isSecureContext: true,
            },
            writable: true,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('buildResultPattern and shareResult', () => {
        beforeEach(() => {
            // Set up a mock game board with different cell states
            // Row 1: HOUSE (H=absent, O=absent, U=absent, S=present, E=present)
            document.querySelector('#l1_1')!.textContent = 'H'
            document.querySelector('#l1_1')!.classList.add('absent')
            document.querySelector('#l1_2')!.textContent = 'O'
            document.querySelector('#l1_2')!.classList.add('absent')
            document.querySelector('#l1_3')!.textContent = 'U'
            document.querySelector('#l1_3')!.classList.add('absent')
            document.querySelector('#l1_4')!.textContent = 'S'
            document.querySelector('#l1_4')!.classList.add('present')
            document.querySelector('#l1_5')!.textContent = 'E'
            document.querySelector('#l1_5')!.classList.add('present')

            // Row 2: TESTS (all correct)
            document.querySelector('#l2_1')!.textContent = 'T'
            document.querySelector('#l2_1')!.classList.add('correct')
            document.querySelector('#l2_2')!.textContent = 'E'
            document.querySelector('#l2_2')!.classList.add('correct')
            document.querySelector('#l2_3')!.textContent = 'S'
            document.querySelector('#l2_3')!.classList.add('correct')
            document.querySelector('#l2_4')!.textContent = 'T'
            document.querySelector('#l2_4')!.classList.add('correct')
            document.querySelector('#l2_5')!.textContent = 'S'
            document.querySelector('#l2_5')!.classList.add('correct')
        })

        it('should generate closed result pattern (emoji only)', () => {
            mockNavigator.clipboard = mockClipboard
            mockNavigator.userAgent = 'Desktop Chrome'
            mockNavigator.maxTouchPoints = 0

            shareResult(false, 42, 2, '00:01:23')

            expect(mockClipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('2/6')
            )
            expect(mockClipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('00:01:23')
            )
            expect(mockClipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('⬜️⬜️⬜️🟨🟨')
            )
            expect(mockClipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('🟩🟩🟩🟩🟩')
            )
            expect(mockClipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('mooot.cat')
            )
            expect(domUtils.showFeedback).toHaveBeenCalledWith(
                expect.stringContaining('copiat')
            )
        })

        it('should generate open result pattern (emoji + letters)', () => {
            mockNavigator.clipboard = mockClipboard
            mockNavigator.userAgent = 'Desktop Chrome'
            mockNavigator.maxTouchPoints = 0

            shareResult(true, 42, 2, '00:01:23')

            expect(mockClipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('⬜️H  ⬜️O  ⬜️U  🟨S  🟨E')
            )
            expect(mockClipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('🟩T  🟩E  🟩S  🟩T  🟩S')
            )
        })

        it('should show X/6 when tries is 7 (failed)', () => {
            mockNavigator.clipboard = mockClipboard
            mockNavigator.userAgent = 'Desktop Chrome'
            mockNavigator.maxTouchPoints = 0

            shareResult(false, 42, 7, '00:01:23')

            expect(mockClipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('X/6')
            )
            expect(mockClipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('00:01:23')
            )
        })

        it('should use native share API on mobile devices', () => {
            const mockShare = vi.fn(() => Promise.resolve())
            mockNavigator.share = mockShare
            mockNavigator.userAgent = 'iPhone'
            mockNavigator.maxTouchPoints = 5

            shareResult(false, 42, 2, '00:01:23')

            expect(mockShare).toHaveBeenCalledWith({
                text: expect.stringContaining('2/6'),
            })
            expect(mockShare).toHaveBeenCalledWith({
                text: expect.stringContaining('00:01:23'),
            })
            expect(mockClipboard.writeText).not.toHaveBeenCalled()
            expect(domUtils.showFeedback).not.toHaveBeenCalled()
        })

        it('should handle clipboard errors gracefully', async () => {
            mockNavigator.clipboard = {
                writeText: vi.fn(() =>
                    Promise.reject(new Error('Clipboard failed'))
                ),
            }
            mockNavigator.userAgent = 'Desktop Chrome'
            mockNavigator.maxTouchPoints = 0

            const consoleSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            shareResult(false, 42, 2, '00:01:23')

            // Wait for the promise to resolve/reject
            await new Promise((resolve) => setTimeout(resolve, 0))

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error copying to clipboard:',
                expect.any(Error)
            )
            consoleSpy.mockRestore()
        })

        it('should generate correct pattern for partial game (3 tries)', () => {
            // Add one more row
            document.querySelector('#l3_1')!.textContent = 'M'
            document.querySelector('#l3_1')!.classList.add('absent')
            document.querySelector('#l3_2')!.textContent = 'O'
            document.querySelector('#l3_2')!.classList.add('absent')
            document.querySelector('#l3_3')!.textContent = 'U'
            document.querySelector('#l3_3')!.classList.add('absent')
            document.querySelector('#l3_4')!.textContent = 'S'
            document.querySelector('#l3_4')!.classList.add('present')
            document.querySelector('#l3_5')!.textContent = 'E'
            document.querySelector('#l3_5')!.classList.add('present')

            mockNavigator.clipboard = mockClipboard
            mockNavigator.userAgent = 'Desktop Chrome'
            mockNavigator.maxTouchPoints = 0

            shareResult(false, 42, 3, '00:01:23')

            expect(mockClipboard.writeText).toHaveBeenCalled()
            const calls = mockClipboard.writeText.mock.calls
            expect(calls.length).toBeGreaterThan(0)

            const expectedCall = calls[0][0]
            expect(typeof expectedCall).toBe('string')
            // Should have 3 rows in the pattern
            const patternLines = expectedCall
                .split('\n')
                .filter(
                    (line: string) =>
                        line.includes('🟩') ||
                        line.includes('🟨') ||
                        line.includes('⬜️')
                )
            expect(patternLines).toHaveLength(3)
        })

        // it('should show X/6 when loading from localStorage a failed game', async () => {
        //     // Setup: Create losing game data (6 attempts, last word doesn't match)
        //     const savedGameData = [
        //         { word: 'HOUSE', row: 1, date: new Date().toISOString() },
        //         { word: 'MOUSE', row: 2, date: new Date().toISOString() },
        //         { word: 'LOUSE', row: 3, date: new Date().toISOString() },
        //         { word: 'DOUSE', row: 4, date: new Date().toISOString() },
        //         { word: 'ROUSE', row: 5, date: new Date().toISOString() },
        //         { word: 'SOUSE', row: 6, date: new Date().toISOString() }, // Wrong answer on 6th try
        //     ]
        //     localStorage.setItem('wardle_es_gamedata', JSON.stringify(savedGameData))

        //     // Call the function
        //     await loadStoredGame()

        //     // TODO - Acabar aquet test d'una manera fiable
        // })
    })
})
