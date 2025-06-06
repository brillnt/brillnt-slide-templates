#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Template Customization Script
 * 
 * Usage: node scripts/customize-template.js <template-name> <config-file>
 * Example: node scripts/customize-template.js discovery-planning-agreement configs/john-boros.json
 */

function showUsage() {
    console.log('📋 Usage: node scripts/customize-template.js <template-name> <config-file>');
    console.log('📋 Example: node scripts/customize-template.js discovery-planning-agreement configs/john-boros.json');
    console.log('');
    console.log('📁 Available templates:');
    const templatesDir = path.join(__dirname, '..', 'templates');
    if (fs.existsSync(templatesDir)) {
        const templates = fs.readdirSync(templatesDir).filter(item => 
            fs.statSync(path.join(templatesDir, item)).isDirectory()
        );
        templates.forEach(template => console.log(`   - ${template}`));
    }
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

function customizeTemplate(templateName, configFile) {
    try {
        // Validate inputs
        if (!templateName || !configFile) {
            showUsage();
            process.exit(1);
        }
        
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
            process.exit(1);
        }
        
        // Read and parse config
        console.log(`📖 Reading config from: ${configFile}`);
        const configContent = fs.readFileSync(configFile, 'utf8');
        let config;
        
        try {
            config = JSON.parse(configContent);
        } catch (parseError) {
            console.error(`❌ Invalid JSON in config file: ${parseError.message}`);
            process.exit(1);
        }
        
        // Validate config
        const validationErrors = validateConfig(config);
        if (validationErrors.length > 0) {
            console.error('❌ Config validation errors:');
            validationErrors.forEach(error => console.error(`   - ${error}`));
            process.exit(1);
        }
        
        console.log(`✅ Config validated successfully`);
        console.log(`👤 Client: ${config.client_name}`);
        console.log(`📅 Date: ${config.date}`);
        console.log(`💰 Payment: ${config.payment.amount} ${config.payment.description} via ${config.payment.provider}`);
        
        // Generate client slug for directory name
        const clientSlug = generateClientSlug(config.client_name);
        console.log(`📁 Client slug: ${clientSlug}`);
        
        // Create output directory
        const outputDir = path.join(__dirname, '..', 'exports-saved', clientSlug, 'slides');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log(`📁 Created output directory: ${outputDir}`);
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
            const customizedContent = replacePlaceholders(templateContent, config);
            
            // Write customized file
            fs.writeFileSync(outputPath, customizedContent, 'utf8');
            
            console.log(`✅ Generated: ${filename}`);
        });
        
        console.log('');
        console.log(`🎉 Template customization complete!`);
        console.log(`📁 Customized slides saved to: ${outputDir}`);
        console.log(`📋 Files generated: ${templateFiles.length}`);
        console.log('');
        console.log(`💡 Next steps:`);
        console.log(`   - Review the customized slides`);
        console.log(`   - Generate PDFs using: node scripts/convert-to-pdf.js "${outputDir}"`);
        
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

