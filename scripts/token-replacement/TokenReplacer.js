/**
 * TokenReplacer - Handles generic token replacement with nested object support
 */

class TokenReplacer {
    /**
     * Replace all tokens in content with values from config
     * @param {string} content - Template content with {{tokens}}
     * @param {Object} config - Configuration object with values
     * @param {string[]} tokens - Array of tokens to replace (optional, will extract if not provided)
     * @param {Object} options - Replacement options
     * @returns {string} - Content with tokens replaced
     */
    static replaceTokens(content, config, tokens = null, options = {}) {
        const defaultOptions = {
            errorHandling: 'warn', // 'fail', 'warn', 'graceful'
            missingTokenPlaceholder: '[MISSING]',
            preserveUnknownTokens: false
        };
        
        const opts = { ...defaultOptions, ...options };
        let result = content;
        const warnings = [];
        
        // Extract tokens if not provided
        if (!tokens) {
            const TokenExtractor = require('./TokenExtractor');
            tokens = TokenExtractor.extractTokens(content);
        }
        
        // Replace each token
        for (const token of tokens) {
            const tokenRegex = new RegExp(`\\{\\{\\s*${this.escapeRegex(token)}\\s*\\}\\}`, 'g');
            
            try {
                const value = this.getNestedValue(config, token);
                
                if (value !== undefined && value !== null) {
                    result = result.replace(tokenRegex, String(value));
                } else {
                    // Handle missing token based on strategy
                    const handled = this.handleMissingToken(token, opts, warnings);
                    if (handled.shouldReplace) {
                        result = result.replace(tokenRegex, handled.replacement);
                    }
                }
            } catch (error) {
                const handled = this.handleMissingToken(token, opts, warnings, error);
                if (handled.shouldReplace) {
                    result = result.replace(tokenRegex, handled.replacement);
                }
            }
        }
        
        // Handle warnings/errors based on strategy
        if (warnings.length > 0) {
            if (opts.errorHandling === 'fail') {
                throw new Error(`Token replacement failed:\n${warnings.join('\n')}`);
            } else if (opts.errorHandling === 'warn') {
                warnings.forEach(warning => console.warn(`⚠️  ${warning}`));
            }
            // 'graceful' mode just continues silently
        }
        
        return result;
    }
    
    /**
     * Get nested value from object using dot notation
     * @param {Object} obj - Object to traverse
     * @param {string} path - Dot notation path (e.g., 'payment.amount')
     * @returns {*} - Value at path, or undefined if not found
     */
    static getNestedValue(obj, path) {
        if (!obj || typeof obj !== 'object') {
            return undefined;
        }
        
        // Handle simple property access
        if (!path.includes('.')) {
            return obj[path];
        }
        
        // Handle nested property access
        const parts = path.split('.');
        let current = obj;
        
        for (const part of parts) {
            if (current === null || current === undefined) {
                return undefined;
            }
            
            if (typeof current !== 'object') {
                return undefined;
            }
            
            current = current[part];
        }
        
        return current;
    }
    
    /**
     * Handle missing token based on error handling strategy
     * @param {string} token - Token name that's missing
     * @param {Object} options - Replacement options
     * @param {string[]} warnings - Array to collect warnings
     * @param {Error} [error] - Optional error that occurred
     * @returns {Object} - Object with shouldReplace and replacement properties
     */
    static handleMissingToken(token, options, warnings, error = null) {
        const message = error 
            ? `Token '${token}' caused error: ${error.message}`
            : `Token '${token}' not found in config`;
            
        warnings.push(message);
        
        switch (options.errorHandling) {
            case 'fail':
                // Will be handled by caller
                return { shouldReplace: false, replacement: '' };
                
            case 'warn':
                // Replace with placeholder and warn
                return { 
                    shouldReplace: true, 
                    replacement: options.missingTokenPlaceholder 
                };
                
            case 'graceful':
                // Replace with placeholder silently
                return { 
                    shouldReplace: true, 
                    replacement: options.missingTokenPlaceholder 
                };
                
            default:
                return { shouldReplace: false, replacement: '' };
        }
    }
    
    /**
     * Escape special regex characters in token name
     * @param {string} str - String to escape
     * @returns {string} - Escaped string
     */
    static escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    }
    
    /**
     * Preview token replacements without actually replacing
     * @param {string} content - Template content
     * @param {Object} config - Configuration object
     * @param {string[]} tokens - Array of tokens (optional)
     * @returns {Object} - Preview of what would be replaced
     */
    static previewReplacements(content, config, tokens = null) {
        if (!tokens) {
            const TokenExtractor = require('./TokenExtractor');
            tokens = TokenExtractor.extractTokens(content);
        }
        
        const preview = {
            tokens: [],
            missing: [],
            errors: []
        };
        
        for (const token of tokens) {
            try {
                const value = this.getNestedValue(config, token);
                
                if (value !== undefined && value !== null) {
                    preview.tokens.push({
                        token,
                        value: String(value),
                        status: 'found'
                    });
                } else {
                    preview.missing.push({
                        token,
                        path: token,
                        status: 'missing'
                    });
                }
            } catch (error) {
                preview.errors.push({
                    token,
                    error: error.message,
                    status: 'error'
                });
            }
        }
        
        return preview;
    }
}

module.exports = TokenReplacer;

