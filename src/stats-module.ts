import { updateMenuStat, updateStat } from './dom-utils'
import { getTodayNiceWord } from './words-module'

interface storedStats {
    games: number
    totalPoints: number
    averagePoints: number
    streak: number
    maxStreak: number
    averageTime?: string // Format: hh:mm:ss
}

export function getStoredStats() {
    const storedStats = localStorage.getItem('stats')
    if (!storedStats) {
        console.warn('There are no stored stats')
        return
    }
    return JSON.parse(storedStats) as storedStats
}

export function updateStoredStats(
    todayPoints: number,
    todayTime: string | null
) {
    console.log('Updating stored stats')

    const stats = JSON.parse(
        localStorage.getItem('stats') || '{}'
    ) as storedStats

    const currentGames = stats?.games || 0
    const currentTotalPoints = stats?.totalPoints || 0
    const currentStreak = stats?.streak || 0
    const currentMaxStreak = stats?.maxStreak || 0
    const currentAverageTime = stats?.averageTime || '00:00:00'

    const newGames = currentGames + 1
    const newTotalPoints = currentTotalPoints + todayPoints
    const newStreak = todayPoints !== 0 ? currentStreak + 1 : 0

    const updatedStats = {
        games: newGames,
        totalPoints: newTotalPoints,
        averagePoints: newTotalPoints / newGames,
        averageTime: calculateAverageTime(
            currentAverageTime,
            todayTime,
            newGames
        ),
        streak: newStreak,
        maxStreak: Math.max(newStreak, currentMaxStreak),
    }

    localStorage.setItem('stats', JSON.stringify(updatedStats))

    return updatedStats
}

export function fillModalStats(todayPoints: number, todayTime: string | null) {
    updateStat(
        'title',
        todayPoints === 6
            ? '🤨 ESCANDALÓS!'
            : todayPoints === 5
            ? '🏆 Increíble!'
            : todayPoints === 4
            ? '🤯 Impresionant!'
            : todayPoints === 3
            ? '😎 Molt bé!'
            : todayPoints === 2
            ? '😐 Fet!'
            : todayPoints === 1
            ? '😭 Pels pèls!'
            : '💩 Vaja...'
    )
    updateStat('word', getTodayNiceWord())
    updateStat('points', todayPoints.toString())
    updateStat('time', todayTime || '-')

    const storedStats = getStoredStats()

    if (!storedStats) return

    console.log('Stored stats:', storedStats)

    updateStat('games', storedStats.games.toString())
    updateStat('totalPoints', storedStats.totalPoints.toString())
    updateStat('averagePoints', storedStats.averagePoints.toFixed(2))
    updateStat('averageTime', storedStats.averageTime || '00:00:00')
    updateStat('streak', storedStats.streak.toString())
    updateStat('maxStreak', storedStats.maxStreak.toString())
}

export function updateMenuData() {
    const storedStats = getStoredStats()

    updateMenuStat('games', storedStats?.games.toString() || '0')
    updateMenuStat('totalPoints', storedStats?.totalPoints.toString() || '0')
    updateMenuStat(
        'averagePoints',
        storedStats?.averagePoints.toFixed(2) || '0'
    )
    updateMenuStat('streak', storedStats?.streak.toString() || '0')
    updateMenuStat('maxStreak', storedStats?.maxStreak.toString() || '0')
}

export function editLinkToDictionary(word: string) {
    const dicLink = document.querySelector('#dicLink')
    const dicUrl = `https://dlc.iec.cat/Results?DecEntradaText=${word}&AllInfoMorf=False&OperEntrada=0&OperDef=0&OperEx=0&OperSubEntrada=0&OperAreaTematica=0&InfoMorfType=0&OperCatGram=False&AccentSen=False&CurrentPage=0&refineSearch=0&Actualitzacions=False`

    if (!dicLink) {
        console.warn('Cant find dicLink')
        return
    }

    dicLink.setAttribute('href', dicUrl)
}

export function calculateAverageTime(
    currentAverageTime: string,
    todayTime: string | null,
    gamesPlayed: number
): string | undefined {
    // Time is stored in this format: hh:mm:ss and should be returned in the same format

    console.log(todayTime, currentAverageTime, gamesPlayed)

    if (!todayTime) return currentAverageTime

    const todayTimeParts = todayTime.split(':').map(Number)
    const todayTimeInSeconds =
        todayTimeParts[0] * 3600 + todayTimeParts[1] * 60 + todayTimeParts[2]

    if (gamesPlayed <= 1) return todayTime // If it's the first game, return today's time

    const currentAverageParts = currentAverageTime.split(':').map(Number)
    const currentAverageInSeconds =
        currentAverageParts[0] * 3600 +
        currentAverageParts[1] * 60 +
        currentAverageParts[2]
    const newAverageInSeconds =
        (currentAverageInSeconds * (gamesPlayed - 1) + todayTimeInSeconds) /
        gamesPlayed
    const hours = Math.floor(newAverageInSeconds / 3600)
    const minutes = Math.floor((newAverageInSeconds % 3600) / 60)
    const seconds = Math.floor(newAverageInSeconds % 60)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
        2,
        '0'
    )}:${String(seconds).padStart(2, '0')}`
}
