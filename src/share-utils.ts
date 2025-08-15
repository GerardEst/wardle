import { showFeedback } from './dom-utils'
import { getString } from './language-module'

function buildResultPattern(open = false, tries: number) {
    let result = ''
    for (let i = 1; i <= tries; i++) {
        const row: string[] = []

        for (let j = 1; j <= 5; j++) {
            const cell = document.querySelector(`#l${i}_${j}`)
            if (!cell) continue

            if (cell.classList.contains('correct')) {
                open ? row.push('🟩' + cell.textContent + '  ') : row.push('🟩')
            } else if (cell.classList.contains('present')) {
                open ? row.push('🟨' + cell.textContent + '  ') : row.push('🟨')
            } else {
                open
                    ? row.push('⬜️' + cell.textContent + '  ')
                    : row.push('⬜️')
            }
        }
        result += row.join('') + '\n'
    }

    console.log(result)

    return result
}

export function shareResult(
    open = false,
    wordIndex: number,
    tries: number,
    time: string
) {
    const resultPattern = buildResultPattern(open, tries)
    const shareTitle = `#${getString('shareGameName')} ${wordIndex}`
    const shareTries = tries === 7 ? 'X/6' : tries + '/6'
    const resultText = `${shareTitle}\n🎯 ${shareTries}\n⏳ ${time}\n\n${resultPattern}\n${getString(
        'shareLink'
    )}`

    //const noLinkPreview = resultText.replace(/https?:\/\//g, '$&\u200B')
    if (isMobileDevice() && navigator.share) {
        const shareData = {
            text: resultText,
        }

        navigator
            .share(shareData)
            .catch((error) => console.error('Error sharing:', error))
    } else {
        copyToClipboard(resultText).catch((error) => {
            console.error('Error copying to clipboard:', error)
        })
        showFeedback('Resultado copiado, pegalo donde quieras compartirlo')
    }
}

export function isMobileDevice() {
    return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        ) ||
        (navigator.maxTouchPoints &&
            navigator.maxTouchPoints > 2 &&
            /MacIntel/.test(navigator.platform))
    )
}

export async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
    } else {
        throw new Error('Clipboard API not available')
    }
}
