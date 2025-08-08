import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    letterClick,
    deleteLastLetter,
    validateLastRow,
    setCurrentRow,
    setCurrentColumn,
    setCurrentWord,
    setCurrentTry,
    currentRow,
    currentColumn,
    currentWord,
} from '../src/gameboard-module'
import fs from 'fs'
import path from 'path'

// Mock only the word functions to return predictable values
vi.mock('../src/words-module.ts', async () => {
    const actual = await vi.importActual('../src/words-module.ts')
    return {
        ...actual,
        getTodayWord: vi.fn(() => 'tests'),
        getTodayNiceWord: vi.fn(() => 'TESTS'),
        wordExists: vi.fn((word) => {
            // Return true for common valid words, false for invalid ones like QXZZZ
            const validWords = [
                'HOUSE',
                'MOUSE',
                'LOUSE',
                'DOUSE',
                'ROUSE',
                'SOUSE',
                'HEART',
                'TESTS',
                'TOAST',
                'OTTOO',
                'OOTTO',
                'STEEL',
                'STEEE',
            ]
            return validWords.includes(word.toUpperCase())
        }),
    }
})

// Load the actual HTML structure
const html = fs.readFileSync(path.resolve('./index.html'), 'utf8')

describe('user can play', () => {
    beforeEach(() => {
        setCurrentRow(1)
        setCurrentColumn(1)
        setCurrentWord('')
        setCurrentTry(1)

        // Set up the actual DOM structure from index.html
        document.body.innerHTML = html
        localStorage.clear()
        vi.clearAllMocks()

        // Mock fetch for loadWordsData to work
        global.fetch = vi.fn((url) => {
            if (url.includes('/assets/words.json')) {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve({ tests: 'TESTS', house: 'HOUSE' }),
                })
            }
            if (url.includes('/assets/dicc.json')) {
                return Promise.resolve({
                    json: () => Promise.resolve(['TESTS', 'HOUSE', 'MOUSE']),
                })
            }
            return Promise.reject(new Error('Unknown URL'))
        }) as any
    })

    it('should let user click on letters when there is space', () => {
        // Action: Click a letter
        letterClick('A')

        // Verification: Letter should appear in first cell and game state should update
        expect(document.querySelector('#l1_1')).toHaveTextContent('A')
        expect(currentColumn).toBe(2)
        expect(currentWord).toBe('A')

        // Click another letter
        letterClick('B')
        expect(document.querySelector('#l1_2')).toHaveTextContent('B')
        expect(currentColumn).toBe(3)
        expect(currentWord).toBe('AB')
    })
    it('should not add the letter if the row is full', () => {
        letterClick('A')
        letterClick('B')
        letterClick('C')
        letterClick('D')
        letterClick('E')

        // Verify row is full
        expect(currentColumn).toBe(6)
        expect(currentWord).toBe('ABCDE')

        // Action: Try to add another letter
        letterClick('F')

        // Verification: Letter should not be added
        expect(currentColumn).toBe(6) // Should remain at 6
        expect(currentWord).toBe('ABCDE') // Should not include F
        expect(document.querySelector('#l1_5')).toHaveTextContent('E') // Last cell should still have E
    })
    it('should validate a correct word if user clicks enter and the row is full', () => {
        // Use a word that exists in dictionary but is not the target word 'TESTS'
        letterClick('H')
        letterClick('O')
        letterClick('U')
        letterClick('S')
        letterClick('E')

        // Verify setup
        expect(currentWord).toBe('HOUSE')
        expect(currentColumn).toBe(6)

        // Action: Validate the row
        validateLastRow()

        // Verification: Should proceed to next row since word is valid but not correct
        expect(currentRow).toBe(2)
        expect(currentColumn).toBe(1)
        expect(currentWord).toBe('')

        // Should have color hints applied to cells
        const cell1 = document.querySelector('#l1_1')
        const hasHintClass =
            cell1?.classList.contains('correct') ||
            cell1?.classList.contains('present') ||
            cell1?.classList.contains('absent')
        expect(hasHintClass).toBe(true)
    })
    it('should not validate a word if user clicks enter but the row is not full', () => {
        letterClick('A')
        letterClick('B')
        letterClick('C')

        // Verify setup
        expect(currentWord).toBe('ABC')
        expect(currentColumn).toBe(4) // Should be at column 4, ready for 4th letter

        // Action: Try to validate incomplete row
        validateLastRow()

        // Verification: Should not proceed, row and column should remain unchanged
        expect(currentRow).toBe(1) // Should stay at row 1
        expect(currentColumn).toBe(4) // Should stay at column 4
        expect(currentWord).toBe('ABC') // Word should remain unchanged

        // Should not have triggered any hints
        const cell1 = document.querySelector('#l1_1')
        expect(cell1).not.toHaveClass('correct')
        expect(cell1).not.toHaveClass('present')
        expect(cell1).not.toHaveClass('absent')
    })
    it('should write letters on the next row after user validates correctly a row', () => {
        letterClick('T')
        letterClick('E')
        letterClick('S')
        letterClick('T')
        letterClick('S')

        // Verify setup
        expect(currentWord).toBe('TESTS')
        expect(currentRow).toBe(1)

        // Action: Validate the correct word (this triggers win condition)
        validateLastRow()

        // Verification: Should show win modal, letters remain on row 1
        expect(document.querySelector('#l1_1')).toHaveTextContent('T')
        expect(document.querySelector('#l1_2')).toHaveTextContent('E')
        expect(document.querySelector('#l1_3')).toHaveTextContent('S')
        expect(document.querySelector('#l1_4')).toHaveTextContent('T')
        expect(document.querySelector('#l1_5')).toHaveTextContent('S')

        // Game should be in won state (currentWord should be reset)
        expect(currentWord).toBe('')

        // All letters should be marked as correct
        expect(document.querySelector('#l1_1')).toHaveClass('correct')
        expect(document.querySelector('#l1_2')).toHaveClass('correct')
        expect(document.querySelector('#l1_3')).toHaveClass('correct')
        expect(document.querySelector('#l1_4')).toHaveClass('correct')
        expect(document.querySelector('#l1_5')).toHaveClass('correct')
    })
    it('should clean the row after user incorrectly validates a row', () => {
        letterClick('Q')
        letterClick('X')
        letterClick('Z')
        letterClick('Z')
        letterClick('Z')

        validateLastRow()

        expect(document.querySelector('#l1_1')).toHaveTextContent('')
        expect(document.querySelector('#l1_2')).toHaveTextContent('')
        expect(document.querySelector('#l1_3')).toHaveTextContent('')
        expect(document.querySelector('#l1_4')).toHaveTextContent('')
        expect(document.querySelector('#l1_5')).toHaveTextContent('')
    })
    it('should write letters on the same row after user validates incorrectly a row', () => {
        letterClick('Q')
        letterClick('X')
        letterClick('Z')
        letterClick('Z')
        letterClick('Z')

        // Verify setup
        expect(currentWord).toBe('QXZZZ')
        expect(currentRow).toBe(1)
        expect(currentColumn).toBe(6)

        // Action: Validate the invalid word
        validateLastRow()

        // Verification: Should stay on same row, word should be cleared
        expect(currentRow).toBe(1) // Should stay on row 1
        expect(currentColumn).toBe(1) // Should reset to column 1
        expect(currentWord).toBe('') // Word should be cleared

        letterClick('A')

        expect(document.querySelector('#l1_1')).toHaveTextContent('A')
    })
    it('should alter the status of the cells and keyboard when user validates a row with appropiated stats', () => {
        // Setup: Use a word that will give us different hint states compared to 'TESTS'
        // HEART vs TESTS: H(absent), E(correct), A(absent), R(absent), T(present)

        letterClick('H')
        letterClick('E')
        letterClick('A')
        letterClick('R')
        letterClick('T')

        // Action: Validate the word
        validateLastRow()

        // Verification: Check cell classes based on comparison with 'TESTS'
        // H is not in TESTS -> absent
        expect(document.querySelector('#l1_1')).toHaveClass('absent')
        // E is in position 2 of TESTS -> correct
        expect(document.querySelector('#l1_2')).toHaveClass('correct')
        // A is not in TESTS -> absent
        expect(document.querySelector('#l1_3')).toHaveClass('absent')
        // R is not in TESTS -> absent
        expect(document.querySelector('#l1_4')).toHaveClass('absent')
        // T is in TESTS but wrong position -> present
        expect(document.querySelector('#l1_5')).toHaveClass('present')

        // Verification: Check keyboard key states
        const keyH = document.querySelector('.keyboard__key[data-key="H"]')
        const keyE = document.querySelector('.keyboard__key[data-key="E"]')
        const keyA = document.querySelector('.keyboard__key[data-key="A"]')
        const keyR = document.querySelector('.keyboard__key[data-key="R"]')
        const keyT = document.querySelector('.keyboard__key[data-key="T"]')

        expect(keyH).toHaveClass('absent')
        expect(keyE).toHaveClass('correct')
        expect(keyA).toHaveClass('absent')
        expect(keyR).toHaveClass('absent')
        expect(keyT).toHaveClass('present')
    })
    it('should allow users to delete a letter in the active row', () => {
        letterClick('A')
        letterClick('B')
        letterClick('C')

        // Verify setup
        expect(currentWord).toBe('ABC')
        expect(currentColumn).toBe(4)
        expect(document.querySelector('#l1_3')).toHaveTextContent('C')

        // Action: Delete the last letter
        deleteLastLetter()

        // Verification: Last letter should be removed
        expect(currentWord).toBe('AB')
        expect(currentColumn).toBe(3)
        expect(document.querySelector('#l1_3')?.textContent).not.toBe('C') // Cell changed from C
        expect(document.querySelector('#l1_2')).toHaveTextContent('B') // Previous letter should remain

        // Delete another letter
        deleteLastLetter()
        expect(currentWord).toBe('A')
        expect(currentColumn).toBe(2)
        expect(document.querySelector('#l1_2')?.textContent).not.toBe('B') // Cell changed from B
        expect(document.querySelector('#l1_1')).toHaveTextContent('A') // First letter should remain
    })
    it('should not delete anything if the row is empty', () => {
        // Verify initial empty state
        expect(currentWord).toBe('')
        expect(currentColumn).toBe(1)
        expect(document.querySelector('#l1_1')).toBeEmptyDOMElement()

        // Action: Try to delete from empty row
        deleteLastLetter()

        // Verification: Should remain unchanged
        expect(currentWord).toBe('')
        expect(currentColumn).toBe(1)
        expect(document.querySelector('#l1_1')).toBeEmptyDOMElement()

        // Try multiple deletes on empty row
        deleteLastLetter()
        deleteLastLetter()

        // Should still be unchanged
        expect(currentWord).toBe('')
        expect(currentColumn).toBe(1)
        expect(document.querySelector('#l1_1')).toBeEmptyDOMElement()
    })
    it('should not allow to validate if the row is not filled', () => {
        letterClick('A')
        letterClick('B')

        // Verify setup - only 2 letters
        expect(currentWord).toBe('AB')
        expect(currentColumn).toBe(3)

        // Action: Try to validate incomplete row
        validateLastRow()

        // Verification: Validation should be rejected, game state unchanged
        expect(currentRow).toBe(1) // Should stay at row 1
        expect(currentColumn).toBe(3) // Should stay at column 3
        expect(currentWord).toBe('AB') // Word should remain unchanged

        // No progression to next row should occur
        expect(document.querySelector('#l2_1')).toBeEmptyDOMElement()

        // No color hints should be applied since validation didn't proceed
        expect(document.querySelector('#l1_1')).not.toHaveClass('correct')
        expect(document.querySelector('#l1_1')).not.toHaveClass('present')
        expect(document.querySelector('#l1_1')).not.toHaveClass('absent')
    })

    describe('should validate correctly words with two equal letters', () => {
        it('first letter is correct, second is present', () => {
            letterClick('T')
            letterClick('O')
            letterClick('A')
            letterClick('S')
            letterClick('T')

            // Verify setup
            expect(currentWord).toBe('TOAST')
            expect(currentColumn).toBe(6)

            // Action: Validate the word
            validateLastRow()

            // Verification: Should proceed to next row, letters should be marked correctly
            expect(currentRow).toBe(2)
            expect(currentColumn).toBe(1)
            expect(currentWord).toBe('')

            // Check cell classes for correct hints
            expect(document.querySelector('#l1_1')).toHaveClass('correct')
            expect(document.querySelector('#l1_2')).toHaveClass('absent')
            expect(document.querySelector('#l1_3')).toHaveClass('absent')
            expect(document.querySelector('#l1_4')).toHaveClass('present')
            expect(document.querySelector('#l1_5')).toHaveClass('present')

            expect(
                document.querySelector('.keyboard__key[data-key="T"]')
            ).toHaveClass('correct')
            expect(
                document.querySelector('.keyboard__key[data-key="O"]')
            ).toHaveClass('absent')
            expect(
                document.querySelector('.keyboard__key[data-key="A"]')
            ).toHaveClass('absent')
            expect(
                document.querySelector('.keyboard__key[data-key="S"]')
            ).toHaveClass('present')
        })
        it('both letters are present', () => {
            letterClick('O')
            letterClick('T')
            letterClick('T')
            letterClick('O')
            letterClick('O')

            validateLastRow()

            expect(document.querySelector('#l1_1')).toHaveClass('absent')
            expect(document.querySelector('#l1_2')).toHaveClass('present')
            expect(document.querySelector('#l1_3')).toHaveClass('present')
            expect(document.querySelector('#l1_4')).toHaveClass('absent')
            expect(document.querySelector('#l1_5')).toHaveClass('absent')

            expect(
                document.querySelector('.keyboard__key[data-key="O"]')
            ).toHaveClass('absent')
            expect(
                document.querySelector('.keyboard__key[data-key="T"]')
            ).toHaveClass('present')
        })

        it('first letter is present, second is correct', () => {
            letterClick('O')
            letterClick('O')
            letterClick('T')
            letterClick('T')
            letterClick('O')

            validateLastRow()

            expect(document.querySelector('#l1_1')).toHaveClass('absent')
            expect(document.querySelector('#l1_2')).toHaveClass('absent')
            expect(document.querySelector('#l1_3')).toHaveClass('present')
            expect(document.querySelector('#l1_4')).toHaveClass('correct')
            expect(document.querySelector('#l1_5')).toHaveClass('absent')

            expect(
                document.querySelector('.keyboard__key[data-key="O"]')
            ).toHaveClass('absent')
            expect(
                document.querySelector('.keyboard__key[data-key="T"]')
            ).toHaveClass('correct')
        })

        it('should mark excess duplicate letters as absent', () => {
            letterClick('S')
            letterClick('T')
            letterClick('E')
            letterClick('E')
            letterClick('L')

            validateLastRow()

            expect(document.querySelector('#l1_1')).toHaveClass('present')
            expect(document.querySelector('#l1_2')).toHaveClass('present')
            expect(document.querySelector('#l1_3')).toHaveClass('present')
            expect(document.querySelector('#l1_4')).toHaveClass('absent')
            expect(document.querySelector('#l1_5')).toHaveClass('absent')
            expect(
                document.querySelector('.keyboard__key[data-key="S"]')
            ).toHaveClass('present')
            expect(
                document.querySelector('.keyboard__key[data-key="T"]')
            ).toHaveClass('present')
            expect(
                document.querySelector('.keyboard__key[data-key="E"]')
            ).toHaveClass('present')
            expect(
                document.querySelector('.keyboard__key[data-key="L"]')
            ).toHaveClass('absent')
        })

        it('test with multiple duplicate letters', () => {
            letterClick('S')
            letterClick('T')
            letterClick('E')
            letterClick('E')
            letterClick('E')

            validateLastRow()

            expect(document.querySelector('#l1_1')).toHaveClass('present')
            expect(document.querySelector('#l1_2')).toHaveClass('present')
            expect(document.querySelector('#l1_3')).toHaveClass('present')
            expect(document.querySelector('#l1_4')).toHaveClass('absent')
            expect(document.querySelector('#l1_5')).toHaveClass('absent')
            expect(
                document.querySelector('.keyboard__key[data-key="S"]')
            ).toHaveClass('present')
            expect(
                document.querySelector('.keyboard__key[data-key="T"]')
            ).toHaveClass('present')
            expect(
                document.querySelector('.keyboard__key[data-key="E"]')
            ).toHaveClass('present')
        })
    })
})
describe('endgame', () => {
    beforeEach(() => {
        // Set up the actual DOM structure from index.html
        document.body.innerHTML = html
        localStorage.clear()
        vi.clearAllMocks()
        vi.useFakeTimers()

        // Reset game state to initial values
        setCurrentRow(1)
        setCurrentColumn(1)
        setCurrentTry(1)
        setCurrentWord('')
    })
    it('should show end modal if user validates a correct row', () => {
        letterClick('T')
        letterClick('E')
        letterClick('S')
        letterClick('T')
        letterClick('S')

        // Verify modal is not active before validation
        expect(document.querySelector('.modal')).not.toHaveClass('active')

        // Action: Validate the correct word (using setTimeout in the actual function)
        validateLastRow()

        // Verification: Modal should be activated after setTimeout
        vi.advanceTimersByTime(1500)
        expect(document.querySelector('.modal')).toHaveClass('active')
        expect(currentWord).toBe('')
        expect(document.querySelector('#l1_1')).toHaveClass('correct')
    })
    it('should fill the modal stats correctly when win', () => {
        letterClick('T')
        letterClick('E')
        letterClick('S')
        letterClick('T')
        letterClick('S')

        // Action: Validate the correct word
        validateLastRow()

        // Verification: Modal should show stats correctly
        const modal = document.querySelector('.modal')

        vi.advanceTimersByTime(1500)
        expect(modal).toHaveClass('active')

        // Check if stats are filled correctly
        expect(modal?.querySelector('#stats-points')).toHaveTextContent('6')
        expect(modal?.querySelector('#stats-word')).toHaveTextContent('TESTS')
    })
    it('should fill the modal stats correctly when loose', () => {
        // Setup: Fill all 6 rows with valid but incorrect words
        const words = ['HOUSE', 'MOUSE', 'LOUSE', 'DOUSE', 'ROUSE', 'SOUSE']
        for (let i = 0; i < 6; i++) {
            setCurrentRow(i + 1)
            setCurrentColumn(1)
            setCurrentWord('')

            const word = words[i]
            for (const letter of word) {
                letterClick(letter)
            }

            validateLastRow()
        }
        // Verification: After 6th row validation, modal should show
        vi.advanceTimersByTime(1500)

        const modal = document.querySelector('.modal')
        expect(modal).toHaveClass('active')

        // Check if stats are filled correctly
        expect(modal?.querySelector('#stats-points')).toHaveTextContent('0')
        expect(modal?.querySelector('#stats-word')).toHaveTextContent('TESTS')
    })

    it('should not be able to modify board after win', () => {
        letterClick('T')
        letterClick('E')
        letterClick('S')
        letterClick('T')
        letterClick('S')

        // Action: Validate the correct word
        validateLastRow()

        // Verification: Modal should show and game should be in won state
        vi.advanceTimersByTime(1500)
        expect(document.querySelector('.modal')).toHaveClass('active')

        // Try to click a letter after winning
        letterClick('A')
        expect(document.querySelector('#l1_1')).not.toHaveTextContent('A')

        // Try to delete a letter after winning
        deleteLastLetter()
        expect(document.querySelector('#l1_5')).not.toHaveTextContent('')
    })

    it('should not be able to modify board after loose', () => {
        // Setup: Fill all 6 rows with valid but incorrect words
        const words = ['HOUSE', 'MOUSE', 'LOUSE', 'DOUSE', 'ROUSE', 'SOUSE']
        for (let i = 0; i < 6; i++) {
            setCurrentRow(i + 1)
            setCurrentColumn(1)
            setCurrentWord('')

            const word = words[i]
            for (const letter of word) {
                letterClick(letter)
            }

            validateLastRow()
        }

        // Verification: After 6th row validation, modal should show
        vi.advanceTimersByTime(1500)
        expect(document.querySelector('.modal')).toHaveClass('active')

        // Try to click a letter after losing
        letterClick('A')
        expect(document.querySelector('#l6_1')).not.toHaveTextContent('A')

        // Try to delete a letter after losing
        deleteLastLetter()
        expect(document.querySelector('#l6_5')).not.toHaveTextContent('')
    })

    it('should show end modal if user loose the game', () => {
        // Setup: Fill all 6 rows with valid but incorrect words
        const words = ['HOUSE', 'MOUSE', 'LOUSE', 'DOUSE', 'ROUSE', 'SOUSE']

        for (let i = 0; i < 6; i++) {
            setCurrentRow(i + 1)
            setCurrentColumn(1)
            setCurrentWord('')

            const word = words[i]
            for (const letter of word) {
                letterClick(letter)
            }

            validateLastRow()
        }

        // Verification: After 6th row validation, modal should show
        vi.advanceTimersByTime(1500)
        expect(document.querySelector('.modal')).toHaveClass('active')

        // All 6 rows should have words
        expect(document.querySelector('#l1_1')).toHaveTextContent('H')
        expect(document.querySelector('#l2_1')).toHaveTextContent('M')
        expect(document.querySelector('#l3_1')).toHaveTextContent('L')
        expect(document.querySelector('#l4_1')).toHaveTextContent('D')
        expect(document.querySelector('#l5_1')).toHaveTextContent('R')
        expect(document.querySelector('#l6_1')).toHaveTextContent('S')

        // Game should be in lost state
        expect(currentWord).toBe('')
    })
})
