export interface IInput {
    pathToFolder: string; // Ensures it's always a string
    mode: string; // Ensures it's always a string
    loadMode: 'strict' | 'skip'; // Enforce correct type
}

// ✅ Removed unused `DotenvParseOutput` import
// ✅ Changed type aliases to function signatures (not needed in `main.ts`)
