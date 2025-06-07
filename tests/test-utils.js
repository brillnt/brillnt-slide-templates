/**
 * Test Utilities - Helper functions for testing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create a temporary directory for testing
 */
export function createTempDir(prefix = 'test-') {
    return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/**
 * Clean up a temporary directory
 */
export function cleanupTempDir(tempDir) {
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

/**
 * Copy directory recursively
 */
export function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Read file content as string
 */
export function readFileContent(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * Check if file exists
 */
export function fileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Get file stats
 */
export function getFileStats(filePath) {
    return fs.statSync(filePath);
}

/**
 * Get test fixtures directory
 */
export function getFixturesDir() {
    return path.join(__dirname, 'fixtures');
}

/**
 * Get specific fixture path
 */
export function getFixturePath(...pathSegments) {
    return path.join(getFixturesDir(), ...pathSegments);
}

/**
 * Assert that two strings are equal
 */
export function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`Assertion failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
}

/**
 * Assert that a condition is true
 */
export function assertTrue(condition, message = '') {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

/**
 * Assert that a file exists
 */
export function assertFileExists(filePath, message = '') {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath} ${message}`);
    }
}

/**
 * Assert that a directory exists
 */
export function assertDirectoryExists(dirPath, message = '') {
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
        throw new Error(`Directory does not exist: ${dirPath} ${message}`);
    }
}

