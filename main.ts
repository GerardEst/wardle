import * as words from './src/words-module.js'
import {
    runStorageCheck,
    loadStoredGame,
    getTodayTime,
} from './src/storage-module.js'
import * as gameboard from './src/gameboard-module.ts'
import { updateMenuData } from './src/stats-module.js'
import { shareResult } from './src/share-utils.ts'
import { closeMenu, closeModal, openMenu } from './src/dom-utils.ts'
import { initializeLanguage, switchLanguage } from './src/language-module'
//import { Language } from './src/translations.ts'

// Initialize language first
initializeLanguage()

// We run storage checks at web loading and when visibilitychange
// to ensure even with cached content and not closing pages, it refreshes every day
runStorageCheck()
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        runStorageCheck()
    }
})

async function init() {
    initDOMEvents()
    initLanguageChangeListener()
    loadStoredGame()
    updateMenuData()
}

init()

function initLanguageChangeListener() {
    document.addEventListener('languageChanged', async () => {
        // Reset game state and reload data for new language
        gameboard.resetGameState()
        words.resetLanguageCache()

        // Update keyboard visibility
        gameboard.updateKeyboardLayout()

        // Reload game for new language with modal delay
        await loadStoredGame(true)
        updateMenuData()
    })
}

function initDOMEvents() {
    const keys = document.querySelectorAll('.keyboard__key')
    const backspace = document.querySelector('.keyboard__back')
    const enter = document.querySelector('.keyboard__enter')
    const shareButton = document.querySelector('#share')
    const shareOpenButton = document.querySelector('#shareOpen')
    const modalCloseButton = document.querySelector('#modal-close')
    const menuCloseButton = document.querySelector('#closeMenu')
    const menuOpenButton = document.querySelector('#openMenu')
    const selector = document.querySelector('#languageSelector')

    keys!.forEach((key) => {
        key.addEventListener('click', (event) => {
            gameboard.letterClick(event.target.dataset.key)
        })
    })

    backspace!.addEventListener('click', () => {
        gameboard.deleteLastLetter()
    })

    enter!.addEventListener('click', () => {
        gameboard.validateLastRow()
    })

    // Share events
    shareButton!.addEventListener('click', () => {
        shareResult(
            false,
            words.getTodayWordIndex(),
            gameboard.currentTry,
            getTodayTime()
        )
    })
    shareOpenButton!.addEventListener('click', () => {
        shareResult(
            true,
            words.getTodayWordIndex(),
            gameboard.currentTry,
            getTodayTime()
        )
    })

    // Language events
    selector!.addEventListener('change', (e) => {
        const newLang = (e.target as HTMLSelectElement).value as Language
        switchLanguage(newLang)
    })

    // Modal events
    modalCloseButton!.addEventListener('click', closeModal)

    // Menu events
    menuOpenButton!.addEventListener('click', openMenu)
    menuCloseButton!.addEventListener('click', closeMenu)
}
