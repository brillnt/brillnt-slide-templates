/**
 * TemplateProcessor - Orchestrates the entire template processing workflow
 */

import fs from 'fs';
import path from 'path';
import TokenExtractor from './token-extractor.js';
import TokenReplacer from './token-replacer.js';
import ConfigValidator from './config-validator.js';

class TemplateProcessor {
    constructor(options = {}) {
        this.options = {
            errorHandling: 'warn', // 'fail', 'warn', 'graceful'
            missingTokenPlaceholder: '[MISSING]',
            strictValidation: false,
            allowEmptyValues: false,
            warnOnUnused: false,
            cacheTokens: true,
            ...options
        };
    }
    
    /**
     * Process a single template file with config
     * @param {string} templatePath - Path to template file
     * @param {Object} config - Configuration object
     * @param {Object} processingOptions - Override default options for this processing
     * @returns {Object} - Processing result with content, validation, and metadata
     */
    async processTemplate(templatePath, config, processingOptions = {}) {
        const opts = { ...this.options, ...processingOptions };
        
        try {
            // Step 1: Read template content
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            
            // Step 2: Extract tokens from template
            const tokens = opts.cacheTokens 
                ? TokenExtractor.getCachedTokens(templatePath)
                : TokenExtractor.extractTokens(templateContent);
            
            // Step 3: Validate config against required tokens
            const validation = ConfigValidator.validateAgainstTokens(config, tokens, {
                strictMode: opts.strictValidation,
                allowEmpty: opts.allowEmptyValues,
                warnOnUnused: opts.warnOnUnused
            });
            
            // Step 4: Handle validation results
            if (!validation.valid && opts.errorHandling === 'fail') {
                throw new Error(`Template validation failed for ${templatePath}:\n${validation.errors.join('\n')}`);
            }
            
            // Step 5: Replace tokens in content
            const processedContent = TokenReplacer.replaceTokens(templateContent, config, tokens, {
                errorHandling: opts.errorHandling,
                missingTokenPlaceholder: opts.missingTokenPlaceholder
            });
            
            // Step 6: Return comprehensive result
            return {
                success: true,
                templatePath,
                content: processedContent,
                originalContent: templateContent,
                tokens: {
                    found: tokens,
                    total: tokens.length,
                    missing: validation.missing.map(m => m.token),
                    replaced: validation.found.map(f => f.token)
                },
                validation,
                metadata: {
                    processedAt: new Date().toISOString(),
                    options: opts,
                    fileSize: templateContent.length,
                    outputSize: processedContent.length
                }
            };
            
        } catch (error) {
            return {
                success: false,
                templatePath,
                error: error.message,
                metadata: {
                    processedAt: new Date().toISOString(),
                    options: opts
                }
            };
        }
    }
    
    /**
     * Process multiple template files with the same config
     * @param {string[]} templatePaths - Array of template file paths
     * @param {Object} config - Configuration object
     * @param {Object} processingOptions - Override default options
     * @returns {Object} - Batch processing results
     */
    async processMultipleTemplates(templatePaths, config, processingOptions = {}) {
        const results = {
            success: true,
            processed: [],
            failed: [],
            summary: {
                total: templatePaths.length,
                successful: 0,
                failed: 0
            },
            aggregatedTokens: new Set(),
            aggregatedValidation: {
                errors: [],
                warnings: []
            }
        };
        
        for (const templatePath of templatePaths) {
            try {
                const result = await this.processTemplate(templatePath, config, processingOptions);
                
                if (result.success) {
                    results.processed.push(result);
                    results.summary.successful++;
                    
                    // Aggregate tokens
                    result.tokens.found.forEach(token => results.aggregatedTokens.add(token));
                    
                    // Aggregate validation issues
                    if (result.validation.errors) {
                        results.aggregatedValidation.errors.push(...result.validation.errors);
                    }
                    if (result.validation.warnings) {
                        results.aggregatedValidation.warnings.push(...result.validation.warnings);
                    }
                } else {
                    results.failed.push(result);
                    results.summary.failed++;
                    results.success = false;
                }
            } catch (error) {
                results.failed.push({
                    templatePath,
                    error: error.message,
                    success: false
                });
                results.summary.failed++;
                results.success = false;
            }
        }
        
        // Convert Set back to Array
        results.aggregatedTokens = Array.from(results.aggregatedTokens);
        
        return results;
    }
    
    /**
     * Preview what would happen without actually processing
     * @param {string} templatePath - Path to template file
     * @param {Object} config - Configuration object
     * @returns {Object} - Preview of processing results
     */
    previewProcessing(templatePath, config) {
        try {
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            const tokens = TokenExtractor.extractTokens(templateContent);
            
            const validation = ConfigValidator.validateAgainstTokens(config, tokens, {
                strictMode: this.options.strictValidation,
                allowEmpty: this.options.allowEmptyValues,
                warnOnUnused: this.options.warnOnUnused
            });
            
            const replacementPreview = TokenReplacer.previewReplacements(templateContent, config, tokens);
            
            return {
                templatePath,
                tokens,
                validation,
                replacementPreview,
                wouldSucceed: validation.valid || this.options.errorHandling !== 'fail'
            };
        } catch (error) {
            return {
                templatePath,
                error: error.message,
                wouldSucceed: false
            };
        }
    }
    
    /**
     * Set error handling strategy
     * @param {string} strategy - 'fail', 'warn', or 'graceful'
     */
    setErrorHandling(strategy) {
        if (['fail', 'warn', 'graceful'].includes(strategy)) {
            this.options.errorHandling = strategy;
        } else {
            throw new Error(`Invalid error handling strategy: ${strategy}. Must be 'fail', 'warn', or 'graceful'`);
        }
    }
    
    /**
     * Update processing options
     * @param {Object} newOptions - Options to merge with current options
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
    
    /**
     * Get current processing options
     * @returns {Object} - Current options
     */
    getOptions() {
        return { ...this.options };
    }
    
    /**
     * Clear token extraction cache
     */
    clearCache() {
        TokenExtractor.clearCache();
    }
    
    /**
     * Get cache statistics
     * @returns {Object} - Cache statistics
     */
    getCacheStats() {
        return TokenExtractor.getCacheStats();
    }
}

export default TemplateProcessor;

