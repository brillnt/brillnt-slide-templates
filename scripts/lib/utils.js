import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * Utility functions for displaying clean paths in terminal output
 */

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the project root directory (where package.json is located)
function findProjectRoot(startDir = __dirname) {
    let currentDir = startDir;
    
    while (currentDir !== path.dirname(currentDir)) {
        const packageJsonPath = path.join(currentDir, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
            return currentDir;
        }
        
        currentDir = path.dirname(currentDir);
    }
    
    // Fallback to current directory if package.json not found
    return process.cwd();
}

// Get the project root once
const PROJECT_ROOT = findProjectRoot();

/**
 * Convert absolute path to relative path from project root for display
 * @param {string} absolutePath - The absolute file path
 * @returns {string} - Relative path from project root
 */
function getDisplayPath(absolutePath) {
    if (!absolutePath) return '';
    
    try {
        const relativePath = path.relative(PROJECT_ROOT, absolutePath);
        
        // If the path is outside the project, show just the filename
        if (relativePath.startsWith('..')) {
            return path.basename(absolutePath);
        }
        
        return relativePath;
    } catch (error) {
        // Fallback to basename if path.relative fails
        return path.basename(absolutePath);
    }
}

/**
 * Convert absolute directory path to relative path for display
 * @param {string} absolutePath - The absolute directory path
 * @returns {string} - Relative path from project root with trailing slash
 */
function getDisplayDir(absolutePath) {
    const displayPath = getDisplayPath(absolutePath);
    return displayPath.endsWith('/') ? displayPath : displayPath + '/';
}

export {
    getDisplayPath,
    getDisplayDir,
    PROJECT_ROOT
};

