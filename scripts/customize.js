/**
 * Modern Customize Script - Uses generic token replacement system
 * Works with any template structure and JSON configuration
 */

const fs = require('fs');
const path = require('path');
const { TemplateProcessor } = require('./token-replacement');
const { resolveTemplateName, resolveConfigPath } = require('./lib/template');
const { processConfig } = require('./lib/config');
const { getDisplayPath, getDisplayDir } = require('./lib/utils');

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest) {
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
 * Generate client slug from client name
 */
function generateClientSlug(clientName) {
    return clientName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/-+/g, '-')          // Replace multiple hyphens with single
        .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
}

/**
 * Process all templates in a template directory
 */
async function processTemplateDirectory(templateDir, config, outputDir) {
    const processor = new TemplateProcessor({
        errorHandling: 'warn',
        strictValidation: false,
        allowEmptyValues: false,
        cacheTokens: true
    });
    
    // Find all HTML files in template directory
    const htmlFiles = fs.readdirSync(templateDir)
        .filter(file => file.endsWith('.html'))
        .map(file => path.join(templateDir, file));
    
    if (htmlFiles.length === 0) {
        throw new Error(`No HTML template files found in ${templateDir}`);
    }
    
    console.log(`🔍 Found ${htmlFiles.length} template files`);
    
    // Process all templates
    const results = await processor.processMultipleTemplates(htmlFiles, config);
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created output directory: ${getDisplayDir(outputDir)}`);
    }
    
    // Write processed files
    let processedCount = 0;
    for (const result of results.processed) {
        if (result.success) {
            const fileName = path.basename(result.templatePath);
            const outputPath = path.join(outputDir, fileName);
            
            fs.writeFileSync(outputPath, result.content, 'utf8');
            console.log(`✅ Processed: ${fileName}`);
            processedCount++;
        }
    }
    
    // Report any failures
    if (results.failed.length > 0) {
        console.log(`⚠️  ${results.failed.length} files failed to process:`);
        for (const failure of results.failed) {
            console.log(`   ❌ ${path.basename(failure.templatePath)}: ${failure.error}`);
        }
    }
    
    // Show token summary
    if (results.aggregatedTokens.length > 0) {
        console.log(`📊 Tokens used: ${results.aggregatedTokens.join(', ')}`);
    }
    
    return {
        processed: processedCount,
        failed: results.failed.length,
        tokens: results.aggregatedTokens
    };
}

/**
 * Main customization function
 */
async function customizeTemplate(templateName, configFile) {
    try {
        console.log('🚀 Template Customization Starting...');
        console.log('');
        
        // Resolve template name and config path
        const resolvedTemplateName = resolveTemplateName(templateName);
        const resolvedConfigPath = resolveConfigPath(configFile);
        
        console.log(`📋 Template: ${resolvedTemplateName}`);
        console.log(`📖 Config: ${getDisplayPath(resolvedConfigPath)}`);
        console.log('');
        
        // Validate template directory exists
        const templateDir = path.join(__dirname, '..', 'templates', resolvedTemplateName);
        if (!fs.existsSync(templateDir)) {
            throw new Error(`Template directory not found: ${templateDir}`);
        }
        
        // Read and process config
        const rawConfig = JSON.parse(fs.readFileSync(resolvedConfigPath, 'utf8'));
        const config = processConfig(rawConfig);
        const clientSlug = generateClientSlug(config.client_name);
        
        console.log(`👤 Client: ${config.client_name}`);
        console.log(`📂 Slug: ${clientSlug}`);
        console.log('');
        
        // Set up output directories
        const outputDir = path.join(__dirname, '..', 'exports', clientSlug, 'slides');
        const assetsSourceDir = path.join(__dirname, '..', 'assets');
        const assetsTargetDir = path.join(__dirname, '..', 'exports', clientSlug, 'assets');
        
        // Process templates
        const results = await processTemplateDirectory(templateDir, config, outputDir);
        
        // Copy assets
        if (fs.existsSync(assetsSourceDir)) {
            copyDirectory(assetsSourceDir, assetsTargetDir);
            console.log(`📁 Assets copied to: ${getDisplayDir(assetsTargetDir)}`);
        }
        
        console.log('');
        console.log('✅ Customization Complete!');
        console.log(`📊 Processed: ${results.processed} files`);
        if (results.failed > 0) {
            console.log(`⚠️  Failed: ${results.failed} files`);
        }
        console.log(`📁 Output: ${getDisplayDir(outputDir)}`);
        
        return {
            success: true,
            clientSlug,
            outputDir,
            results
        };
        
    } catch (error) {
        console.error('❌ Customization failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Command line usage
function showUsage() {
    console.log('Usage: node customize.js <template> <config>');
    console.log('');
    console.log('Examples:');
    console.log('  node customize.js discovery john-boros');
    console.log('  node customize.js discovery-planning-agreement configs/maria.json');
    console.log('');
    console.log('Template shortcuts:');
    console.log('  discovery, agreement, planning → discovery-planning-agreement');
}

// Main execution
if (require.main === module) {
    const templateName = process.argv[2];
    const configFile = process.argv[3];
    
    if (!templateName || !configFile) {
        showUsage();
        process.exit(1);
    }
    
    customizeTemplate(templateName, configFile)
        .then(result => {
            if (!result.success) {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Unexpected error:', error.message);
            process.exit(1);
        });
}

module.exports = { customizeTemplate };

