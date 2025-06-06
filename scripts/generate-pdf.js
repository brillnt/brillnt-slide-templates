#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { resolveConfigPath } = require('./template-config');
const { getDisplayPath, getDisplayDir } = require('./path-utils');

/**
 * PDF Generation Script for Client Slides
 * 
 * Usage: node scripts/generate-pdf.js <config-file>
 * Example: node scripts/generate-pdf.js john-boros
 * 
 * Reads config to get client name, finds slides, and generates PDFs
 */

function showUsage() {
    console.log('📋 Usage: node scripts/generate-pdf.js <config-file>');
    console.log('📋 Example: node scripts/generate-pdf.js john-boros');
    console.log('📋 NPM: npm run pdf -- john-boros');
    console.log('');
    console.log('📁 Available clients:');
    
    const exportsDir = path.join(__dirname, '..', 'exports');
    if (fs.existsSync(exportsDir)) {
        const clients = fs.readdirSync(exportsDir).filter(item => 
            fs.statSync(path.join(exportsDir, item)).isDirectory()
        );
        if (clients.length > 0) {
            clients.forEach(client => console.log(`   - ${client}`));
        } else {
            console.log('   (No client slides found)');
        }
    } else {
        console.log('   (No exports directory found)');
    }
}

function generateClientSlug(clientName) {
    return clientName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
}

function generatePDF(configFileInput) {
    try {
        if (!configFileInput) {
            showUsage();
            process.exit(1);
        }
        
        // Resolve config path using smart conventions
        const configFile = resolveConfigPath(configFileInput);
        console.log(`📄 Config: "${configFileInput}" → "${configFile}"`);
        
        // Check if config file exists
        if (!fs.existsSync(configFile)) {
            console.error(`❌ Config file "${configFile}" not found`);
            console.error(`💡 Tip: Use "john-boros" to auto-find "configs/john-boros.json"`);
            process.exit(1);
        }
        
        // Read and parse config to get client name
        console.log(`📖 Reading config from: ${configFile}`);
        const configContent = fs.readFileSync(configFile, 'utf8');
        let config;
        
        try {
            config = JSON.parse(configContent);
        } catch (parseError) {
            console.error(`❌ Invalid JSON in config file: ${parseError.message}`);
            process.exit(1);
        }
        
        if (!config.client_name) {
            console.error(`❌ Config file missing required "client_name" field`);
            process.exit(1);
        }
        
        // Generate client slug from actual client name (same logic as customize script)
        const clientSlug = generateClientSlug(config.client_name);
        console.log(`👤 Client: "${config.client_name}" → "${clientSlug}"`);
        
        // Find slides directory
        const slidesDir = path.join(__dirname, '..', 'exports', clientSlug, 'slides');
        if (!fs.existsSync(slidesDir)) {
            console.error(`❌ Client slides not found: ${slidesDir}`);
            console.error(`💡 Run customization first: npm run customize -- discovery ${configFileInput}`);
            showUsage();
            process.exit(1);
        }
        
        // Create PDFs directory
        const pdfsDir = path.join(__dirname, '..', 'exports', clientSlug, 'pdfs');
        if (!fs.existsSync(pdfsDir)) {
            fs.mkdirSync(pdfsDir, { recursive: true });
            console.log(`📁 Created PDFs directory: ${getDisplayDir(pdfsDir)}`);
        }
        
        console.log(`🚀 Generating PDFs for client: ${clientSlug}`);
        console.log(`📁 Slides source: ${getDisplayDir(slidesDir)}`);
        console.log(`📁 PDFs output: ${getDisplayDir(pdfsDir)}`);
        console.log('');
        
        // Use existing convert-to-pdf script with custom output
        const { spawn } = require('child_process');
        const convertScript = path.join(__dirname, 'convert-to-pdf.js');
        
        const child = spawn('node', [convertScript, slidesDir, pdfsDir], {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log('');
                console.log(`🎉 PDF generation complete!`);
                console.log(`📁 PDFs saved to: ${getDisplayDir(pdfsDir)}`);
            } else {
                console.error(`❌ PDF generation failed with code ${code}`);
                process.exit(1);
            }
        });
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Main execution
if (require.main === module) {
    const configFile = process.argv[2];
    generatePDF(configFile);
}

module.exports = { generatePDF };

