/**
 * Enhanced configuration system with defaults and validation
 */

// Default configuration values
const DEFAULT_CONFIG = {
    client_name: '',
    date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }),
    payment: {
        amount: 'Pay $1,000',
        description: 'Deposit to Start',
        provider: 'Bonsai'
    }
};

/**
 * Apply default values to config object
 * @param {Object} config - User provided config
 * @returns {Object} - Config with defaults applied
 */
function applyDefaults(config) {
    const result = { ...config };
    
    // Apply top-level defaults
    if (!result.date || result.date.trim() === '') {
        result.date = DEFAULT_CONFIG.date;
    }
    
    // Apply payment defaults
    if (!result.payment) {
        result.payment = { ...DEFAULT_CONFIG.payment };
    } else {
        result.payment = {
            amount: result.payment.amount || DEFAULT_CONFIG.payment.amount,
            description: result.payment.description || DEFAULT_CONFIG.payment.description,
            provider: result.payment.provider || DEFAULT_CONFIG.payment.provider
        };
    }
    
    return result;
}

/**
 * Validate configuration with detailed error messages
 * @param {Object} config - Configuration object to validate
 * @returns {Array} - Array of validation error messages
 */
function validateConfig(config) {
    const errors = [];
    
    // Required fields with helpful messages
    if (!config.client_name || config.client_name.trim() === '') {
        errors.push('❌ client_name is required (e.g., "John Doe, Acme Corp")');
    }
    
    // Payment validation with specific field guidance
    if (!config.payment) {
        errors.push('❌ payment object is required');
        errors.push('💡 Add: "payment": { "amount": "Pay $1,000", "description": "Deposit", "provider": "Bonsai" }');
    } else {
        if (!config.payment.amount || config.payment.amount.trim() === '') {
            errors.push('❌ payment.amount is required (e.g., "Pay $1,000")');
        }
        if (!config.payment.description || config.payment.description.trim() === '') {
            errors.push('❌ payment.description is required (e.g., "Deposit to Start")');
        }
        if (!config.payment.provider || config.payment.provider.trim() === '') {
            errors.push('❌ payment.provider is required (e.g., "Bonsai", "FreshBooks")');
        }
    }
    
    return errors;
}

/**
 * Process and validate configuration with defaults
 * @param {Object} rawConfig - Raw config from JSON file
 * @returns {Object} - Processed config with defaults applied
 * @throws {Error} - If validation fails
 */
function processConfig(rawConfig) {
    // Apply defaults first
    const configWithDefaults = applyDefaults(rawConfig);
    
    // Validate the processed config
    const errors = validateConfig(configWithDefaults);
    
    if (errors.length > 0) {
        const errorMessage = [
            '❌ Configuration validation failed:',
            '',
            ...errors,
            '',
            '💡 Example valid config:',
            JSON.stringify({
                client_name: "John Doe, Acme Corporation",
                date: "June 6, 2025",
                payment: {
                    amount: "Pay $1,000",
                    description: "Deposit to Start", 
                    provider: "Bonsai"
                }
            }, null, 2)
        ].join('\n');
        
        throw new Error(errorMessage);
    }
    
    return configWithDefaults;
}

module.exports = {
    DEFAULT_CONFIG,
    applyDefaults,
    validateConfig,
    processConfig
};

