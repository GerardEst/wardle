import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    runStorageCheck,
    cleanGameboard,
    loadStoredGame,
} from '../src/storage-module'
import fs from 'fs'
import path from 'path'
import {
    deleteLastLetter,
    letterClick,
    setCurrentColumn,
    setCurrentRow,
    setCurrentTry,
    setCurrentWord,
    validateLastRow,
} from '../src/gameboard-module'

vi.mock('../src/words-module.ts', async () => {
    const actual = await vi.importActual('../src/words-module.ts')
    return {
        ...actual,
        getTodayWord: vi.fn(() => 'TESTS'),
        getTodayNiceWord: vi.fn(() => 'tests'),
        wordExists: vi.fn((word) => {
            // Return true for common valid words, false for invalid ones like QXZZZ
            const validWords = ['HOUSE', 'TESTS']
            return validWords.includes(word.toUpperCase())
        }),
    }
})
vi.useFakeTimers()

const html = fs.readFileSync(path.resolve('./index.html'), 'utf8')

describe('timetrial', () => {
    beforeEach(() => {
        // Set up the actual DOM structure from index.html
        document.body.innerHTML = html
        localStorage.clear()
        vi.clearAllMocks()

        setCurrentColumn(1)
        setCurrentRow(1)
        setCurrentWord('')
        setCurrentTry(1)

        // Mock fetch for loadWordsData to work
        global.fetch = vi.fn((url) => {
            if (url.includes('/assets/words.json')) {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            TESTS: 'tests',
                        }),
                })
            }
            if (url.includes('/assets/dicc.json')) {
                return Promise.resolve({
                    json: () => Promise.resolve(['TESTS']),
                })
            }
            return Promise.reject(new Error('Unknown URL'))
        }) as any
    })

    it('registers the starting time', () => {
        // It should start with no start time
        expect(localStorage.getItem('timetrial-start')).toBeNull()

        // Setup: Reset game state
        setCurrentRow(1)
        setCurrentColumn(1)
        setCurrentWord('')

        letterClick('A')

        const timeStart = localStorage.getItem('timetrial-start')
        console.log('Time Start:', timeStart)

        expect(timeStart).toBeDefined()
        expect(timeStart).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        ) // Should be an ISO string
    })

    it('shows the game time in the modal', () => {
        // Setup: Reset game state
        setCurrentRow(1)
        setCurrentColumn(1)
        setCurrentWord('')

        letterClick('T')
        letterClick('E')
        letterClick('S')
        letterClick('T')
        letterClick('S')

        vi.advanceTimersByTime(1000) // Simulate 1 second passing

        validateLastRow()

        const timeElement = document.querySelector('#stats-time')

        expect(timeElement!.textContent).toBe('00:00:01')
    })

    it('should update the average time in local stats correctly the first time', () => {
        // Setup: Reset game state
        setCurrentRow(1)
        setCurrentColumn(1)
        setCurrentWord('')

        letterClick('T')
        letterClick('E')
        letterClick('S')
        letterClick('T')
        letterClick('S')

        vi.advanceTimersByTime(1000) // Simulate 1 second passing

        validateLastRow()

        const storedStats = JSON.parse(localStorage.getItem('stats') || '{}')
        expect(storedStats.averageTime).toBeDefined()
        expect(storedStats.averageTime).toBe('00:00:01') // Should show 1 second
    })

    it('should have a todayTime instead of timetrial-start after finishing the game', () => {
        // Setup: Reset game state
        setCurrentRow(1)
        setCurrentColumn(1)
        setCurrentWord('')

        letterClick('T')
        letterClick('E')
        letterClick('S')
        letterClick('T')
        letterClick('S')

        vi.advanceTimersByTime(1000) // Simulate 1 second passing

        validateLastRow()

        // todayTime is defined
        const todayTime = localStorage.getItem('todayTime')
        expect(todayTime).toBeDefined()
        expect(todayTime).toBe('00:00:01') // Should show 1 second

        // timetrial-start is not
        expect(localStorage.getItem('timetrial-start')).toBeNull()
    })

    it('should show the modal with the correct time after reloading a finished game when there are still no local stats', async () => {
        // Simulate localStorage of a finished game
        const storedGame = [
            { row: 1, word: 'TESTS', date: new Date().toISOString() },
        ]

        localStorage.setItem('wardle_es_gamedata', JSON.stringify(storedGame))
        localStorage.setItem('todayTime', '00:00:10') // Simulate a 10 second game

        await loadStoredGame()

        const timeElement = document.querySelector('#stats-time')
        expect(timeElement!.textContent).toBe('00:00:10')
    })

    it('should have a todayTime also when user loose', () => {
        // Setup: Reset game state
        setCurrentRow(1)
        setCurrentColumn(1)
        setCurrentWord('')

        letterClick('H')
        letterClick('O')
        letterClick('U')
        letterClick('S')
        letterClick('E')
        vi.advanceTimersByTime(1000)
        validateLastRow()

        letterClick('H')
        letterClick('O')
        letterClick('U')
        letterClick('S')
        letterClick('E')
        vi.advanceTimersByTime(1000)
        validateLastRow()

        letterClick('H')
        letterClick('O')
        letterClick('U')
        letterClick('S')
        letterClick('E')
        vi.advanceTimersByTime(1000)
        validateLastRow()

        letterClick('H')
        letterClick('O')
        letterClick('U')
        letterClick('S')
        letterClick('E')
        vi.advanceTimersByTime(1000)
        validateLastRow()

        letterClick('H')
        letterClick('O')
        letterClick('U')
        letterClick('S')
        letterClick('E')
        vi.advanceTimersByTime(1000)
        validateLastRow()

        letterClick('H')
        letterClick('O')
        letterClick('U')
        letterClick('S')
        letterClick('E')
        vi.advanceTimersByTime(1000)
        validateLastRow()

        const todayTime = localStorage.getItem('todayTime')
        expect(todayTime).toBeDefined()
        expect(todayTime).toBe('00:00:06')
    })

    it('should show the correct average time', async () => {
        // Simulate existing stats
        const stats = {
            games: 1,
            totalPoints: 6,
            averagePoints: 6,
            averageTime: '00:00:20',
            streak: 1,
            maxStreak: 1,
        }
        localStorage.setItem('stats', JSON.stringify(stats))

        letterClick('T')
        letterClick('E')
        letterClick('S')
        letterClick('T')
        letterClick('S')

        vi.advanceTimersByTime(10000) // Simulate 10 seconds passing

        validateLastRow()

        const averagetimeElement = document.querySelector('#stats-averageTime')
        expect(averagetimeElement!.textContent).toBe('00:00:15')
    })

    it('should be cleaned up on every new day', () => {
        localStorage.setItem('wardle_es_gamedata', JSON.stringify([]))
        localStorage.setItem('timetrial-start', new Date().toISOString())
        localStorage.setItem('todayTime', '00:00:10')

        // Simulate a new day by setting the current date to tomorrow
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        vi.setSystemTime(tomorrow)

        runStorageCheck()

        // Check if localStorage is cleared
        expect(localStorage.getItem('wardle_es_gamedata')).toBeNull()
        expect(localStorage.getItem('timetrial-start')).toBeNull()
    })
})
