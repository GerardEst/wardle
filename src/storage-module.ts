import { showModal } from './dom-utils.ts'
import * as gameboard from './gameboard-module.ts'
import { editLinkToDictionary, fillModalStats } from './stats-module.ts'
import {
    getTodayNiceWord,
    getTodayWord,
    loadWordsData,
} from './words-module.ts'
import { getCurrentLanguage } from './language-module'

export interface storedRow {
    row: number
    word: string
    date: string
}

function getGameDataKey(): string {
    const lang = getCurrentLanguage()
    return `wardle_${lang}_gamedata`
}

export function getTimeTrialKey(): string {
    const lang = getCurrentLanguage()
    return `timetrial-start-${lang}`
}

export function getTodayTimeKey(): string {
    const lang = getCurrentLanguage()
    return `todayTime-${lang}`
}

export async function loadStoredGame(delayModal: boolean = false) {
    const storedData = localStorage.getItem(getGameDataKey())
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

        const time = localStorage.getItem(getTodayTimeKey()) || null

        const showModalWithDelay = () => {
            if (delayModal) {
                setTimeout(() => showModal(), 1000)
            } else {
                showModal()
            }
        }

        if (playerWon) {
            fillModalStats(7 - gameboard.currentTry, time)
            editLinkToDictionary(getTodayNiceWord())
            gameboard.setCurrentRow(0)

            showModalWithDelay()
        } else if (playerLost) {
            fillModalStats(0, time)
            editLinkToDictionary(getTodayNiceWord())
            gameboard.setCurrentRow(0)
            gameboard.setCurrentTry(7)

            showModalWithDelay()
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

    const currentStored = localStorage.getItem(getGameDataKey())

    if (currentStored) {
        const savedData = JSON.parse(currentStored)
        savedData.push(dataToSave)
        localStorage.setItem(getGameDataKey(), JSON.stringify(savedData))
    } else {
        localStorage.setItem(getGameDataKey(), JSON.stringify([dataToSave]))
    }
}

export function runStorageCheck() {
    const storedGame = localStorage.getItem(getGameDataKey())
    if (storedGame) {
        const storedGameData = JSON.parse(storedGame)
        const storedGameTime = storedGameData[0]?.date
        const cleanedLocalStorage = checkCleanLocalStorage(storedGameTime)
        if (cleanedLocalStorage) gameboard.cleanGameboard()
    }
}

export function checkCleanLocalStorage(localDate: string) {
    const date = new Date(localDate)
    const today = new Date()

    if (date.toDateString() !== today.toDateString()) {
        console.warn('Saved data is not from today, clearing')
        localStorage.removeItem(getGameDataKey())
        localStorage.removeItem(getTimeTrialKey())
        localStorage.removeItem(getTodayTimeKey())

        return true
    }

    console.log('Saved data is from today, will use it')
    return false
}

export function getTodayTime() {
    const time = localStorage.getItem(getTodayTimeKey())
    if (time && time !== '-') {
        return time
    }

    return '00:00:00'
}
