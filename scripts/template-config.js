/**
 * Template mapping configuration
 * Maps short names to full template directory names
 */

const TEMPLATE_SHORTCUTS = {
    'discovery': 'discovery-planning-agreement',
    'agreement': 'discovery-planning-agreement',
    'planning': 'discovery-planning-agreement'
};

/**
 * Resolve template name using shortcuts or return as-is
 */
function resolveTemplateName(input) {
    return TEMPLATE_SHORTCUTS[input.toLowerCase()] || input;
}

/**
 * Resolve config file path with smart fallbacks
 * 1. If path contains .json or /, use as exact path
 * 2. Otherwise, look in configs/ directory
 * 3. Add .json extension if missing
 */
function resolveConfigPath(input) {
    // If it looks like a path (contains / or .json), use as-is
    if (input.includes('/') || input.includes('.json')) {
        return input;
    }
    
    // Otherwise, assume it's a config name in configs/ directory
    const configName = input.endsWith('.json') ? input : `${input}.json`;
    return `configs/${configName}`;
}

/**
 * Get available template shortcuts
 */
function getTemplateShortcuts() {
    return Object.keys(TEMPLATE_SHORTCUTS);
}

/**
 * Get template mapping for display
 */
function getTemplateMapping() {
    return TEMPLATE_SHORTCUTS;
}

module.exports = {
    resolveTemplateName,
    resolveConfigPath,
    getTemplateShortcuts,
    getTemplateMapping,
    TEMPLATE_SHORTCUTS
};

