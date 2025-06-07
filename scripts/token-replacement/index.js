/**
 * Token Replacement System - Generic template processing with nested object support
 * 
 * This module provides a complete token replacement system that can work with any
 * template structure and JSON configuration, replacing the need for hardcoded
 * token replacement logic.
 * 
 * @example
 * import { TemplateProcessor } from './token-replacement/index.js';
 * 
 * const processor = new TemplateProcessor({
 *   errorHandling: 'warn',
 *   strictValidation: false
 * });
 * 
 * const result = await processor.processTemplate('template.html', config);
 */

import TokenExtractor from './token-extractor.js';
import TokenReplacer from './token-replacer.js';
import ConfigValidator from './config-validator.js';
import TemplateProcessor from './template-processor.js';

export {
    TokenExtractor,
    TokenReplacer,
    ConfigValidator,
    TemplateProcessor
};

// Convenience factory function
export const createProcessor = (options = {}) => new TemplateProcessor(options);

// Quick processing function for simple use cases
export const processTemplate = async (templatePath, config, options = {}) => {
    const processor = new TemplateProcessor(options);
    return await processor.processTemplate(templatePath, config);
};

// Quick token extraction
export const extractTokens = (templateContent) => TokenExtractor.extractTokens(templateContent);

// Quick validation
export const validateConfig = (config, tokens, options = {}) => 
    ConfigValidator.validateAgainstTokens(config, tokens, options);

