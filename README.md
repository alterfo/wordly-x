# Architecture Overview of Wordly-X

Wordly-X is an Electron-based application designed for recording audio memos and storing typed thoughts privately. It leverages modern web and desktop technologies to provide a seamless user experience for daily journaling and audio recording. The application is built using Vite for bundling, TailwindCSS for styling, and it integrates SQLite for data persistence through WebAssembly.

## High-Level Codemap

### Key Components

1. **Electron Integration (`vite.config.js` and `electron/main.mjs`)**:
   - The Electron integration is configured in `vite.config.js` using the `vite-plugin-electron/simple`. This setup specifies the entry point for the Electron main process.
   - The main Electron process script (`electron/main.mjs`) is responsible for initializing the Electron app, creating windows, and handling inter-process communication.

2. **Frontend (`index.html` and `src/main.mjs`)**:
   - `index.html` serves as the entry point for the UI, setting up the basic HTML structure and including references to the main JavaScript module.
   - `src/main.mjs` is the central module for UI logic, handling interactions, and rendering dynamic content based on user actions and data updates.

3. **Database Management (`src/DB.mjs`)**:
   - This module abstracts all interactions with the SQLite database. It initializes the database, defines schema, and provides methods for CRUD operations on diary entries and audio files.
   - It uses `@sqlite.org/sqlite-wasm` for SQLite interactions, allowing the database operations to be performed within a browser environment through WebAssembly.

4. **Utility Modules**:
   - `src/date-utils.mjs`: Contains helper functions for date manipulation and formatting specific to the application's needs.
   - `src/getWordCount.mjs`: Provides a utility to count words in a given text, used for tracking the length of diary entries.

5. **Audio Recording (`src/Recorder.mjs`)**:
   - Handles audio recording functionality using the MediaRecorder API.
   - Manages audio data, saving recordings as files, and updating the UI to reflect new audio clips.

6. **Styling (`src/style.css`, `tailwind.config.js`, and `postcss.config.js`)**:
   - `src/style.css` contains custom styles and utilities that extend the TailwindCSS framework.
   - Configuration for TailwindCSS is defined in `tailwind.config.js`, specifying the content sources for Tailwind's JIT engine.
   - `postcss.config.js` sets up PostCSS plugins used in the build process, including TailwindCSS and autoprefixer for CSS compatibility.

### Architectural Invariants

- **Client-Side Database**: The application's data is managed client-side using SQLite compiled to WebAssembly, ensuring all data remains local and private.
- **Separation of Concerns**: UI rendering, business logic, and database management are distinctly separated into different modules, promoting maintainability and scalability.
- **No External API Dependencies**: All functionalities are implemented using local resources and libraries without reliance on external APIs, enhancing privacy and offline capabilities.

### Boundaries and Interfaces

- **Electron and Renderer Process**: The communication between Electron's main process and renderer process is minimal, constrained to essential window management and IPC.
- **UI and Database**: The UI components interact with the database strictly through the `DB` class interface, ensuring any database schema changes do not directly impact UI components.

## Conclusion

The architecture of Wordly-X is designed to be modular and maintainable, with clear separation between the application's core functionalities. By leveraging modern web technologies and Electron, it provides a robust platform for private journaling and audio recording. The use of SQLite with WebAssembly ensures data privacy and portability, making Wordly-X a self-contained and reliable application for users.
