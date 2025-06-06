/**
 * TokenExtractor - Scans templates for {{tokens}} with caching support
 */

const fs = require('fs');
const path = require('path');

class TokenExtractor {
    static cache = new Map();
    
    /**
     * Extract all tokens from template content
     * @param {string} templateContent - Raw template content
     * @returns {string[]} - Array of unique token names
     */
    static extractTokens(templateContent) {
        const tokenRegex = /\{\{([^}]+)\}\}/g;
        const tokens = new Set();
        let match;
        
        while ((match = tokenRegex.exec(templateContent)) !== null) {
            // Clean up token name (remove whitespace)
            const tokenName = match[1].trim();
            tokens.add(tokenName);
        }
        
        return Array.from(tokens).sort();
    }
    
    /**
     * Extract tokens from template file with caching
     * @param {string} templatePath - Path to template file
     * @returns {string[]} - Array of unique token names
     */
    static getCachedTokens(templatePath) {
        const absolutePath = path.resolve(templatePath);
        
        // Check if we have cached tokens for this file
        if (this.cache.has(absolutePath)) {
            const cached = this.cache.get(absolutePath);
            
            // Check if file has been modified since caching
            try {
                const stats = fs.statSync(absolutePath);
                if (stats.mtime.getTime() === cached.mtime) {
                    return cached.tokens;
                }
            } catch (error) {
                // File doesn't exist, remove from cache
                this.cache.delete(absolutePath);
                throw new Error(`Template file not found: ${templatePath}`);
            }
        }
        
        // Read file and extract tokens
        try {
            const content = fs.readFileSync(absolutePath, 'utf8');
            const tokens = this.extractTokens(content);
            
            // Cache the results with file modification time
            const stats = fs.statSync(absolutePath);
            this.cache.set(absolutePath, {
                tokens,
                mtime: stats.mtime.getTime()
            });
            
            return tokens;
        } catch (error) {
            throw new Error(`Error reading template file ${templatePath}: ${error.message}`);
        }
    }
    
    /**
     * Extract tokens from multiple template files
     * @param {string[]} templatePaths - Array of template file paths
     * @returns {Object} - Map of file paths to their tokens
     */
    static extractFromMultipleFiles(templatePaths) {
        const results = {};
        
        for (const templatePath of templatePaths) {
            try {
                results[templatePath] = this.getCachedTokens(templatePath);
            } catch (error) {
                results[templatePath] = { error: error.message };
            }
        }
        
        return results;
    }
    
    /**
     * Get all unique tokens from multiple template files
     * @param {string[]} templatePaths - Array of template file paths
     * @returns {string[]} - Array of all unique tokens across files
     */
    static getAllUniqueTokens(templatePaths) {
        const allTokens = new Set();
        
        for (const templatePath of templatePaths) {
            try {
                const tokens = this.getCachedTokens(templatePath);
                tokens.forEach(token => allTokens.add(token));
            } catch (error) {
                // Skip files with errors, but could log warning
                console.warn(`Warning: Could not extract tokens from ${templatePath}: ${error.message}`);
            }
        }
        
        return Array.from(allTokens).sort();
    }
    
    /**
     * Clear the token extraction cache
     * @param {string} [templatePath] - Optional specific file to clear, or clear all if not provided
     */
    static clearCache(templatePath = null) {
        if (templatePath) {
            const absolutePath = path.resolve(templatePath);
            this.cache.delete(absolutePath);
        } else {
            this.cache.clear();
        }
    }
    
    /**
     * Get cache statistics
     * @returns {Object} - Cache size and file count
     */
    static getCacheStats() {
        return {
            size: this.cache.size,
            files: Array.from(this.cache.keys())
        };
    }
}

module.exports = TokenExtractor;

