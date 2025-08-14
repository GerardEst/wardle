# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Generate test coverage
npm run coverage
```

## Project Architecture

This is a Spanish Wordle game built with TypeScript, Vite, and vanilla JavaScript. The application is a single-page game with modular TypeScript architecture.

### Core Modules

- **`main.ts`**: Entry point that initializes the game and sets up DOM event listeners
- **`src/gameboard-module.ts`**: Game logic including letter input, word validation, and game state management
- **`src/words-module.ts`**: Word dictionary management with Spanish word sets (`/assets/es/dicc.json` for validation, `/assets/es/words.json` for daily words)
- **`src/storage-module.ts`**: Local storage handling for game persistence and daily game rotation
- **`src/stats-module.ts`**: Player statistics tracking (games played, streaks, timing)
- **`src/dom-utils.ts`**: DOM manipulation utilities for UI updates
- **`src/share-utils.ts`**: Social sharing functionality

### Game Flow

1. **Daily Word System**: Words rotate daily based on a fixed start date (2025-07-18) using modulo arithmetic
2. **Game State**: Tracks current row, column, try count, and builds current word letter by letter
3. **Validation**: Two-tier system - dictionary check for validity, exact match for winning
4. **Persistence**: Game state saved to localStorage, restored on reload
5. **Timing**: Time trial functionality tracks game completion time

### Key Features

- Spanish language support with custom dictionary
- Local storage game persistence
- Statistics tracking with streak counters
- Time trial functionality
- Social sharing with game results
- Responsive keyboard interface

### File Structure

- `src/`: TypeScript modules
- `public/assets/es/`: Spanish word dictionaries
- `__tests__/`: Vitest test files
- `vite.config.js`: Build configuration with multi-page support (main game + bot page)

### Testing

Uses Vitest with jsdom environment. Test setup in `test-setup.ts` includes jest-dom matchers. Coverage excludes build artifacts and main entry file.