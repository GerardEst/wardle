import { showModal } from './dom-utils.ts'
import * as gameboard from './gameboard-module.ts'
import { editLinkToDictionary, fillModalStats } from './stats-module.ts'
import {
    getTodayNiceWord,
    getTodayWord,
    loadWordsData,
} from './words-module.ts'

export interface storedRow {
    row: number
    word: string
    date: string
}

export async function loadStoredGame() {
    const storedData = localStorage.getItem('moootGameData')
    if (storedData) {
        const storedGame = JSON.parse(storedData)
        await loadWordsData()

        storedGame.forEach((row: storedRow) => gameboard.fillRow(row))

        const playerWon =
            gameboard.currentTry <= 6 &&
            storedGame.at(-1).word.toUpperCase() ===
                getTodayWord().toUpperCase()

        const playerLost =
            gameboard.currentTry === 6 &&
            storedGame.at(-1).word.toUpperCase() !==
                getTodayWord().toUpperCase()

        const time = localStorage.getItem('todayTime') || null

        if (playerWon) {
            fillModalStats(7 - gameboard.currentTry, time)
            editLinkToDictionary(getTodayNiceWord())
            gameboard.setCurrentRow(0)

            showModal()
        } else if (playerLost) {
            fillModalStats(0, time)
            editLinkToDictionary(getTodayNiceWord())
            gameboard.setCurrentRow(0)
            gameboard.setCurrentTry(7)

            showModal()
        } else {
            gameboard.moveToNextRow()
        }
    }
}

export function saveToLocalStorage(word: string, row: number) {
    const dataToSave: storedRow = {
        word: word,
        row: row,
        date: new Date().toISOString(),
    }

    const currentStored = localStorage.getItem('moootGameData')

    if (currentStored) {
        const savedData = JSON.parse(currentStored)
        savedData.push(dataToSave)
        localStorage.setItem('moootGameData', JSON.stringify(savedData))
    } else {
        localStorage.setItem('moootGameData', JSON.stringify([dataToSave]))
    }
}

export function runStorageCheck() {
    const storedGame = localStorage.getItem('moootGameData')
    if (storedGame) {
        const storedGameData = JSON.parse(storedGame)
        const storedGameTime = storedGameData[0]?.date
        const cleanedLocalStorage = checkCleanLocalStorage(storedGameTime)
        if (cleanedLocalStorage) cleanGameboard()
    }
}

export function checkCleanLocalStorage(localDate: string) {
    const date = new Date(localDate)
    const today = new Date()

    if (date.toDateString() !== today.toDateString()) {
        console.warn('Saved data is not from today, clearing')
        localStorage.removeItem('moootGameData')
        localStorage.removeItem('timetrial-start')
        localStorage.removeItem('todayTime')

        return true
    }

    console.log('Saved data is from today, will use it')
    return false
}

export function cleanGameboard() {
    // Clean game cells
    for (let row = 1; row <= 6; row++) {
        for (let col = 1; col <= 5; col++) {
            const cell = document.querySelector(`#l${row}_${col}`)
            if (cell) {
                cell.textContent = ''
                cell.classList.remove('correct', 'present', 'absent')
            }
        }
    }

    // Clean keyboard
    document.querySelectorAll('.keyboard__key').forEach((key) => {
        key.classList.remove('correct', 'present', 'absent')
    })
}

export function getTodayTime() {
    const time = localStorage.getItem('todayTime')
    if (time && time !== '-') {
        return time
    }

    return '00:00:00'
}
