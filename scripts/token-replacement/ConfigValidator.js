/**
 * ConfigValidator - Validates configuration against required tokens
 */

class ConfigValidator {
    /**
     * Validate config object against required tokens
     * @param {Object} config - Configuration object to validate
     * @param {string[]} requiredTokens - Array of required token names
     * @param {Object} options - Validation options
     * @returns {Object} - Validation result with errors, warnings, and status
     */
    static validateAgainstTokens(config, requiredTokens, options = {}) {
        const defaultOptions = {
            strictMode: false, // If true, all tokens must be present
            allowEmpty: false, // If true, empty strings are considered valid
            warnOnUnused: false // If true, warn about config values not used in templates
        };
        
        const opts = { ...defaultOptions, ...options };
        const result = {
            valid: true,
            errors: [],
            warnings: [],
            missing: [],
            found: [],
            unused: []
        };
        
        // Check each required token
        for (const token of requiredTokens) {
            const validation = this.validateSingleToken(config, token, opts);
            
            if (validation.found) {
                result.found.push({
                    token,
                    value: validation.value,
                    type: typeof validation.value
                });
            } else {
                result.missing.push({
                    token,
                    reason: validation.reason
                });
                
                if (opts.strictMode) {
                    result.errors.push(`Required token '${token}' is missing: ${validation.reason}`);
                    result.valid = false;
                } else {
                    result.warnings.push(`Token '${token}' is missing: ${validation.reason}`);
                }
            }
        }
        
        // Check for unused config values if requested
        if (opts.warnOnUnused) {
            const unusedValues = this.findUnusedConfigValues(config, requiredTokens);
            result.unused = unusedValues;
            
            if (unusedValues.length > 0) {
                result.warnings.push(`Unused config values: ${unusedValues.join(', ')}`);
            }
        }
        
        return result;
    }
    
    /**
     * Validate a single token against config
     * @param {Object} config - Configuration object
     * @param {string} token - Token name to validate
     * @param {Object} options - Validation options
     * @returns {Object} - Validation result for single token
     */
    static validateSingleToken(config, token, options) {
        const TokenReplacer = require('./TokenReplacer');
        
        try {
            const value = TokenReplacer.getNestedValue(config, token);
            
            if (value === undefined) {
                return {
                    found: false,
                    reason: 'not found in config'
                };
            }
            
            if (value === null) {
                return {
                    found: false,
                    reason: 'value is null'
                };
            }
            
            if (!options.allowEmpty && value === '') {
                return {
                    found: false,
                    reason: 'value is empty string'
                };
            }
            
            return {
                found: true,
                value: value
            };
            
        } catch (error) {
            return {
                found: false,
                reason: `error accessing value: ${error.message}`
            };
        }
    }
    
    /**
     * Find missing tokens from config
     * @param {Object} config - Configuration object
     * @param {string[]} requiredTokens - Array of required token names
     * @returns {string[]} - Array of missing token names
     */
    static findMissingTokens(config, requiredTokens) {
        const missing = [];
        
        for (const token of requiredTokens) {
            const validation = this.validateSingleToken(config, token, { allowEmpty: false });
            if (!validation.found) {
                missing.push(token);
            }
        }
        
        return missing;
    }
    
    /**
     * Generate a comprehensive validation report
     * @param {Object} config - Configuration object
     * @param {string[]} tokens - Array of token names
     * @param {Object} options - Validation options
     * @returns {Object} - Detailed validation report
     */
    static generateValidationReport(config, tokens, options = {}) {
        const validation = this.validateAgainstTokens(config, tokens, options);
        
        const report = {
            summary: {
                total: tokens.length,
                found: validation.found.length,
                missing: validation.missing.length,
                valid: validation.valid
            },
            details: validation,
            recommendations: []
        };
        
        // Generate recommendations
        if (validation.missing.length > 0) {
            report.recommendations.push('Add missing tokens to your config file');
            
            // Suggest config structure for missing tokens
            const suggestedConfig = this.generateConfigSuggestions(validation.missing);
            if (Object.keys(suggestedConfig).length > 0) {
                report.suggestedConfig = suggestedConfig;
                report.recommendations.push('Consider adding these fields to your config');
            }
        }
        
        if (validation.unused.length > 0) {
            report.recommendations.push('Remove unused config values to keep config clean');
        }
        
        return report;
    }
    
    /**
     * Generate config suggestions for missing tokens
     * @param {Array} missingTokens - Array of missing token objects
     * @returns {Object} - Suggested config structure
     */
    static generateConfigSuggestions(missingTokens) {
        const suggestions = {};
        
        for (const missing of missingTokens) {
            const token = missing.token;
            
            if (token.includes('.')) {
                // Nested token - create nested structure
                this.setNestedValue(suggestions, token, `[${token}]`);
            } else {
                // Simple token
                suggestions[token] = `[${token}]`;
            }
        }
        
        return suggestions;
    }
    
    /**
     * Set nested value in object using dot notation
     * @param {Object} obj - Object to modify
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     */
    static setNestedValue(obj, path, value) {
        const parts = path.split('.');
        let current = obj;
        
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in current) || typeof current[part] !== 'object') {
                current[part] = {};
            }
            current = current[part];
        }
        
        current[parts[parts.length - 1]] = value;
    }
    
    /**
     * Find config values that aren't used in any tokens
     * @param {Object} config - Configuration object
     * @param {string[]} usedTokens - Array of tokens used in templates
     * @returns {string[]} - Array of unused config paths
     */
    static findUnusedConfigValues(config, usedTokens) {
        const allConfigPaths = this.getAllConfigPaths(config);
        const unused = [];
        
        for (const configPath of allConfigPaths) {
            if (!usedTokens.includes(configPath)) {
                unused.push(configPath);
            }
        }
        
        return unused;
    }
    
    /**
     * Get all possible paths in a config object
     * @param {Object} obj - Object to traverse
     * @param {string} prefix - Current path prefix
     * @returns {string[]} - Array of all paths
     */
    static getAllConfigPaths(obj, prefix = '') {
        const paths = [];
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const currentPath = prefix ? `${prefix}.${key}` : key;
                
                if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                    // Recursive for nested objects
                    paths.push(...this.getAllConfigPaths(obj[key], currentPath));
                } else {
                    // Leaf value
                    paths.push(currentPath);
                }
            }
        }
        
        return paths;
    }
}

module.exports = ConfigValidator;

