import { getCurrentLanguage, type Language } from './language-module'

let dicc: Record<Language, Set<string>> = { es: null, en: null }
let diccPromises: Record<Language, Promise<Set<string>> | null> = { es: null, en: null }
let allWords: Record<Language, { [key: string]: string }> = { es: null, en: null }
let wordsPromises: Record<Language, Promise<{ [key: string]: string }> | null> = { es: null, en: null }
let todayWord: Record<Language, string | null> = { es: null, en: null }
let todayWordIndex: Record<Language, number | null> = { es: null, en: null }

export async function loadDiccData() {
    const lang = getCurrentLanguage()
    
    if (dicc[lang]) {
        console.log(`Dictionary already loaded for ${lang}`)
        return
    }

    // Prevent multiple simultaneous requests
    if (!diccPromises[lang]) {
        diccPromises[lang] = fetchDictionary()
    }

    return await diccPromises[lang]
}

export async function fetchDictionary() {
    const lang = getCurrentLanguage()
    console.log(`Fetching the complete dictionary for ${lang}`)

    if (dicc[lang]) {
        console.log(`Dictionary already loaded for ${lang}`)
        return dicc[lang]
    }

    const diccFetch = await fetch(`/assets/${lang}/dicc.json`, {
        cache: 'force-cache',
    })
    const diccJson = await diccFetch.json()

    dicc[lang] = new Set(diccJson)

    return dicc[lang]
}

export async function loadWordsData() {
    const lang = getCurrentLanguage()
    
    if (allWords[lang]) {
        console.log(`Words already loaded for ${lang}`)
        return
    }

    // Prevent multiple simultaneous requests
    if (!wordsPromises[lang]) {
        wordsPromises[lang] = fetchWords()
    }

    return await wordsPromises[lang]
}

export async function fetchWords() {
    const lang = getCurrentLanguage()
    console.log(`Fetching all the possible words for ${lang}`)

    const wordsFetch = await fetch(`/assets/${lang}/words.json`)
    allWords[lang] = await wordsFetch.json()

    return allWords[lang]
}

export function wordExists(word: string) {
    const lang = getCurrentLanguage()
    
    if (!dicc[lang]) {
        console.warn(
            `Dictionary not loaded yet for ${lang}, returning false for word:`,
            word
        )
        return false
    }
    return dicc[lang].has(word)
}

export function getTodayWord() {
    const lang = getCurrentLanguage()
    
    if (todayWord[lang]) return todayWord[lang]

    const todayIndex = getTodayWordIndex()
    const wordsArray = Object.keys(allWords[lang] || {})
    todayWord[lang] = wordsArray[todayIndex]

    return todayWord[lang]
}

export function getTodayNiceWord() {
    const lang = getCurrentLanguage()
    const word = getTodayWord()
    return allWords[lang][word.toLowerCase()].toUpperCase()
}

export function getTodayWordIndex() {
    const lang = getCurrentLanguage()
    
    if (todayWordIndex[lang]) return todayWordIndex[lang]

    const startDate = '2025-07-18'
    const currentDate = new Date()
    const gameStartDate = new Date(startDate)

    // Normalize both dates to midnight UTC to avoid timezone issues
    const normalizedStartDate = new Date(
        Date.UTC(
            gameStartDate.getFullYear(),
            gameStartDate.getMonth(),
            gameStartDate.getDate()
        )
    )

    const normalizedCurrentDate = new Date(
        Date.UTC(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
        )
    )

    // Calculate days elapsed since start date
    const millisecondsPerDay = 24 * 60 * 60 * 1000
    const daysElapsed = Math.floor(
        (normalizedCurrentDate.getTime() - normalizedStartDate.getTime()) /
            millisecondsPerDay
    )

    // Handle negative days (before start date) by returning 0
    if (daysElapsed < 0) return 0

    // Return index using modulo to cycle through word list
    const wordsLength = allWords[lang] ? Object.keys(allWords[lang]).length : 1
    todayWordIndex[lang] = daysElapsed % wordsLength

    return todayWordIndex[lang]
}

export function resetLanguageCache() {
    const lang = getCurrentLanguage()
    // Reset cached values for current language to force fresh fetch
    todayWord[lang] = null
    todayWordIndex[lang] = null
}
