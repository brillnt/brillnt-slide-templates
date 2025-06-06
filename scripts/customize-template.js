#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { resolveTemplateName, resolveConfigPath, getTemplateMapping } = require('./template-config');
const { getDisplayPath, getDisplayDir } = require('./path-utils');
const { processConfig } = require('./config-system');

/**
 * Template Customization Script
 * 
 * Usage: node scripts/customize-template.js <template-name> <config-file>
 * Example: node scripts/customize-template.js discovery john-boros
 * 
 * Template shortcuts: discovery, agreement, planning → discovery-planning-agreement
 * Config resolution: john-boros → configs/john-boros.json
 */

function showUsage() {
    console.log('📋 Usage: node scripts/customize-template.js <template-name> <config-file>');
    console.log('📋 Example: node scripts/customize-template.js discovery john-boros');
    console.log('📋 NPM: npm run customize -- discovery john-boros');
    console.log('');
    
    console.log('🔗 Template shortcuts:');
    const mapping = getTemplateMapping();
    Object.entries(mapping).forEach(([shortcut, fullName]) => {
        console.log(`   ${shortcut} → ${fullName}`);
    });
    console.log('');
    
    console.log('📁 Available templates:');
    const templatesDir = path.join(__dirname, '..', 'templates');
    if (fs.existsSync(templatesDir)) {
        const templates = fs.readdirSync(templatesDir).filter(item => 
            fs.statSync(path.join(templatesDir, item)).isDirectory()
        );
        templates.forEach(template => console.log(`   - ${template}`));
    }
    console.log('');
    
    console.log('📄 Config resolution:');
    console.log('   john-boros → configs/john-boros.json');
    console.log('   configs/my-client.json → configs/my-client.json');
    console.log('   ./my-config.json → ./my-config.json');
}

function validateConfig(config) {
    const errors = [];
    
    // Required fields
    if (!config.client_name || config.client_name.trim() === '') {
        errors.push('client_name is required');
    }
    
    if (!config.date || config.date.trim() === '') {
        errors.push('date is required');
    }
    
    // Payment validation
    if (!config.payment) {
        errors.push('payment object is required');
    } else {
        if (!config.payment.amount) {
            errors.push('payment.amount is required');
        }
        if (!config.payment.description) {
            errors.push('payment.description is required');
        }
        if (!config.payment.provider) {
            errors.push('payment.provider is required');
        }
    }
    
    return errors;
}

function replacePlaceholders(content, config) {
    let result = content;
    
    // Replace basic placeholders
    result = result.replace(/\{\{client_name\}\}/g, config.client_name);
    result = result.replace(/\{\{date\}\}/g, config.date);
    
    // Replace payment placeholders
    if (config.payment) {
        result = result.replace(/\{\{payment\.amount\}\}/g, config.payment.amount);
        result = result.replace(/\{\{payment\.description\}\}/g, config.payment.description);
        result = result.replace(/\{\{payment\.provider\}\}/g, config.payment.provider);
    }
    
    return result;
}

function generateClientSlug(clientName) {
    return clientName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
}

function customizeTemplate(templateNameInput, configFileInput) {
    try {
        // Validate inputs
        if (!templateNameInput || !configFileInput) {
            showUsage();
            process.exit(1);
        }
        
        // Resolve template name and config path using smart conventions
        const templateName = resolveTemplateName(templateNameInput);
        const configFile = resolveConfigPath(configFileInput);
        
        console.log(`🔗 Template: "${templateNameInput}" → "${templateName}"`);
        console.log(`📄 Config: "${configFileInput}" → "${configFile}"`);
        console.log('');
        
        // Check if template exists
        const templateDir = path.join(__dirname, '..', 'templates', templateName);
        if (!fs.existsSync(templateDir)) {
            console.error(`❌ Template "${templateName}" not found`);
            console.error(`📁 Template directory: ${templateDir}`);
            showUsage();
            process.exit(1);
        }
        
        // Check if config file exists
        if (!fs.existsSync(configFile)) {
            console.error(`❌ Config file "${configFile}" not found`);
            console.error(`💡 Tip: Use "john-boros" to auto-find "configs/john-boros.json"`);
            process.exit(1);
        }
        
        // Read and parse config
        console.log(`📖 Reading config from: ${configFile}`);
        const configContent = fs.readFileSync(configFile, 'utf8');
        let config;
        
        try {
            const rawConfig = JSON.parse(configContent);
            
            // Process config with defaults and enhanced validation
            config = processConfig(rawConfig);
            
        } catch (parseError) {
            if (parseError.message.includes('Configuration validation failed')) {
                console.error(parseError.message);
                process.exit(1);
            } else {
                console.error(`❌ Invalid JSON in config file: ${parseError.message}`);
                process.exit(1);
            }
        }
        
        console.log(`✅ Config validated successfully`);
        console.log(`👤 Client: ${config.client_name}`);
        console.log(`📅 Date: ${config.date}`);
        console.log(`💰 Payment: ${config.payment.amount} ${config.payment.description} via ${config.payment.provider}`);
        
        // Generate client slug for directory name
        const clientSlug = generateClientSlug(config.client_name);
        console.log(`📁 Client slug: ${clientSlug}`);
        
        // Create output directory
        const outputDir = path.join(__dirname, '..', 'exports', clientSlug, 'slides');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log(`📁 Created output directory: ${getDisplayDir(outputDir)}`);
        }
        
        // Copy assets to client directory for self-contained package
        const assetsSourceDir = path.join(__dirname, '..', 'assets');
        const assetsTargetDir = path.join(__dirname, '..', 'exports', clientSlug, 'assets');
        
        if (fs.existsSync(assetsSourceDir)) {
            if (!fs.existsSync(assetsTargetDir)) {
                fs.mkdirSync(assetsTargetDir, { recursive: true });
            }
            
            // Copy all files from assets directory
            const assetFiles = fs.readdirSync(assetsSourceDir);
            assetFiles.forEach(file => {
                const sourcePath = path.join(assetsSourceDir, file);
                const targetPath = path.join(assetsTargetDir, file);
                fs.copyFileSync(sourcePath, targetPath);
            });
            
            console.log(`📁 Copied ${assetFiles.length} asset files to client directory`);
        }
        
        // Get all HTML files from template
        const templateFiles = fs.readdirSync(templateDir)
            .filter(file => file.endsWith('.html'))
            .sort();
        
        console.log(`🔄 Processing ${templateFiles.length} template files...`);
        
        // Process each template file
        templateFiles.forEach(filename => {
            const inputPath = path.join(templateDir, filename);
            const outputPath = path.join(outputDir, filename);
            
            // Read template content
            const templateContent = fs.readFileSync(inputPath, 'utf8');
            
            // Replace placeholders
            let customizedContent = replacePlaceholders(templateContent, config);
            
            // Update asset paths to use local assets directory
            customizedContent = customizedContent.replace(/\.\.\/\.\.\/assets\//g, '../assets/');
            
            // Write customized file
            fs.writeFileSync(outputPath, customizedContent, 'utf8');
            
            console.log(`✅ Generated: ${filename}`);
        });
        
        console.log('');
        console.log(`🎉 Template customization complete!`);
        console.log(`📁 Customized slides saved to: ${getDisplayDir(outputDir)}`);
        console.log(`📋 Files generated: ${templateFiles.length}`);
        console.log('');
        console.log(`💡 Next steps:`);
        console.log(`   - Review the customized slides`);
        console.log(`   - Generate PDFs using: node scripts/convert-to-pdf.js "${getDisplayPath(outputDir)}"`);
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Main execution
if (require.main === module) {
    const templateName = process.argv[2];
    const configFile = process.argv[3];
    
    customizeTemplate(templateName, configFile);
}

module.exports = { customizeTemplate, validateConfig, replacePlaceholders };

