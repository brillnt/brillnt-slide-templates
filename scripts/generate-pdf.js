/**
 * Modern PDF Generation Script - Uses new modular system
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { resolveConfigPath } = require('./lib/template');
const { processConfig } = require('./lib/config');
const { getDisplayPath, getDisplayDir } = require('./lib/utils');

/**
 * Generate client slug from client name
 */
function generateClientSlug(clientName) {
    return clientName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Generate PDFs for a client
 */
async function generatePDF(configFile) {
    try {
        console.log('🚀 PDF Generation Starting...');
        console.log('');
        
        // Resolve config path
        const resolvedConfigPath = resolveConfigPath(configFile);
        console.log(`📖 Config: ${getDisplayPath(resolvedConfigPath)}`);
        
        // Read and process config
        const rawConfig = JSON.parse(fs.readFileSync(resolvedConfigPath, 'utf8'));
        const config = processConfig(rawConfig);
        const clientSlug = generateClientSlug(config.client_name);
        
        console.log(`👤 Client: ${config.client_name}`);
        console.log(`📂 Slug: ${clientSlug}`);
        console.log('');
        
        // Check if slides directory exists
        const exportsDir = path.join(__dirname, '..', 'exports');
        if (!fs.existsSync(exportsDir)) {
            console.log('   (No exports directory found)');
            console.log('   Run customize first: npm run customize -- <template> <config>');
            return { success: false, error: 'No exports directory found' };
        }
        
        // Find slides directory
        const slidesDir = path.join(__dirname, '..', 'exports', clientSlug, 'slides');
        if (!fs.existsSync(slidesDir)) {
            console.log(`   (No slides found for client: ${clientSlug})`);
            console.log('   Run customize first: npm run customize -- <template> <config>');
            return { success: false, error: 'No slides found for client' };
        }
        
        // Create PDFs directory
        const pdfsDir = path.join(__dirname, '..', 'exports', clientSlug, 'pdfs');
        if (!fs.existsSync(pdfsDir)) {
            fs.mkdirSync(pdfsDir, { recursive: true });
            console.log(`📁 Created PDFs directory: ${getDisplayDir(pdfsDir)}`);
        }
        
        // Run PDF conversion
        const convertScript = path.join(__dirname, 'lib', 'pdf.js');
        
        return new Promise((resolve) => {
            const child = spawn('node', [convertScript, slidesDir], {
                stdio: 'inherit',
                cwd: path.join(__dirname, '..')
            });
            
            child.on('close', (code) => {
                if (code === 0) {
                    console.log('');
                    console.log('✅ PDF Generation Complete!');
                    console.log(`📁 PDFs saved to: ${getDisplayDir(pdfsDir)}`);
                    resolve({ success: true, clientSlug, pdfsDir });
                } else {
                    console.error('❌ PDF generation failed');
                    resolve({ success: false, error: 'PDF conversion failed' });
                }
            });
        });
        
    } catch (error) {
        console.error('❌ PDF generation failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Command line usage
function showUsage() {
    console.log('Usage: node generate-pdf.js <config>');
    console.log('');
    console.log('Examples:');
    console.log('  node generate-pdf.js john-boros');
    console.log('  node generate-pdf.js configs/maria.json');
    console.log('');
    console.log('Note: Run customize first to generate slides');
}

// Main execution
if (require.main === module) {
    const configFile = process.argv[2];
    
    if (!configFile) {
        showUsage();
        process.exit(1);
    }
    
    generatePDF(configFile)
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

module.exports = { generatePDF };

