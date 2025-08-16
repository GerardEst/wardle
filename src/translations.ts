export type Language = 'es' | 'en'

export interface Translations {
    // Meta information
    title: string
    description: string
    keywords: string

    // Game feedback
    invalidWord: string

    // Modal and stats
    modalStatsTitle: string
    gamesPlayed: string
    totalPoints: string
    averagePoints: string
    currentStreak: string
    maxStreak: string
    word: string
    points: string
    time: string
    averageTime: string
    shareAttempts: string
    share: string

    // Menu and league
    activeLeague: string
    firstPrize: string
    secondPrize: string
    thirdPrize: string
    createLeague: string
    moreInfo: string

    // UI elements
    languageSelector: string
    openMenu: string
    closeMenu: string
    closeModal: string

    // League specific content
    leagueName: string
    leaguePeriod: string
    botDescription: string
    telegramBotUrl: string

    // Prizes
    firstPrizeContent: string
    secondPrizeContent: string
    thirdPrizeContent: string

    // Alt texts and accessibility
    altOpenMenu: string
    altCloseMenu: string
    altCloseModal: string
    altShare: string
    altCaution: string
    altIntro: string
    altBackspace: string
    altOpenExternal: string

    // Game result messages
    resultPerfect: string // "ESCANDALÓSO!"
    resultAmazing: string // "Increíble!"
    resultImpressive: string // "Impresionante!"
    resultGood: string // "Muy bien!"
    resultDone: string // "Hecho!"
    resultClose: string // "Por los pelos!"
    resultFailed: string // "Vaya..."

    // Menu section title
    dataTitle: string // "DATOS"

    // Footer/credits
    basedOnGame: string // "Basado en el juego"
    byAuthor: string // "de"

    // Share message
    shareGameName: string
    shareLink: string
}

export const translations: Record<Language, Translations> = {
    es: {
        // Meta information
        title: 'Wardle - Compite en Wordle con tus amigos en ligas mensuales',
        description:
            'Ligas wordle és un juego de palabras en español inspirado en Wordle, que permite añadir un bot a un grupo de telegram para competir en ligas mensuales, dar premios, añadir personajes y más!',
        keywords:
            'wardle, ligas wordle, juego palabras, español, wordle español, adivina palabra, juego diario, lengua española',

        // Game feedback
        invalidWord: 'No és una palabra válida',

        // Modal and stats
        modalStatsTitle: 'Estadísticas',
        gamesPlayed: 'Partidas jugadas',
        totalPoints: 'Puntos totales',
        averagePoints: 'Media de puntos',
        currentStreak: 'Racha actual',
        maxStreak: 'Racha máxima',
        word: 'Palabra',
        points: 'Puntos',
        time: 'Tiempo',
        averageTime: 'Media de tiempo',
        shareAttempts: 'Compartir intentos',
        share: 'Compartir',

        // Menu and league
        activeLeague: 'Liga activa',
        firstPrize: 'Primer premio',
        secondPrize: 'Segundo premio',
        thirdPrize: 'Tercer premio',
        createLeague: 'Crea una liga',
        moreInfo: 'Más información',

        // UI elements
        languageSelector: 'Idioma',
        openMenu: 'Abrir menú',
        closeMenu: 'Cerrar menú',
        closeModal: 'Cerrar modal',

        // League specific content
        leagueName: '💃🏻 Lliga Major',
        leaguePeriod: "1 - 31 d'Agost",
        botDescription:
            'Crea una liga privada en un grupo de Telegram, sin registros, añadiendo wardle_es_bot',
        telegramBotUrl: 'https://t.me/mooot_cat_bot?startgroup=true',

        // Prizes
        firstPrizeContent: "🥇🥃 Ratafia d'or",
        secondPrizeContent: '🥈🍺 Birra de plata',
        thirdPrizeContent: '🥉🍹 Cubata de bronze',

        // Alt texts and accessibility
        altOpenMenu: 'Abrir menú',
        altCloseMenu: 'Cerrar menú',
        altCloseModal: 'Cerrar modal',
        altShare: 'Compartir',
        altCaution: 'Peligro',
        altIntro: 'Intro teclado',
        altBackspace: 'Borrar teclado',
        altOpenExternal: 'Abrir en una pestaña nueva',

        // Game result messages
        resultPerfect: 'ESCANDALÓSO!',
        resultAmazing: 'Increíble!',
        resultImpressive: 'Impresionante!',
        resultGood: 'Muy bien!',
        resultDone: 'Hecho!',
        resultClose: 'Por los pelos!',
        resultFailed: 'Vaya...',

        // Menu section title
        dataTitle: 'DATOS',

        // Footer/credits
        basedOnGame: 'Basado en el juego',
        byAuthor: 'de',

        // Share message
        shareGameName: 'wardle_es',
        shareLink: 'wardle.day/es',
    },
    en: {
        // Meta information
        title: 'Wardle - Compete in Wordle with your friends in monthly leagues',
        description:
            'Wardle is a word game in English inspired by Wordle, allowing you to add a bot to a Telegram group to compete in monthly leagues, give prizes, add characters and more!',
        keywords:
            'wardle, wordle leagues, word game, english, wordle english, guess word, daily game, english language',

        // Game feedback
        invalidWord: 'Not a valid word',

        // Modal and stats
        modalStatsTitle: 'Statistics',
        gamesPlayed: 'Games played',
        totalPoints: 'Total points',
        averagePoints: 'Average points',
        currentStreak: 'Current streak',
        maxStreak: 'Max streak',
        word: 'Word',
        points: 'Points',
        time: 'Time',
        averageTime: 'Average time',
        shareAttempts: 'Share attempts',
        share: 'Share',

        // Menu and league
        activeLeague: 'Active league',
        firstPrize: 'First prize',
        secondPrize: 'Second prize',
        thirdPrize: 'Third prize',
        createLeague: 'Create league',
        moreInfo: 'More info',

        // UI elements
        languageSelector: 'Language',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        closeModal: 'Close modal',

        // League specific content
        leagueName: '💃🏻 Major League',
        leaguePeriod: 'August 1 - 31',
        botDescription:
            'Create a private league in a Telegram group, no registration required, by adding wardle_en_bot',
        telegramBotUrl: 'https://t.me/wardle_en_bot?startgroup=true',

        // Prizes
        firstPrizeContent: '🥇🥃 Golden Whiskey',
        secondPrizeContent: '🥈🍺 Silver Beer',
        thirdPrizeContent: '🥉🍹 Bronze Cocktail',

        // Alt texts and accessibility
        altOpenMenu: 'Open menu',
        altCloseMenu: 'Close menu',
        altCloseModal: 'Close modal',
        altShare: 'Share',
        altCaution: 'Warning',
        altIntro: 'Enter key',
        altBackspace: 'Delete key',
        altOpenExternal: 'Open in new tab',

        // Game result messages
        resultPerfect: 'AMAZING!',
        resultAmazing: 'Incredible!',
        resultImpressive: 'Impressive!',
        resultGood: 'Well done!',
        resultDone: 'Done!',
        resultClose: 'Close call!',
        resultFailed: 'Oh well...',

        // Menu section title
        dataTitle: 'DATA',

        // Footer/credits
        basedOnGame: 'Based on the game',
        byAuthor: 'by',

        // Share message
        shareGameName: 'wardle_en',
        shareLink: 'wardle.day/en',
    },
}
