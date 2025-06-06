/**
 * Token Replacement System - Generic template processing with nested object support
 * 
 * This module provides a complete token replacement system that can work with any
 * template structure and JSON configuration, replacing the need for hardcoded
 * token replacement logic.
 * 
 * @example
 * const { TemplateProcessor } = require('./token-replacement');
 * 
 * const processor = new TemplateProcessor({
 *   errorHandling: 'warn',
 *   strictValidation: false
 * });
 * 
 * const result = await processor.processTemplate('template.html', config);
 */

const TokenExtractor = require('./TokenExtractor');
const TokenReplacer = require('./TokenReplacer');
const ConfigValidator = require('./ConfigValidator');
const TemplateProcessor = require('./TemplateProcessor');

module.exports = {
    TokenExtractor,
    TokenReplacer,
    ConfigValidator,
    TemplateProcessor,
    
    // Convenience factory function
    createProcessor: (options = {}) => new TemplateProcessor(options),
    
    // Quick processing function for simple use cases
    processTemplate: async (templatePath, config, options = {}) => {
        const processor = new TemplateProcessor(options);
        return await processor.processTemplate(templatePath, config);
    },
    
    // Quick token extraction
    extractTokens: (templateContent) => TokenExtractor.extractTokens(templateContent),
    
    // Quick validation
    validateConfig: (config, tokens, options = {}) => 
        ConfigValidator.validateAgainstTokens(config, tokens, options)
};

