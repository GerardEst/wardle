import { showFeedback, showModal, updateCell, updateKey } from './dom-utils'
import * as words from './words-module'
import {
    saveToLocalStorage,
    getTimeTrialKey,
    getTodayTimeKey,
} from './storage-module'
import type { storedRow } from './storage-module'
import {
    editLinkToDictionary,
    fillModalStats,
    updateMenuData,
    updateStoredStats,
} from './stats-module'
import { getCurrentLanguage, getString } from './language-module'

export let currentRow = 1
export let currentColumn = 1
export let currentTry = 1
export let currentWord = ''

export function setCurrentRow(to: number) {
    currentRow = to
}

export function setCurrentColumn(to: number) {
    currentColumn = to
}

export function setCurrentWord(to: string) {
    currentWord = to
}

export function setCurrentTry(to: number) {
    currentTry = to
}

export function moveToNextRow() {
    currentRow++
    currentTry++
}

export function checkWord(word: string) {
    const cleanWord = word.toUpperCase().trim()

    if (cleanWord === words.getTodayWord().toUpperCase()) {
        return 'correct'
    }

    if (words.wordExists(cleanWord)) return 'next'

    return 'invalid'
}

export function letterClick(letter: string) {
    if (
        currentColumn === 1 &&
        currentRow === 1 &&
        !localStorage.getItem(getTimeTrialKey())
    ) {
        localStorage.setItem(getTimeTrialKey(), new Date().toISOString())
    }
    if (currentColumn > 5) return
    if (currentColumn === 3) {
        words.loadDiccData()
        words.loadWordsData()
    }

    updateCell(currentRow, currentColumn, letter)

    currentWord += letter
    currentColumn++
}

export function deleteLastLetter() {
    if (currentColumn <= 1) return

    currentColumn--
    updateCell(currentRow, currentColumn, ' ')
    currentWord = currentWord.slice(0, -1)
}

export function validateLastRow() {
    if (currentWord.length !== 5) return

    const rowStatus = checkWord(currentWord)
    if (rowStatus === 'correct') {
        showHints(currentWord, words.getTodayWord(), currentRow)
        saveToLocalStorage(currentWord, currentRow)

        const time = calculateTime()
        localStorage.removeItem(getTimeTrialKey())
        localStorage.setItem(getTodayTimeKey(), time)

        updateStoredStats(7 - currentTry, time)
        fillModalStats(7 - currentTry, time)
        updateMenuData()

        currentRow = 0
        setTimeout(() => {
            showModal()
            editLinkToDictionary(words.getTodayNiceWord())
        }, 1000)
    } else if (rowStatus === 'invalid') {
        showFeedback(getString('invalidWord'))
        currentColumn = 1
        cleanRow(currentRow)
    } else {
        showHints(currentWord, words.getTodayWord(), currentRow)
        saveToLocalStorage(currentWord, currentRow)

        if (currentRow >= 6) {
            const time = calculateTime()
            localStorage.removeItem(getTimeTrialKey())
            localStorage.setItem(getTodayTimeKey(), time)

            updateStoredStats(0, time)
            fillModalStats(0, time)
            updateMenuData()

            setTimeout(() => {
                showModal()
                editLinkToDictionary(words.getTodayNiceWord())
            }, 1000)
        }
        currentColumn = 1
        currentRow++
        currentTry++
    }
    currentWord = ''
}

export function fillRow(row: storedRow) {
    for (let i = 1; i <= 5; i++) {
        updateCell(row.row, i, row.word[i - 1])
    }
    showHints(row.word, words.getTodayWord(), row.row)

    setCurrentRow(row.row)
    setCurrentTry(row.row)
    setCurrentColumn(1)
    setCurrentWord('')
}

export function cleanRow(row: number) {
    for (let i = 1; i <= 5; i++) updateCell(row, i, '')
}

export function showHints(guess: string, target: string, row: number) {
    const guessLetters = guess.toUpperCase().split('')
    const targetLetters = target.toUpperCase().split('')

    for (let i = 0; i < 5; i++) {
        const letter = guessLetters[i]

        if (letter === targetLetters[i]) {
            updateCell(row, i + 1, undefined, 'correct')
            updateKey(letter, 'correct')
        } else if (!targetLetters.includes(letter)) {
            updateCell(row, i + 1, undefined, 'absent')
            updateKey(letter, 'absent')
        } else {
            updateCell(row, i + 1, undefined, 'present')
            updateKey(letter, 'present')
        }
    }

    // Second pass: fix incorrect "present" markings for duplicate letters
    for (let i = 0; i < 5; i++) {
        const cell = document.querySelector(`#l${row}_${i + 1}`)

        const guessLetter = guessLetters[i]

        // Skip if this cell is already correct or absent
        if (
            cell!.classList.contains('correct') ||
            cell!.classList.contains('absent')
        ) {
            continue
        }

        // Count how many times this letter appears in the target word
        const targetCount = targetLetters.filter(
            (letter) => letter === guessLetter
        ).length

        // Count how many of this letter are already marked as correct
        const correctCount = guessLetters.filter(
            (letter, index) =>
                letter === guessLetter &&
                guessLetters[index] === targetLetters[index]
        ).length

        // Count how many of this letter should be marked as present (before this position)
        let presentCount = 0
        for (let j = 0; j < i; j++) {
            if (
                guessLetters[j] === guessLetter &&
                guessLetters[j] !== targetLetters[j] &&
                targetLetters.includes(guessLetters[j])
            ) {
                presentCount++
            }
        }

        // If we've already accounted for all instances of this letter in the target,
        // this one should be marked as absent
        if (correctCount + presentCount >= targetCount) {
            cell!.classList.remove('present')
            cell!.classList.add('absent')
        }
    }
}

function calculateTime(): string {
    const startTime = localStorage.getItem(getTimeTrialKey())
    if (!startTime) return '00:00:00'

    const startDate = new Date(startTime)
    const endDate = new Date()

    const diff = endDate.getTime() - startDate.getTime()
    const seconds = Math.floor((diff / 1000) % 60)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const hours = Math.floor(diff / (1000 * 60 * 60))

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
        2,
        '0'
    )}:${String(seconds).padStart(2, '0')}`
}

export function cleanGameboard() {
    // Clear the game board
    for (let row = 1; row <= 6; row++) {
        for (let col = 1; col <= 5; col++) {
            const cell = document.getElementById(`l${row}_${col}`)
            if (cell) {
                cell.textContent = ''
                cell.className = 'wordgrid__cell'
            }
        }
    }

    // Reset keyboard colors
    const keys = document.querySelectorAll('.keyboard__key')
    keys.forEach((key) => {
        key.classList.remove('correct', 'present', 'absent')
    })

    // Clear feedback
    const feedback = document.querySelector('.feedback p')
    if (feedback) feedback.textContent = '...'

    // Close any open modal
    const modal = document.querySelector('.modal')
    if (modal && modal.classList.contains('show')) {
        modal.classList.remove('show')
    }
}

export function resetGameState() {
    currentRow = 1
    currentColumn = 1
    currentTry = 1
    currentWord = ''
}

export function updateKeyboardLayout() {
    const ñKey = document.querySelector('[data-key="Ñ"]') as HTMLElement
    if (ñKey) {
        ñKey.style.display = getCurrentLanguage() === 'es' ? 'flex' : 'none'
    }
}
