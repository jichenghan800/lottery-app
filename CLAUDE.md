# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

This is a lottery application (研发之星抽奖 - R&D Star Lottery) for conducting employee prize drawings. It's built as a React SPA with TypeScript, Vite, and Tailwind CSS.

## Common Development Commands

**Development Server:**
```bash
pnpm run dev  # Installs deps and starts Vite dev server
```

**Build Commands:**
```bash
pnpm run build        # Production build with BUILD_MODE=prod
pnpm run build:preview # Preview build without production mode
pnpm run preview      # Preview built application
```

**Code Quality:**
```bash
pnpm run lint         # Run ESLint
```

**Note:** All scripts auto-install dependencies with `yes | pnpm install` and clear Vite cache before execution.

## Architecture Overview

### Core Structure
- **Monolithic Design**: Main lottery logic concentrated in `LotterySystem.tsx` (630 lines)
- **State Management**: Pure React hooks, no external state libraries
- **Data Sources**: JSON file (`public/data/employees.json`) + Excel upload support
- **Build System**: Vite with TypeScript, path aliases (`@/*` → `./src/*`)

### Key Components
- `App.tsx`: Minimal root wrapper with gradient background
- `LotterySystem.tsx`: Complete lottery functionality including:
  - Employee data management and Excel parsing
  - Lottery drawing animation system (80ms intervals)
  - Winner selection and round management
  - Media controls (background music, custom backgrounds)
  - Settings panel and file upload handling
- `ErrorBoundary.tsx`: Application-wide error handling

### State Architecture
All state is managed in `LotterySystem` component:
- **Core Data**: `employees`, `availableEmployees`, `winners`, `currentWinner`
- **Lottery Flow**: `lotteryState` ('idle' | 'drawing' | 'stopped'), `currentRound`
- **UI State**: `loading`, `showSettings`, `backgroundImage`, `isPlaying`

### Technology Stack
- **Frontend**: React 18.3.1 + TypeScript 5.6.2
- **Styling**: Tailwind CSS 3.4.16 + Radix UI components
- **File Processing**: XLSX library for Excel parsing
- **Development**: ESLint (relaxed rules), PostCSS, PNPM

### Data Flow
1. Load default employees from JSON → Parse Excel upload (if provided) → Ready state
2. Start lottery → Drawing animation loop → Stop → Winner selection
3. Update winners list → Remove from available → Next round

### Development Patterns
- **File Uploads**: Client-side processing with object URLs for media files
- **Animation**: `setInterval` for lottery drawing effects with proper cleanup
- **Responsive**: Mobile detection hook + Tailwind responsive utilities
- **Error Handling**: Alert-based feedback (consider toast notifications for improvements)

### Build Configuration
- **Vite**: React plugin, source info plugin (dev only), path aliases
- **TypeScript**: Multi-config setup (app vs. build tools), relaxed app rules
- **Environment**: `BUILD_MODE=prod` for production builds