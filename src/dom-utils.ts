export function updateCell(
    row: number,
    col: number,
    text?: string,
    status?: 'correct' | 'present' | 'absent'
) {
    const cell = document.querySelector(`#l${row}_${col}`)
    if (cell && text !== undefined) cell.textContent = text
    if (cell && status) cell.classList.add(status)
}

export function updateKey(
    letter: string,
    status: 'correct' | 'present' | 'absent'
) {
    const key = document.querySelector(`.keyboard__key[data-key="${letter}"]`)
    if (key) key.classList.add(status)
}

export function updateStat(stat: string, content: string) {
    const domstat = document.querySelector(`#stats-${stat}`)

    if (!domstat) {
        console.error('Cant find stat element')
        return
    }

    domstat.textContent = content
}

export function updateMenuStat(stat: string, content: string) {
    const domstat = document.querySelector(`#menustats-${stat}`)

    if (!domstat) {
        console.error('Cant find stat element')
        return
    }

    domstat.textContent = content
}

// Feedback

export function showFeedback(message) {
    const feedbackElement = document.querySelector('.feedback')

    if (!feedbackElement) {
        console.error('Cant find feedback element')
        return
    }

    feedbackElement.textContent = message
    feedbackElement.classList.add('active')

    setTimeout(() => {
        feedbackElement.classList.remove('active')
    }, 4000)
}

// Modal

export function showModal() {
    const modal = document.querySelector('.modal')

    if (!modal) {
        console.error('Cant find modal element')
        return
    }
    modal.classList.add('active')
}

export function closeModal() {
    const modal = document.querySelector('.modal')

    if (!modal) {
        console.error('Cant find modal element')
        return
    }

    modal.classList.remove('active')
}

// Menu

export function openMenu() {
    const menu = document.querySelector('.menu')

    if (!menu) {
        console.error('Cant find menu element')
        return
    }

    menu.classList.add('active')
}

export function closeMenu() {
    const menu = document.querySelector('.menu')

    if (!menu) {
        console.error('Cant find menu element')
        return
    }

    menu.classList.remove('active')
}
