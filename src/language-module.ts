import { cleanGameboard, updateKeyboardLayout } from './gameboard-module'
import { translations, type Language, type Translations } from './translations'

let currentLanguage: Language = 'es'

export function getCurrentLanguage(): Language {
    return currentLanguage
}

function setLanguage(lang: Language): void {
    currentLanguage = lang
    localStorage.setItem('wardle_language', lang)
    updatePageLanguage()
}

export function getString(key: keyof Translations): string {
    return translations[currentLanguage][key] || key
}

export function initializeLanguage(): Language {
    // Check URL path first
    const path = window.location.pathname
    let langFromPath: Language | null = null

    if (path.startsWith('/es') || path === '/es') {
        langFromPath = 'es'
    } else if (path.startsWith('/en') || path === '/en') {
        langFromPath = 'en'
    }

    if (langFromPath) {
        currentLanguage = langFromPath
        localStorage.setItem('wardle_language', langFromPath)
        updatePageLanguage()
        return currentLanguage
    }

    // Check localStorage for fallback
    const storedLang = localStorage.getItem('wardle_language') as Language
    if (storedLang && (storedLang === 'es' || storedLang === 'en')) {
        currentLanguage = storedLang
        // Redirect to the correct path if we're on root
        if (path === '/' || path === '') {
            window.history.replaceState({}, '', `/${storedLang}`)
        }
        updatePageLanguage()
        return currentLanguage
    }

    // Default to Spanish and redirect to /es
    currentLanguage = 'es'
    localStorage.setItem('wardle_language', 'es')
    if (path === '/' || path === '') {
        window.history.replaceState({}, '', '/es')
    }
    updatePageLanguage()
    return currentLanguage
}

function updatePageLanguage(): void {
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage

    // Update page title and meta description
    document.title = getString('title')
    const descriptionMeta = document.querySelector('meta[name="description"]')
    if (descriptionMeta) {
        descriptionMeta.setAttribute('content', getString('description'))
    }

    const keywordsMeta = document.querySelector('meta[name="keywords"]')
    if (keywordsMeta) {
        keywordsMeta.setAttribute('content', getString('keywords'))
    }

    // Update text content throughout the page
    updateTextContent()

    // Update keyboard layout
    updateKeyboardLayout()
}

function updateTextContent(): void {
    // Update all elements with data-i18n attribute
    const translatableElements = document.querySelectorAll('[data-i18n]')
    translatableElements.forEach((element) => {
        const key = element.getAttribute('data-i18n') as keyof Translations
        if (key) {
            element.textContent = getString(key)
        }
    })

    // Update all elements with data-i18n-alt attribute (for alt text)
    const altElements = document.querySelectorAll('[data-i18n-alt]')
    altElements.forEach((element) => {
        const key = element.getAttribute('data-i18n-alt') as keyof Translations
        if (key) {
            element.setAttribute('alt', getString(key))
        }
    })

    // Update all elements with data-i18n-href attribute (for URLs that change by language)
    const hrefElements = document.querySelectorAll('[data-i18n-href]')
    hrefElements.forEach((element) => {
        const key = element.getAttribute('data-i18n-href') as keyof Translations
        if (key) {
            element.setAttribute('href', getString(key))
        }
    })

    // Update all elements with data-i18n-letters attribute (for letter-by-letter display)
    const letterElements = document.querySelectorAll('[data-i18n-letters]')
    letterElements.forEach((element) => {
        const key = element.getAttribute(
            'data-i18n-letters'
        ) as keyof Translations
        if (key) {
            const text = getString(key)
            // Clear existing content and rebuild with new text
            element.innerHTML = ''
            for (const letter of text) {
                const span = document.createElement('span')
                span.textContent = letter
                element.appendChild(span)
            }
        }
    })
}

export function switchLanguage(newLang: Language): void {
    if (newLang === currentLanguage) return

    setLanguage(newLang)

    // Update URL path without refreshing
    const newPath = `/${newLang}`
    window.history.pushState({}, '', newPath)

    // Trigger game reset in other modules
    const resetEvent = new CustomEvent('languageChanged', {
        detail: { language: currentLanguage },
    })
    document.dispatchEvent(resetEvent)

    cleanGameboard()
}
