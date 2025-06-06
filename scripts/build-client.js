#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Combined Build Script - Customize + Generate PDFs
 * 
 * Usage: node scripts/build-client.js <template-name> <config-file>
 * Example: node scripts/build-client.js discovery john-boros
 * 
 * Runs customization and PDF generation in sequence
 */

function showUsage() {
    console.log('📋 Usage: node scripts/build-client.js <template-name> <config-file>');
    console.log('📋 Example: node scripts/build-client.js discovery john-boros');
    console.log('📋 NPM: npm run build -- discovery john-boros');
    console.log('');
    console.log('🔄 This command runs:');
    console.log('   1. Template customization');
    console.log('   2. PDF generation');
    console.log('   3. Complete client package ready');
}

function runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        console.log(`🔄 Running: ${command} ${args.join(' ')}`);
        
        const child = spawn(command, args, {
            stdio: 'inherit',
            cwd: cwd
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
        
        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function buildClient(templateName, configFile) {
    try {
        if (!templateName || !configFile) {
            showUsage();
            process.exit(1);
        }
        
        const projectRoot = path.join(__dirname, '..');
        
        console.log('🚀 Starting complete client build process...');
        console.log(`📋 Template: ${templateName}`);
        console.log(`📄 Config: ${configFile}`);
        console.log('');
        
        // Step 1: Customize templates
        console.log('📝 Step 1: Customizing templates...');
        const customizeScript = path.join(__dirname, 'customize-template.js');
        await runCommand('node', [customizeScript, templateName, configFile], projectRoot);
        
        console.log('');
        console.log('✅ Step 1 complete: Templates customized');
        console.log('');
        
        // Step 2: Generate PDFs
        console.log('📄 Step 2: Generating PDFs...');
        const pdfScript = path.join(__dirname, 'generate-pdf.js');
        await runCommand('node', [pdfScript, configFile], projectRoot);
        
        console.log('');
        console.log('🎉 Build complete! Client package ready.');
        console.log('');
        console.log('📁 Generated files:');
        console.log('   - Customized HTML slides');
        console.log('   - Individual PDF files');
        console.log('   - Combined PDF document');
        
    } catch (error) {
        console.error('');
        console.error(`❌ Build failed: ${error.message}`);
        process.exit(1);
    }
}

// Main execution
if (require.main === module) {
    const templateName = process.argv[2];
    const configFile = process.argv[3];
    
    buildClient(templateName, configFile);
}

module.exports = { buildClient };

